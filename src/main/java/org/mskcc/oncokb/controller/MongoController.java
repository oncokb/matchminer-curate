package org.mskcc.oncokb.controller;

import org.mskcc.oncokb.model.LoadData;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.io.File;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

import io.swagger.annotations.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.validation.Valid;

@Controller
public class MongoController {

    @ApiOperation(value = "", notes = "Load trial or clinical or genomic data into Mongo DB.", response = Void.class, tags={  })
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Load to Mongo DB successfully.", response = Void.class),
        @ApiResponse(code = 400, message = "The json object is invalid.", response = Void.class),
        @ApiResponse(code = 404, message = "The json object was not found.", response = Void.class),
        @ApiResponse(code = 200, message = "Unexpected error.", response = Void.class) })

    @RequestMapping(value = "/mongo/load",
        method = RequestMethod.POST)
    public ResponseEntity<Void> load(@ApiParam(value = "a json object with dataType(trial/clinical/genomic)", required = true) @Valid @RequestBody LoadData loadData) {
        System.out.println(loadData.getDataType());
        System.out.println(loadData.getContent());

        String dataType = loadData.getDataType();
        String fileType = "";

        try{

            String prefix = dataType;
            String suffix = ".json";

            // this temporary file remains after the jvm exits
            File tempFile = File.createTempFile(prefix, suffix);
            tempFile.deleteOnExit();
            //Get temporary file path
            String absolutePath = tempFile.getAbsolutePath();

            System.out.format("Canonical filename: %s\n", tempFile.getCanonicalFile());

            //write it
            BufferedWriter bw = new BufferedWriter(new FileWriter(tempFile));
            bw.write(loadData.getContent().toString());
            bw.close();

            if (dataType == "trial") {
                fileType = "-t";
            } else if (dataType == "genomic") {
                fileType = "-g";
            } else if (dataType == "clinical") {
                fileType = "-c";
            } else {
                return new ResponseEntity<Void>(HttpStatus.NOT_ACCEPTABLE);
            }

            ProcessBuilder processBuilder = new ProcessBuilder("python",
                System.getenv("CATALINA_HOME")+ "/webapps/matchminer-curate/WEB-INF/classes/matchminerengine/matchengine.py",
                "load", fileType, absolutePath, "--mongo-uri", "mongodb://127.0.0.1:27017");


        } catch (IOException e){

            e.printStackTrace();

        }
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}

