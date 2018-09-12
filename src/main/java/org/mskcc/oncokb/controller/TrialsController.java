package org.mskcc.oncokb.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.mongodb.client.MongoDatabase;
import io.swagger.annotations.ApiParam;
import org.json.JSONObject;
import org.mskcc.oncokb.controller.api.TrialsApi;
import org.mskcc.oncokb.service.FirebaseService;
import org.mskcc.oncokb.service.WebtokenService;
import org.mskcc.oncokb.service.util.FileUtil;
import org.mskcc.oncokb.service.util.HttpUtil;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.mskcc.oncokb.service.util.PythonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import javax.validation.Valid;
import java.io.File;

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

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private WebtokenService webtokenService;

    private static final String ALLOWED_TRIAL_STATUS = "Ready to import";

    @Override
    public ResponseEntity<Void> create(@ApiParam(value = "a trial json object ", required = true) @Valid @RequestBody Object trial,
                                       @ApiParam(value = "Access token.") @RequestParam(value = "token", required = false) String token) {
        boolean valid = true;
        if (this.webtokenService.isWebtokenEnabled()) {
            valid = this.webtokenService.isValidToken(token);
        }
        if (valid) {
            // check if MatchEngine is accessible.
            if (this.matchenginePath == null || this.matchenginePath.length() == 0) {
                log.error("Cannot' find matchminer-engine path!");
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
            try {
                String mongoUri = MongoUtil.getPureMongoUri(this.uri);
                ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
                String json = ow.writeValueAsString(trial);
                JSONObject trialObj = new JSONObject(json);
                String nctId = trialObj.get("nct_id").toString();
                String archived = trialObj.get("archived").toString();
                String curationStatus = trialObj.get("curation_status").toString();
                // Archived trials have to be deleted in Mongo DB.
                if (archived.equals("Yes")) {
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

                    ProcessBuilder pb = new ProcessBuilder("python", this.matchenginePath + "/matchengine.py",
                        "load", "-t", trialPath, "--trial-format", "json", "--mongo-uri", mongoUri);
                    Boolean isLoad = PythonUtil.runPythonScript(pb);
                    tempFile.delete();

                    if (!isLoad) {
                        log.error("Load trial json temp file failed!");
                        throw new Exception();
                    } else {
                        log.info("Updated trial nct_id: " + nctId);

                        Boolean isDeleted = MongoUtil.deleteMany(this.mongoDatabase, "trial_match", nctId);
                        if (!isDeleted) {
                            log.warn("Delete the trial related matched record in MongoDB failed!");
                            throw new Exception();
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @Override
    public ResponseEntity<String> getTrialById(@ApiParam(value = "Search by NCT ID.", required = true)
                                               @PathVariable("id") String id,
                                               @ApiParam(value = "Access token.") @RequestParam(value = "token", required = false) String token) {
        boolean valid = true;
        if (this.webtokenService.isWebtokenEnabled()) {
            valid = this.webtokenService.isValidToken(token);
        }
        if (valid) {
            try {
                String response = HttpUtil.getRequest("https://" + firebaseService.getFirebaseProjectId() +
                    ".firebaseio.com/Trials/" + id + ".json?access_token=" + firebaseService.getFirebaseToken(), true);
                if (response == null) {
                    return new ResponseEntity<>("Sorry, some issues happened in backend.", HttpStatus.INTERNAL_SERVER_ERROR);
                } else if (response.equals("null")) {
                    return new ResponseEntity<>("Trial is not available.", HttpStatus.NOT_FOUND);
                } else {
                    JSONObject trialObj = new JSONObject(response);
                    String curationStatus = trialObj.has("curation_status") ? trialObj.get("curation_status").toString() : null;
                    if (curationStatus == null || !curationStatus.equals(ALLOWED_TRIAL_STATUS)) {
                        return new ResponseEntity<>("Trial is not available.", HttpStatus.NOT_FOUND);
                    }
                }
                return new ResponseEntity<>(response, HttpStatus.OK);
            }catch (Exception e) {
                return new ResponseEntity<>("", HttpStatus.SERVICE_UNAVAILABLE);
            }
        } else {
            return new ResponseEntity<>("", HttpStatus.UNAUTHORIZED);
        }
    }

    @Override
    public ResponseEntity<String> getTrialsData(@ApiParam(value = "Size of results.") @RequestParam(value = "size", required = false) String size,
                                                @ApiParam(value = "Access token.") @RequestParam(value = "token", required = false) String token) throws InterruptedException {
        boolean valid = true;
        if (this.webtokenService.isWebtokenEnabled()) {
            valid = this.webtokenService.isValidToken(token);
        }
        if (valid) {
            int sizeInt = 0;
            if (size != null && size.length() > 0) {
                sizeInt = Integer.parseInt(size);
            }
            String response;
            try {
                if (sizeInt > 0) {
                    response = HttpUtil.getRequest("https://" + firebaseService.getFirebaseProjectId() +
                        ".firebaseio.com/Trials.json?access_token=" + firebaseService.getFirebaseToken() + "&orderBy=\"curation_status\"&equalTo=\""
                        + ALLOWED_TRIAL_STATUS.replaceAll(" ", "+") + "\"&limitToFirst=" + sizeInt, true);
                } else {
                    response = HttpUtil.getRequest("https://" + firebaseService.getFirebaseProjectId() +
                        ".firebaseio.com/Trials.json?access_token=" + firebaseService.getFirebaseToken() + "&orderBy=\"curation_status\"&equalTo=\""
                        + ALLOWED_TRIAL_STATUS.replaceAll(" ", "+") + "\"", true);
                }

                if (response == null) {
                    return new ResponseEntity<>("", HttpStatus.INTERNAL_SERVER_ERROR);
                } else if (response.equals("null")) {
                    return new ResponseEntity<>("", HttpStatus.NOT_FOUND);
                }
                return new ResponseEntity<>(response, HttpStatus.OK);
            }catch (Exception e) {
                return new ResponseEntity<>("", HttpStatus.SERVICE_UNAVAILABLE);
            }
        } else {
            return new ResponseEntity<>("", HttpStatus.UNAUTHORIZED);
        }
    }
}
