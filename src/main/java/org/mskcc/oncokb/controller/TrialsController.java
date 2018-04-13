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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(TrialsController.class);
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
        if (this.matchengineAbsolutePath == null || this.matchengineAbsolutePath.length() == 0 ) {
            log.error("Cannot' find matchminer-engine path!");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try{
            String mongoUri = MongoUtil.getPureMongoUri(this.uri);
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = ow.writeValueAsString(body.getTrial());
            JSONObject trialObj = new JSONObject(json);
            String nctId = trialObj.get("nct_id").toString();
            String archived = trialObj.get("archived").toString();
            String curationStatus = trialObj.get("curation_status").toString();
            // Archived trials have to be deleted in Mongo DB.
            if( archived.equals("Yes")) {
                Boolean isDeletedTrialMatch = MongoUtil.deleteMany(this.mongoDatabase, "trial_match", nctId);
                Boolean isDeletedTrial = MongoUtil.deleteMany(this.mongoDatabase, "trial", nctId);
                if (!isDeletedTrialMatch) {
                    log.warn("Delete the trial related matched record in MongoDB failed!");
                }
                if (!isDeletedTrial) {
                    log.warn("Delete the trial in MongoDB failed!");
                }
                return new ResponseEntity<>(HttpStatus.OK);
            }

            if (curationStatus.equals("Completed")) {
                File tempFile = File.createTempFile("trial", ".json");
                String trialPath = FileUtil.buildJsonTempFile(json, tempFile);

                ProcessBuilder pb = new ProcessBuilder("python", this.matchengineAbsolutePath + "/matchengine.py",
                    "load", "-t", trialPath, "--trial-format", "json", "--mongo-uri", mongoUri);
                Boolean isLoad = PythonUtil.runPythonScript(pb);
                tempFile.delete();

                if(!isLoad) {
                    log.error("Load trial json temp file failed!");
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                } else {
                    log.info("Updated trial nct_id: " + nctId);

                    Boolean isDeleted = MongoUtil.deleteMany(this.mongoDatabase, "trial_match", nctId);
                    if (!isDeleted) {
                        log.warn("Delete the trial related matched record in MongoDB failed!");
                    }
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
        if (this.matchengineAbsolutePath == null || this.matchengineAbsolutePath.length() == 0 ) {
            log.error("Cannot' find matchminer-engine path!");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // If the last query cause issue, some temp collections won't be dropped.
        // They will affect next query, so they should be dropped before matching.
        List<String> tempCollectionNames = new ArrayList<>();
        tempCollectionNames.add("new_clinical");
        tempCollectionNames.add("new_genomic");
        tempCollectionNames.add("new_trial_match");
        tempCollectionNames.add("trial_query");
        for(String temp: tempCollectionNames){
            MongoUtil.dropCollection(this.mongoDatabase, temp);
        }

        Clinical clinical = body.getClinical();
        List<Genomic> genomics = body.getGenomics();
        Set<Document> previousMatchedRecordsSet = new HashSet<>(MongoUtil.getCollection(this.mongoDatabase,
            "trial_match"));
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
                genomicArray.put(jsonObject);
            }

            // check if any trials matched for query data. We check trials from history(collection "trial_match") to
            // see if any matched records can be found and save them to "matchedResults".
            if (previousMatchedRecordsSet.size() > 0) {
                List<Document> findMatchedTrialsResult = findMatchedTrials(previousMatchedRecordsSet, genomicArray, clinicalArray);
                matchedResults.addAll(findMatchedTrialsResult);
            }

            // create a new collection "trial_query" to save matched trials from history(collection "trial_match").
            if(matchedResults.size() > 0) {
                Boolean isCreated = MongoUtil.createCollection(this.mongoDatabase,
                    "trial_query", new ArrayList<>(matchedResults));
                if (!isCreated) {
                    log.error("Create trial_query collection failed!");
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

            String clinicalPath = FileUtil.buildJsonTempFile(clinicalArray.toString(), clinicalTempFile);
            String genomicPath = FileUtil.buildJsonTempFile(genomicArray.toString(), genomicTempFile);

            ProcessBuilder loadPb = new ProcessBuilder("python", this.matchengineAbsolutePath + "/matchengine.py",
                "load", "-c", clinicalPath, "-g", genomicPath, "--patient-format", "json", "--mongo-uri", mongoUri);
            Boolean isLoad = PythonUtil.runPythonScript(loadPb);

            if(isLoad) {
                ProcessBuilder matchPb = new ProcessBuilder("python", this.matchengineAbsolutePath + "/matchengine.py",
                    "match", "--mongo-uri", mongoUri);
                Boolean isMatch = PythonUtil.runPythonScript(matchPb);

                if(isMatch) {
                    // export matched result from collection "trial_match" in MongoDB "matchminer"
                    List<Document> matchedTrialDocs = MongoUtil.getCollection(this.mongoDatabase,
                        "new_trial_match");
                    matchedResults.addAll(matchedTrialDocs);
                } else {
                    log.error("Run match() of matchminer-engine failed!");
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                log.error("Load genomic and clinical data into MongoDB failed!");
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            matchTrialResult = capsulateTrialMatchDoc(body.getId(), matchedResults);

            // drop collections "trial_query" and "new_trial_match" in case they will effect next matching result
            Boolean isTrialQueryDropped = MongoUtil.dropCollection(this.mongoDatabase, "trial_query");
            Boolean isNewTrialMatchDropped = MongoUtil.dropCollection(this.mongoDatabase, "new_trial_match");
            if(!isTrialQueryDropped) {
                log.warn("Drop collection trial_query failed!");
            }
            if(!isNewTrialMatchDropped) {
                log.warn("Drop collection new_trial_match failed!");
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
        Set<Document> matchedResults = new HashSet<>();
        for (Document doc: matchedRecordsSet) {
            for (int i = 0; i < genomicArray.length(); i++){
                // "Not" trial_match records don't have "oncokb_genomic_id" so skip "Not" record.
                // "Not" trials should be rematch in matchminer-engine.
                String oncokbGenomicId = doc.getString("oncokb_genomic_id");
                if (oncokbGenomicId != null && oncokbGenomicId.equals(
                    genomicArray.getJSONObject(i).getString("ONCOKB_GENOMIC_ID"))){
                    for (int j = 0; j < clinicalArray.length(); j++) {
                        if (doc.getString("oncokb_clinical_id").equals(clinicalArray.getJSONObject(j)
                            .getString("ONCOKB_CLINICAL_ID"))){
                            matchedResults.add(doc);
                            if (matchedResults.size() == matchedRecordsSet.size()) {
                                return new ArrayList<>(matchedResults);
                            }
                        }
                    }
                }
            }
        }
        return new ArrayList<>(matchedResults);
    }
}
