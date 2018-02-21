package org.mskcc.oncokb.controller;

import org.mskcc.oncokb.model.LoadData;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.io.File;
import java.io.BufferedWriter;
import java.io.FileWriter;
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

    @RequestMapping(value = "/mongo/load",
        method = RequestMethod.POST)
    public ResponseEntity<Void> load(@ApiParam(value = "a json object with dataType(trial/clinical/genomic)", required = true) @Valid @RequestBody LoadData loadData) {

        try{
            String dataType = loadData.getDataType();
            String fileType = "";
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = ow.writeValueAsString(loadData.getContent());
            String content = json;

            String prefix = dataType;
            String suffix = ".json";

            // this temporary file remains after the jvm exits
            File tempFile = File.createTempFile(prefix, suffix);
            //Get temporary file path
            String absolutePath = tempFile.getAbsolutePath();

            //write it
            BufferedWriter bw = new BufferedWriter(new FileWriter(tempFile));
            bw.write(content);
            bw.close();

            if (dataType.equals("trial")) {
                fileType = "-t";
            } else if (dataType.equals("genomic")) {
                fileType = "-g";
            } else if (dataType.equals("clinical")) {
                fileType = "-c";
            } else {
                return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
            }

            ProcessBuilder pb = new ProcessBuilder("python",
                System.getenv("CATALINA_HOME")+ "/webapps/matchminer-curate/WEB-INF/classes/matchminerengine/matchengine.py",
                "load", fileType, absolutePath, "--trial-format", "json", "--mongo-uri", "mongodb://127.0.0.1:27017");
            Process p = pb.start();

            int exitCode = p.waitFor();
            tempFile.delete();
            if(exitCode == 1) {
                return new ResponseEntity<Void>(HttpStatus.NOT_ACCEPTABLE);
            }

        } catch (Exception e){

            e.printStackTrace();

        }
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}

