package org.mskcc.oncokb.controller;

import org.mskcc.oncokb.model.TrialJson;
import org.mskcc.oncokb.service.util.MatchEngineUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.io.File;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import io.swagger.annotations.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import javax.validation.Valid;

/**
 * @author jingsu
 * This controller is used for sending a trial to Mongo DB.
 * It will call load() method in MatchEngine.
 */

@Controller
public class MongoController {


    @RequestMapping(value = "/mongo/loadTrial",
        method = RequestMethod.POST)
    public ResponseEntity<String> loadTrial(@ApiParam(value = "a trial json object",
        required = true) @Valid @RequestBody TrialJson trialJson) {

        try{
            String fileType = "-t";
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = ow.writeValueAsString(trialJson.getTrial());

            String prefix = "trial";
            String suffix = ".json";

            // this temporary file remains after the jvm exits
            File tempFile = File.createTempFile(prefix, suffix);

            MatchEngineUtil meUtil = new MatchEngineUtil();
            String trialPath = meUtil.buildTempFile(json, tempFile);

            ProcessBuilder pb = new ProcessBuilder("python",
                System.getenv("CATALINA_HOME") +
                    "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py",
                "load", fileType, trialPath, "--trial-format", "json", "--mongo-uri", "mongodb://127.0.0.1:27017");
            Boolean isLoad = meUtil.runPythonScript(pb);

            if(!isLoad) {
                return new ResponseEntity<>("Load the trial failed!", HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (Exception e){
            e.printStackTrace();

        }
        return new ResponseEntity<>("Load the trial successfully!", HttpStatus.OK);
    }

}

