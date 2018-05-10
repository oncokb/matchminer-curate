package org.mskcc.oncokb.controller;

import com.mongodb.client.MongoDatabase;
import io.swagger.annotations.ApiParam;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.validation.Valid;

/**
 * @author jingsu
 * This controller is used for loading curated trial into Mongo DB.
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
    @RequestMapping(value = "/trials/create",
        consumes = { "application/json" },
        method = RequestMethod.POST)
    public ResponseEntity<Void> create(@ApiParam(value = "a trial json object " ,required=true )  @Valid @RequestBody Trial trial) {
        // check if MatchEngine is accessible.
        if (this.matchenginePath == null || this.matchenginePath.length() == 0 ) {
            log.error("Cannot' find matchminer-engine path!");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try{
            String mongoUri = MongoUtil.getPureMongoUri(this.uri);
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = ow.writeValueAsString(trial);
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
}
