package org.mskcc.oncokb.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.github.mongobee.changeset.ChangeSet;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import io.swagger.annotations.ApiParam;
import org.bson.Document;
import org.mskcc.oncokb.model.QueryData;
import org.mskcc.oncokb.service.util.MatchEngineUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

import javax.validation.Valid;
import java.io.*;
import java.util.*;

import static com.mongodb.client.model.Projections.exclude;

/**
 * @author jingsu
 */

@Controller
public class MatchController {

    private static final MongoClient mongoClient = new MongoClient( "localhost" , 27017 );;
    private static final MongoDatabase mongoDb = mongoClient.getDatabase("matchminer");

    @RequestMapping(value = "/match",
        method = RequestMethod.POST)
    public ResponseEntity<String> match(@ApiParam(value = "clinical data and genomic data json objects" ,required=true )
                                          @Valid @RequestBody QueryData queryData) {
        String matchedResults = "";
        try {
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String clinicalJson = ow.writeValueAsString(queryData.getClinical());
            String genomicJson = ow.writeValueAsString(queryData.getGenomic());
            String annotatedGenomicJson = annotateOncokbVriant(genomicJson);

            // this temporary file remains after the function exits
            File clinicalTempFile = File.createTempFile("clinical", ".json");
            File genomicTempFile = File.createTempFile("genomic", ".json");
            MatchEngineUtil meUtil = new MatchEngineUtil();
            String clinicalPath = meUtil.buildTempFile(clinicalJson, clinicalTempFile);
            String genomicPath = meUtil.buildTempFile(annotatedGenomicJson, genomicTempFile);

            ProcessBuilder loadPb = new ProcessBuilder("python", System.getenv("CATALINA_HOME") +
                "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py",
                "load", "-c", clinicalPath, "-g", genomicPath, "--patient-format", "json",
                "--mongo-uri", "mongodb://127.0.0.1:27017");
            Boolean isLoad = meUtil.runPythonScript(loadPb);

            if(isLoad) {
                // run MatchEngine match()
                ProcessBuilder matchPb = new ProcessBuilder("python", System.getenv("CATALINA_HOME") +
                    "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py",
                    "match", "--mongo-uri", "mongodb://127.0.0.1:27017");
                Boolean isMatch = meUtil.runPythonScript(matchPb);

                if(isMatch) {
                    // export matched result from collection "trial_match" in MongoDB "matchminer"
                    matchedResults = getCollection(mongoDb, "trial_match").toString();

                } else {
                    return new ResponseEntity<>("Run MatchEngine match() failed.", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                return new ResponseEntity<>("Run MatchEngine load() failed.", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            clinicalTempFile.delete();
            genomicTempFile.delete();

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Exception found", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(matchedResults, HttpStatus.OK);
    }

    public String annotateOncokbVriant(String genomicJson) {

        String genomicArrJson = "";

        try {
            JSONArray genomicArr = new JSONArray(genomicJson);
            JSONArray oncokbVariantsArr = new JSONArray();
            JSONArray queriesArr = new JSONArray();
            Map<String, Set<String>> oncoVaMap = new HashMap<>();

            // get genomic attributes for querying "oncokb_variant"
            for (int i = 0; i < genomicArr.length(); i++) {
                JSONObject jsonObj = genomicArr.getJSONObject(i);
                String sample_id = jsonObj.getString("SAMPLE_ID");
                String hugo_symbol = jsonObj.getString("TRUE_HUGO_SYMBOL");
                String protein_change = jsonObj.getString("TRUE_PROTEIN_CHANGE");

                // each item of "oncoKbVariants" should be unique
                if (oncoVaMap.containsKey(hugo_symbol)) {
                    oncoVaMap.get(hugo_symbol).add(protein_change);
                } else {
                    Set<String> proteinChangeSet = new HashSet<>() ;
                    proteinChangeSet.add(protein_change);
                    oncoVaMap.put(hugo_symbol, proteinChangeSet);
                }

                JSONObject queriesObj = new JSONObject();
                queriesObj.put("id", sample_id);
                queriesObj.put("hugoSymbol", hugo_symbol);
                queriesObj.put("alteration", protein_change);
                queriesArr.put(queriesObj);
            }

            Set<String> keys = oncoVaMap.keySet();
            for(String key: keys){
                Set<String> valuesSet = oncoVaMap.get(key);
                String[] valuesArr = valuesSet.toArray(new String[valuesSet.size()]);
                for (int i = 0; i < valuesArr.length; i++) {
                    JSONObject oncoVaObj = new JSONObject();
                    oncoVaObj.put("hugoSymbol", key);
                    oncoVaObj.put("alteration", valuesArr[i]);
                    oncokbVariantsArr.put(oncoVaObj);
                }

            }

            JSONObject requestJsonObj = new JSONObject();
            requestJsonObj.put("oncokbVariants", oncokbVariantsArr);
            requestJsonObj.put("queries", queriesArr);

            // send request input to OncoKB match api
            Client client = Client.create();
            String baseUrl = "http://dashi-dev.cbio.mskcc.org:8080/endpoints-mm/api/private/utils/match/variant";
            WebResource webResource = client.resource(baseUrl);
            // POST method
            ClientResponse response = webResource.accept("application/json")
                .type("application/json").post(ClientResponse.class, requestJsonObj.toString());

            // check response status code
            if (response.getStatus() != 200) {
                throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
            }

            // get output from the match api
            String output = response.getEntity(String.class);
            JSONArray outputArr = new JSONArray(output);
            //Iterate output
            for (int i = 0; i < outputArr.length(); i++) {
                JSONObject outputObj = outputArr.getJSONObject(i);
                JSONArray resultArr = new JSONArray(outputObj.get("result").toString());

                ArrayList<String> alterationList = new ArrayList<String>();
                //Iterate "results" in output and add each "alteration" to alterationList
                for (int j = 0; j < resultArr.length(); j++) {
                    JSONObject resultObj = resultArr.getJSONObject(j);
                    alterationList.add(resultObj.getString("alteration"));
                }

                // annotate "ONCOKB_VARIANT" for each genomic record
                genomicArr.getJSONObject(i).put("ONCOKB_VARIANT",alterationList.toString());
            }

            genomicArrJson = genomicArr.toString();

        } catch(JSONException e) {
            e.printStackTrace();
        }

        return genomicArrJson;

    }

    @ChangeSet(order = "001", id = "getCollectionFromMongoDatabase", author = "jingsu")
    public List<String> getCollection(MongoDatabase db, String collectionName) {
        List<String> jsonList = new ArrayList<>();
        try {
            MongoCollection<Document> collection = db.getCollection(collectionName);
            MongoCursor<Document> cursor = collection.find().projection(exclude("_id")).iterator();
            while (cursor.hasNext()) {
                Document doc = cursor.next();
                JSONObject jsonObj = new JSONObject(doc.toJson());
                jsonList.add(jsonObj.toString());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return jsonList;
    }

}
