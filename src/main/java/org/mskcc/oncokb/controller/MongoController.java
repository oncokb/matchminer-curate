package org.mskcc.oncokb.controller;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONObject;
import org.mskcc.oncokb.controller.api.MongoApi;
import org.mskcc.oncokb.model.*;
import org.mskcc.oncokb.service.util.FileUtil;
import org.mskcc.oncokb.service.util.HttpUtil;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.io.*;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * @author jingsu
 * This controller is used for running MatchEngine.
 * It will call load() and match() methos in MatchEngine.
 */

@Controller
public class MongoController implements MongoApi{

    @Value("${application.oncokb.api.match-variant}")
    private String oncokbMatchVariantApi;

    @RequestMapping(value = "/mongo/loadTrial",
        consumes = {"application/json"},
        method = RequestMethod.POST)
    public ResponseEntity<Void> loadTrial(@RequestBody(required = true) TrialJson body) {
        try{
            String fileType = "-t";
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = ow.writeValueAsString(body.getTrial());

            String prefix = "trial";
            String suffix = ".json";

            // this temporary file remains after the jvm exits
            File tempFile = File.createTempFile(prefix, suffix);
            String trialPath = FileUtil.buildJsonTempFile(json, tempFile);

            ProcessBuilder pb = new ProcessBuilder("python",
                System.getenv("CATALINA_HOME") +
                    "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py",
                "load", fileType, trialPath, "--trial-format", "json", "--mongo-uri", "mongodb://127.0.0.1:27017");
            Boolean isLoad = runPythonScript(pb);

            if(!isLoad) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (Exception e){
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    @RequestMapping(value = "/mongo/match",
        consumes = {"application/json"},
//        produces = {"application/json"},
        method = RequestMethod.POST)
    public ResponseEntity<Void> matchTrial(@RequestBody(required = true) Patients body) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
        List<Clinical> clinicals = body.getClinicals();
        List<Genomic> genomics = body.getGenomics();

        try {
            List<Genomic> annotatedGenomics = annotateOncokbVriant(genomics);

            if(annotatedGenomics == null) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            File clinicalTempFile = File.createTempFile("clinical", ".json");
            File genomicTempFile = File.createTempFile("genomic", ".json");
            JSONArray clinicalArray = new JSONArray();
            JSONArray genomicArray = new JSONArray();

            for(Clinical clinical: clinicals){
                JSONObject jsonObject = new JSONObject();
//                for (Field field: clinical.getClass().getDeclaredFields()) {
//                    String dashKey = CaseFormat.LOWER_CAMEL.to(CaseFormat.UPPER_UNDERSCORE, field.getName());
//                }
                jsonObject.put("CLINICAL_ID", clinical.getClinicalId());
                jsonObject.put("SAMPLE_ID", clinical.getSampleId());
                jsonObject.put("ORD_PHYSICIAN_NAME", clinical.getOrdPhysicianName());
                jsonObject.put("ORD_PHYSICIAN_EMAIL", clinical.getOrdPhysicianEmail());
                jsonObject.put("ONCOTREE_PRIMARY_DIAGNOSIS_NAME", clinical.getOncotreePrimaryDiagnosisName());
                jsonObject.put("REPORT_DATE", clinical.getReportDate());
                jsonObject.put("VITAL_STATUS", clinical.getVitalStatus());
                jsonObject.put("FIRST_LAST", clinical.getFirstLast());
                jsonObject.put("BIRTH_DATE", clinical.getBirthDate());
                jsonObject.put("DFCI_MRN", clinical.getMrn());
                jsonObject.put("GENDER", clinical.getGender());
                clinicalArray.put(jsonObject);
            }

            for(Genomic genomic: annotatedGenomics){
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("GENOMIC_ID", genomic.getGenomicId());
                jsonObject.put("SAMPLE_ID", genomic.getSampleId());
                jsonObject.put("TRUE_HUGO_SYMBOL", genomic.getTrueHugoSymbol());
                jsonObject.put("TRUE_PROTEIN_CHANGE", genomic.getTrueProteinChange());
                jsonObject.put("TRUE_VARIANT_CLASSIFICATION", genomic.getTrueVariantClassification());
                jsonObject.put("VARIANT_CATEGORY", genomic.getVariantCategory());
                jsonObject.put("CNV_CALL", genomic.getCnvCall());
                jsonObject.put("WILDTYPE", genomic.getWildtype());
                jsonObject.put("CHROMOSOME", genomic.getChromosome());
                jsonObject.put("POSITION", genomic.getPosition());
                jsonObject.put("TRUE_CDNA_CHANGE", genomic.getTrueCdnaChange());
                jsonObject.put("REFERENCE_ALLELE", genomic.getReferenceAllele());
                jsonObject.put("TRUE_TRANSCRIPT_EXON", genomic.getTrueTranscriptExon());
                jsonObject.put("CANONICAL_STRAND", genomic.getCanonicalStand());
                jsonObject.put("ALLELE_FRACTION", genomic.getAlleleFraction());
                jsonObject.put("TIER", genomic.getTier());
                jsonObject.put("ONCOKB_VARIANT",genomic.getOncokbVariant().toString());
                genomicArray.put(jsonObject);
            }
            ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
            String clinicalJson = ow.writeValueAsString(clinicalArray);
            String genomicJson = ow.writeValueAsString(genomicArray);

            String clinicalPath = FileUtil.buildJsonTempFile(clinicalJson, clinicalTempFile);
            String genomicPath = FileUtil.buildJsonTempFile(genomicJson, genomicTempFile);

            ProcessBuilder loadPb = new ProcessBuilder("python", System.getenv("CATALINA_HOME") +
                "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py",
                "load", "-c", clinicalPath, "-g", genomicPath, "--patient-format", "json",
                "--mongo-uri", "mongodb://127.0.0.1:27017");
            Boolean isLoad = runPythonScript(loadPb);

            if(isLoad) {
                // run MatchEngine match()
                ProcessBuilder matchPb = new ProcessBuilder("python", System.getenv("CATALINA_HOME") +
                    "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py",
                    "match", "--mongo-uri", "mongodb://127.0.0.1:27017");
                Boolean isMatch = runPythonScript(matchPb);

                if(isMatch) {
                    // export matched result from collection "trial_match" in MongoDB "matchminer"
                    List<Document> matchedTrialDocs = MongoUtil.getCollection("trial_match");
                } else {
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            clinicalTempFile.delete();
            genomicTempFile.delete();

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    public Boolean runPythonScript(ProcessBuilder pb) throws IOException, InterruptedException{
        Process p = pb.start();
        String error = "";
        BufferedReader stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
        int exitCode = p.waitFor();
        // read any errors from the attempted command
        if (exitCode != 0) {
            System.out.println("Here is the standard error of the command (if any):\n");
            while ((error = stdError.readLine()) != null) {
                System.out.println(error);
            }
            stdError.close();
        }
        return exitCode == 0 ? true :false;
    }

    public List<Genomic> annotateOncokbVriant(List<Genomic> genomics) {

        List<Genomic> results = new ArrayList<>(genomics);

        try {
            Set<MatchVariant> matchVariants = new HashSet<>();
            List<Query> queries = new ArrayList<>();
            Map<String, Set<String>> oncoVaMap = new HashMap<>();

            // get genomic attributes for querying "oncokb_variant"
            for (Genomic genomic: genomics) {
                String sampleId = genomic.getSampleId();
                String hugoSymbol = genomic.getTrueHugoSymbol();
                String proteinChange = genomic.getTrueProteinChange();

                // each item of "oncoKbVariants" should be unique
                if (oncoVaMap.containsKey(hugoSymbol)) {
                    oncoVaMap.get(hugoSymbol).add(proteinChange);
                } else {
                    Set<String> proteinChangeSet = new HashSet<>() ;
                    proteinChangeSet.add(proteinChange);
                    oncoVaMap.put(hugoSymbol, proteinChangeSet);
                }

                Query query = new Query();
                query.setId(sampleId);
                query.setHugoSymbol(hugoSymbol);
                query.setAlteration(proteinChange);
                queries.add(query);
            }

            // flatten oncoVaMap
            Set<String> keys = oncoVaMap.keySet();
            for(String key: keys){
                Set<String> valuesSet = oncoVaMap.get(key);
                String[] valuesArr = valuesSet.toArray(new String[valuesSet.size()]);
                for (int i = 0; i < valuesArr.length; i++) {
                    MatchVariant matchVariant = new MatchVariant();
                    matchVariant.setHugoSymbol(key);
                    matchVariant.setAlteration(valuesArr[i]);
                    matchVariants.add(matchVariant);
                }
            }

            MatchVariantRequest request = new MatchVariantRequest();
            request.setOncokbVariants(matchVariants);
            request.setQueries(queries);

            ObjectMapper mapper = new ObjectMapper();
            String postBody = mapper.writeValueAsString(request);
            String response = HttpUtil.postRequest(oncokbMatchVariantApi, postBody, true);

            if (response != null && response != "TIMEOUT") {
                JSONArray outputArr = new JSONArray(response);
                //Iterate output
                for (int i = 0; i < outputArr.length(); i++) {
                    JSONObject outputObj = outputArr.getJSONObject(i);
                    JSONArray resultArr = new JSONArray(outputObj.get("result").toString());

                    //Iterate "results" in output and add each "alteration" to alterationList
                    ArrayList<String> alterationList = new ArrayList<String>();
                    for (int j = 0; j < resultArr.length(); j++) {
                        JSONObject resultObj = resultArr.getJSONObject(j);
                        alterationList.add(resultObj.getString("alteration"));
                    }
                    results.get(i).setOncokbVariant(alterationList);
                }
            } else {
                return null;
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
        return results;
    }

    public List<TrialMatch> capsulateTrialMatchDoc(List<Document> documents) {
        List<TrialMatch> trialMatches = new ArrayList<>();
        for (Document doc: documents) {
            TrialMatch trialMatch = new TrialMatch();
            trialMatch.setClinicalId(doc.get("clinical_id").toString());
            trialMatch.setSampleId(doc.get("sample_id").toString());
            trialMatch.setOrdPhysicianName(doc.get("ord_physician_name").toString());
            trialMatch.setOrdPhysicianEmail(doc.get("ord_physician_email").toString());
            trialMatch.setOncotreePrimaryDiagnosisName(doc.get("oncotree_primary_diagnosis_name").toString());
            trialMatch.setVitalStatus(doc.get("vital_status").toString());
            trialMatch.setFirstLast(doc.get("first_last").toString());
            trialMatch.setReportDate(doc.get("report_date").toString());
            trialMatch.setMrn((Integer)doc.get("mrn"));

            trialMatches.add(trialMatch);
        }

        return trialMatches;
    }



}

