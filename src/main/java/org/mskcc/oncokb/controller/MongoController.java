package org.mskcc.oncokb.controller;

import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mskcc.oncokb.controller.api.MongoApi;
import org.mskcc.oncokb.model.*;
import org.mskcc.oncokb.service.util.FileUtil;
import org.mskcc.oncokb.service.util.HttpUtil;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Value("${spring.data.mongodb.uri}")
    private String uri;

    @Autowired
    private MongoDatabase mongoDatabase;

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
                "load", fileType, trialPath, "--trial-format", "json", "--mongo-uri", this.uri);
            Boolean isLoad = runPythonScript(pb);
            tempFile.delete();

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
        produces = {"application/json"},
        method = RequestMethod.POST)
    public ResponseEntity<Set<TrialMatch>> matchTrial(@RequestBody(required = true) Patients body) {
        List<Clinical> clinicals = body.getClinicals();
        List<Genomic> genomics = body.getGenomics();
        List<Document> previousMatchedRecordsList = MongoUtil.getCollection(this.mongoDatabase,"trial_match");
        Set<Document> previousMatchedRecordsSet = new HashSet<>(previousMatchedRecordsList);
        Set<Document> matchedResults = new HashSet<>();
        Set<TrialMatch> trialMatchResult;

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
                jsonObject.put("ONCOKB_CLINICAL_ID", clinical.getClinicalId());
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
                jsonObject.put("ONCOKB_GENOMIC_ID", genomic.getGenomicId());
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

            // check if any trials matched for query data
            matchedResults = findMatchedTrials(previousMatchedRecordsSet, genomicArray, clinicalArray);

            // drop collection "trial_query" first to clean records for previous queries
            // create a new collection "trial_query" to save matched trials.
            Boolean isDropped = MongoUtil.dropCollection(this.mongoDatabase, "trial_query");
            if(isDropped) {
               Boolean isCreated = MongoUtil.createCollection(this.mongoDatabase,
                   "trial_query", new ArrayList<>(matchedResults));
               if (!isCreated) {
                   return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
               }
            }

            String clinicalPath = FileUtil.buildJsonTempFile(clinicalArray.toString(), clinicalTempFile);
            String genomicPath = FileUtil.buildJsonTempFile(genomicArray.toString(), genomicTempFile);

            ProcessBuilder loadPb = new ProcessBuilder("python", System.getenv("CATALINA_HOME") +
                "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py",
                "load", "-c", clinicalPath, "-g", genomicPath, "--patient-format", "json",
                "--mongo-uri", this.uri);
            Boolean isLoad = runPythonScript(loadPb);

            if(isLoad) {
                // run MatchEngine match()
                // MatchEngine will run 24hours periodically by adding "--daemon" in command line
                ProcessBuilder matchPb = new ProcessBuilder("python", System.getenv("CATALINA_HOME") +
                    "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py", "match",
                    "--daemon", "--mongo-uri", this.uri);
                Boolean isMatch = runPythonScript(matchPb);

                if(isMatch) {
                    // export matched result from collection "trial_match" in MongoDB "matchminer"
                    List<Document> matchedTrialDocs = MongoUtil.getCollection(this.mongoDatabase,
                        "new_trial_match");
                    matchedResults.addAll(matchedTrialDocs);
                } else {
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            trialMatchResult = capsulateTrialMatchDoc(matchedResults);

            clinicalTempFile.delete();
            genomicTempFile.delete();

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(trialMatchResult,  HttpStatus.OK);
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

    public Set<TrialMatch> capsulateTrialMatchDoc(Set<Document> documents) {
        Set<TrialMatch> trialMatches = new HashSet<>();
        for (Document doc: documents) {
            TrialMatch trialMatch = new TrialMatch();
            trialMatch.setClinicalId(doc.getString("oncokb_clinical_id"));
            trialMatch.setSampleId(doc.getString("sample_id"));
            trialMatch.setOrdPhysicianName(doc.getString("ord_physician_name"));
            trialMatch.setOrdPhysicianEmail(doc.getString("ord_physician_email"));
            trialMatch.setOncotreePrimaryDiagnosisName(doc.getString("oncotree_primary_diagnosis_name"));
            trialMatch.setVitalStatus(doc.getString("vital_status"));
            trialMatch.setFirstLast(doc.getString("first_last"));
            trialMatch.setReportDate(doc.getString("report_date"));
            trialMatch.setMrn(doc.getInteger("mrn"));

            trialMatch.setGenomicId(doc.getString("oncokb_genomic_id"));
            trialMatch.setTrueHugoSymbol(doc.getString("true_hugo_symbol"));
            trialMatch.setTrueProteinChange(doc.getString("true_protein_change"));
            trialMatch.setTrueVariantClassification(doc.getString("variant_category"));
            trialMatch.setCnvCall(doc.getString("cnv_call"));
            trialMatch.setWildtype(doc.getBoolean("wild_type"));
            trialMatch.setChromosome(doc.getString("chromosome"));
            trialMatch.setPosition(doc.getString("position"));
            trialMatch.setTrueCdnaChange(doc.getString("true_cdna_change"));
            trialMatch.setReferenceAllele(doc.getString("reference_allele"));
            trialMatch.setTrueTranscriptExon(doc.getInteger("true_transcript_exon"));
            trialMatch.setCanonicalStand(doc.getString("canonical_stand"));
            trialMatch.setAlleleFraction(doc.getDouble("allele_fraction"));
            trialMatch.setTier(doc.getInteger("tier"));

            trialMatch.setProtocolNo(doc.getString("protoco_no"));
            trialMatch.setNctId(doc.getString("nct_id"));
            trialMatch.setGenomicAlteration(doc.getString("genomic_alteration"));
            trialMatch.setMatchType(doc.getString("match_type"));
            trialMatch.setTrialAccrualStatus(doc.getString("trial_accrual_status"));
            trialMatch.setMatchLevel(doc.getString("match_level"));
            trialMatch.setCode(doc.getString("code"));
            trialMatch.setInternalId(doc.getInteger("internal_id"));

            trialMatches.add(trialMatch);
        }

        return trialMatches;
    }

    public Set<Document> findMatchedTrials(Set<Document> matchedRecordsSet,
                                           JSONArray genomicArray, JSONArray clinicalArray) throws JSONException{
        Set<Document> matchedResults = new HashSet<>();
        for (Document doc: matchedRecordsSet) {
            for (int i = 0; i < genomicArray.length(); i++){
                if (doc.getString("oncokb_genomic_id").equals(
                    genomicArray.getJSONObject(i).getString("ONCOKB_GENOMIC_ID"))){
                    for (int j = 0; j < clinicalArray.length(); j++) {
                        if (doc.getString("oncokb_clinical_id").equals(clinicalArray.getJSONObject(j)
                            .getString("ONCOKB_CLINICAL_ID"))){
                            matchedResults.add(doc);
                            if (matchedResults.size() == matchedRecordsSet.size()) {
                                return matchedResults;
                            }
                        }
                    }
                }
            }
        }
        return  matchedResults;
    }
}

