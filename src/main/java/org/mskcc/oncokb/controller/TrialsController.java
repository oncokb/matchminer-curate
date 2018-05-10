package org.mskcc.oncokb.controller;

import com.mongodb.client.MongoDatabase;
import io.swagger.annotations.ApiParam;
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

import javax.validation.Valid;

/**
 * @author jingsu
 * This controller is used for running MatchEngine.
 * It will call createTrial(), loadPatient() and matchTrial() methos in MatchEngine.
 */

@Controller
public class TrialsController implements TrialsApi {

    private static final Logger log = LoggerFactory.getLogger(TrialsController.class);
    @Value("${spring.data.mongodb.uri}")
    private String uri;
    @Value("${application.matchengine.path}")
    private String matchenginePath;
    @Autowired
    private MongoDatabase mongoDatabase;

    @Override
    @RequestMapping(value = "/trials/createTrial",
        consumes = { "application/json" },
        method = RequestMethod.POST)
    public ResponseEntity<Void> createTrial(@ApiParam(value = "a trial json object " ,required=true )  @Valid @RequestBody Trial trial) {
        // check if MatchEngine is accessible.
        if (this.matchenginePath == null || this.matchenginePath.length() == 0 ) {
            log.error("Cannot' find matchminer-engine path!");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try{
            String mongoUri = MongoUtil.getPureMongoUri(this.uri);
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = trial.toString();
//            String json = ow.writeValueAsString(body.getTrial());
            String nctId = trial.getNctId();
            // Archived trials have to be deleted in Mongo DB.
            if( trial.getArchived().equals("Yes")) {
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

            if (trial.getCurationStatus().equals("Completed")) {
                File tempFile = File.createTempFile("trial", ".json");
                String trialPath = FileUtil.buildJsonTempFile(json, tempFile);

                ProcessBuilder pb = new ProcessBuilder("python", this.matchenginePath + "/matchengine.py",
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
    @RequestMapping(value = "/trials/loadPatientData",
        produces = { "application/json" },
        consumes = { "application/json" },
        method = RequestMethod.POST)
    public ResponseEntity<Void> loadPatient(@ApiParam(value = "clinical and genomic data of a patient" ,required=true )  @Valid @RequestBody PatientData patient) {
        // check if MatchEngine is accessible.
        if (this.matchenginePath == null || this.matchenginePath.length() == 0 ) {
            log.error("Cannot' find matchminer-engine path!");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            List<Clinical> clinicals = patient.getClinicals();
            List<Genomic> genomics = patient.getGenomics();
            String mongoUri = MongoUtil.getPureMongoUri(this.uri);
            File clinicalTempFile = File.createTempFile("clinical", ".json");
            File genomicTempFile = File.createTempFile("genomic", ".json");
            JSONArray clinicalArray = new JSONArray();
            JSONArray genomicArray = new JSONArray();

            for (Clinical clinical: clinicals) {
                JSONObject clinicalObject = new JSONObject();
                clinicalObject.put("UNIQUE_CLINICAL_ID", clinical.getUniqueClinicalId());
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
            }

            for (Genomic genomic: genomics) {
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("UNIQUE_GENOMIC_ID", genomic.getUniqueGenomicId());
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

            List<Document> clinicalCollectionBackup = MongoUtil.getCollection(this.mongoDatabase, "clinical");
            List<Document> genomicCollectionBackup = MongoUtil.getCollection(this.mongoDatabase, "genomic");

            String clinicalPath = FileUtil.buildJsonTempFile(clinicalArray.toString(), clinicalTempFile);
            String genomicPath = FileUtil.buildJsonTempFile(genomicArray.toString(), genomicTempFile);
            ProcessBuilder loadPb = new ProcessBuilder("python", this.matchenginePath + "/matchengine.py",
                "load", "-c", clinicalPath, "-g", genomicPath, "--patient-format", "json", "--mongo-uri", mongoUri);
            Boolean isLoad = PythonUtil.runPythonScript(loadPb);
            if(!isLoad) {
                // Rollback clinical and genomic collections once loading data failed
                MongoUtil.createCollection(this.mongoDatabase, "clinical", clinicalCollectionBackup);
                MongoUtil.createCollection(this.mongoDatabase, "genomic", genomicCollectionBackup);
                log.error("Load genomic and clinical data into MongoDB failed!");
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


    @Override
    @RequestMapping(value = "/trials/match",
        produces = { "application/json" },
        consumes = { "application/json" },
        method = RequestMethod.GET)
    public ResponseEntity<Void> matchTrial() {
        // check if MatchEngine is accessible.
        if (this.matchenginePath == null || this.matchenginePath.length() == 0 ) {
            log.error("Cannot' find matchminer-engine path!");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            String mongoUri = MongoUtil.getPureMongoUri(this.uri);
            List<Document> trialMatchCollectionBackup = MongoUtil.getCollection(this.mongoDatabase, "trial_match");
            ProcessBuilder matchPb = new ProcessBuilder("python", this.matchenginePath + "/matchengine.py",
                "match", "--mongo-uri", mongoUri);
            Boolean isMatch = PythonUtil.runPythonScript(matchPb);
            if(!isMatch) {
                // Rollback trial_match collection once matching failed
                MongoUtil.createCollection(this.mongoDatabase, "trial_match", trialMatchCollectionBackup);
                log.error("Run match() of matchminer-engine failed!");
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
