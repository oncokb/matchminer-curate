package org.mskcc.oncokb.controller;

import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mskcc.oncokb.controller.api.TrialsApi;
import org.mskcc.oncokb.model.*;
import org.mskcc.oncokb.service.util.FileUtil;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.mskcc.oncokb.service.util.PythonUtil;
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
public class TrialsController implements TrialsApi {

    @Value("${application.oncokb.api.match-variant}")
    private String oncokbMatchVariantApi;

    @Value("${spring.data.mongodb.uri}")
    private String uri;

    @Value("${application.matchengine.absolute-path}")
    private String matchengineAbsolutePath;

    @Autowired
    private MongoDatabase mongoDatabase;

    @RequestMapping(value = "/trials/create",
        consumes = {"application/json"},
        method = RequestMethod.POST)
    public ResponseEntity<Void> loadTrial(@RequestBody(required = true) TrialJson body) {
        // check if MatchEngine is accessible.
        String runnableScriptPath = PythonUtil.getMatchEnginePath(this.matchengineAbsolutePath);
        if (runnableScriptPath == null || runnableScriptPath.length() <= 0 ) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try{
            String mongoUri = MongoUtil.getPureMongoUri(this.uri);
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = ow.writeValueAsString(body.getTrial());

            // this temporary file remains after the jvm exits
            File tempFile = File.createTempFile("trial", ".json");
            String trialPath = FileUtil.buildJsonTempFile(json, tempFile);
            System.out.println("trial temp file: " + trialPath);

            ProcessBuilder pb = new ProcessBuilder("python", runnableScriptPath + "/matchengine.py",
                "load", "-t", trialPath, "--trial-format", "json", "--mongo-uri", mongoUri);
            Boolean isLoad = PythonUtil.runPythonScript(pb);
            tempFile.delete();

            if(!isLoad) {
                System.out.println("Load trial json temp file failed!");
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                JSONObject trialObj = new JSONObject(json);
                String nctId = trialObj.get("nct_id").toString();
                System.out.println("\n\n Update trial nct_id: " + nctId + "\n\n");

                Boolean isDeleted = MongoUtil.deleteMany(this.mongoDatabase, "trial_match", nctId);
                if (!isDeleted) {
                    System.out.println("Delete the trial related matched record failed!");
                }
            }

        } catch (Exception e){
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    @RequestMapping(value = "/trials/match",
        consumes = {"application/json"},
        produces = {"application/json"},
        method = RequestMethod.POST)
    public ResponseEntity<MatchTrialResult> matchTrial(@RequestBody(required = true) Patient body) {
        // check if MatchEngine is accessible.
        String runnableScriptPath = PythonUtil.getMatchEnginePath(this.matchengineAbsolutePath);
        if (runnableScriptPath == null || runnableScriptPath.length() == 0 ) {
            System.out.println("Cannot' find matchengine path!");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Clinical clinical = body.getClinical();
        List<Genomic> genomics = body.getGenomics();
        Set<Document> previousMatchedRecordsSet = new HashSet<>(MongoUtil.getCollection(this.mongoDatabase,
            "trial_match"));
        System.out.println("\n\nprevious matched records set:\n" + previousMatchedRecordsSet);
        List<Document> matchedResults = new LinkedList<>();
        MatchTrialResult matchTrialResult = new MatchTrialResult();

        try {
            String mongoUri = MongoUtil.getPureMongoUri(this.uri);
            File clinicalTempFile = File.createTempFile("clinical", ".json");
            File genomicTempFile = File.createTempFile("genomic", ".json");
            JSONArray clinicalArray = new JSONArray();
            JSONArray genomicArray = new JSONArray();

            JSONObject clinicalObject = new JSONObject();
            clinicalObject.put("ONCOKB_CLINICAL_ID", clinical.getClinicalId());
            clinicalObject.put("SAMPLE_ID", clinical.getSampleId());
            clinicalObject.put("ORD_PHYSICIAN_NAME", clinical.getOrdPhysicianName());
            clinicalObject.put("ORD_PHYSICIAN_EMAIL", clinical.getOrdPhysicianEmail());
            clinicalObject.put("ONCOTREE_PRIMARY_DIAGNOSIS_NAME", clinical.getOncotreePrimaryDiagnosisName());
            clinicalObject.put("REPORT_DATE", clinical.getReportDate());
            clinicalObject.put("VITAL_STATUS", clinical.getVitalStatus());
            clinicalObject.put("FIRST_LAST", clinical.getFirstLast());
            clinicalObject.put("BIRTH_DATE", clinical.getBirthDate());
            clinicalObject.put("DFCI_MRN", clinical.getMrn());
            clinicalObject.put("GENDER", clinical.getGender());
            clinicalArray.put(clinicalObject);


            for(Genomic genomic: genomics){
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
                if (genomic.getOncokbVariant() != null && genomic.getOncokbVariant().size() > 0 ) {
                    jsonObject.put("ONCOKB_VARIANT",genomic.getOncokbVariant().toString());
                }
                genomicArray.put(jsonObject);
            }

            // check if any trials matched for query data. We check trials from history(collection "trial_match") to
            // see if any matched records can be found and save them to "matchedResults".
            if (previousMatchedRecordsSet.size() > 0) {
                matchedResults.addAll(findMatchedTrials(previousMatchedRecordsSet, genomicArray, clinicalArray));
                System.out.println("\n\nMatched Result: \n" + matchedResults + "\n\n");
            }

            // create a new collection "trial_query" to save matched trials from history(collection "trial_match").
            if(matchedResults.size() > 0) {
                Boolean isCreated = MongoUtil.createCollection(this.mongoDatabase,
                    "trial_query", new ArrayList<>(matchedResults));
                if (!isCreated) {
                    System.out.println("Create trial_query collection failed!");
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

            String clinicalPath = FileUtil.buildJsonTempFile(clinicalArray.toString(), clinicalTempFile);
            String genomicPath = FileUtil.buildJsonTempFile(genomicArray.toString(), genomicTempFile);

            ProcessBuilder loadPb = new ProcessBuilder("python", runnableScriptPath + "/matchengine.py",
                "load", "-c", clinicalPath, "-g", genomicPath, "--patient-format", "json", "--mongo-uri", mongoUri);
            Boolean isLoad = PythonUtil.runPythonScript(loadPb);

            if(isLoad) {
                // run MatchEngine match() with "--query" flag. "--query" means only match trials to
                // current patient data that is newly added to "new_genomic" and "new_clinical" collections.
                // In this way, MatchEngine won't match from "clinical" and "genomic" collections
                // in case generate duplicate matched records.
                ProcessBuilder matchPb = new ProcessBuilder("python", runnableScriptPath + "/matchengine.py",
                    "match", "--mongo-uri", mongoUri);
                Boolean isMatch = PythonUtil.runPythonScript(matchPb);

                if(isMatch) {
                    // export matched result from collection "trial_match" in MongoDB "matchminer"
                    List<Document> matchedTrialDocs = MongoUtil.getCollection(this.mongoDatabase,
                        "new_trial_match");
                    System.out.println("\n\nmatched trials docs:\n" + matchedTrialDocs);
                    matchedResults.addAll(matchedTrialDocs);
                } else {
                    System.out.println("Run match() of matchengine failed!");
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                System.out.println("Load genomic and clinical data into MongoDB failed!");
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            matchTrialResult = capsulateTrialMatchDoc(body.getId(), matchedResults);

            // drop collections "trial_query" and "new_trial_match" in case they will influence next matching result
            Boolean isTrialQueryDropped = MongoUtil.dropCollection(this.mongoDatabase, "trial_query");
            Boolean isNewTrialMatchDropped = MongoUtil.dropCollection(this.mongoDatabase, "new_trial_match");
            if(!isTrialQueryDropped) {
                System.out.println("Drop collection trial_query failed!");
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if(!isNewTrialMatchDropped) {
                System.out.println("Drop collection new_trial_match failed!");
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            clinicalTempFile.delete();
            genomicTempFile.delete();

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(matchTrialResult,  HttpStatus.OK);
    }

    public MatchTrialResult capsulateTrialMatchDoc(String id, List<Document> documents) {
        MatchTrialResult matchTrialResult = new MatchTrialResult();
        Set<String> nctIds = new HashSet<>();
        List<Trial> matchedTrialsList = new ArrayList<>();
        for (Document doc : documents) {
            nctIds.add(doc.getString("nct_id"));
        }
        for (String nctId : nctIds) {
            List<Document> trialDocs = MongoUtil.findByOneField(this.mongoDatabase, "trial",
                "nct_id", nctId);
            // Each trial is unique based on "nct_id", so trialDocs should only have one element.
            Document doc = trialDocs.get(0);
            Trial trial = new Trial();
            trial.setLongTitle(doc.get("long_title").toString());
            trial.setNctId(doc.get("nct_id").toString());
            trial.setPhase(doc.get("phase").toString());
            trial.setShortTitle(doc.get("short_title").toString());
            trial.setStatus(doc.get("status").toString());
            String treatmentList = doc.get("treatment_list").toString().replace("Document", "")
                .replace("=", ":");
            trial.setTreatmentList(treatmentList);
            matchedTrialsList.add(trial);
        }
        matchTrialResult.setId(id);
        matchTrialResult.setTrials(matchedTrialsList);

        return matchTrialResult;
    }

    public List<Document> findMatchedTrials(Set<Document> matchedRecordsSet,
                                            JSONArray genomicArray, JSONArray clinicalArray) throws JSONException{
        List<Document> matchedResults = new LinkedList<>();
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

