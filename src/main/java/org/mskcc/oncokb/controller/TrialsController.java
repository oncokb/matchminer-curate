package org.mskcc.oncokb.controller;

import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.ApiParam;

import javax.validation.Valid;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.InterruptedException;

/**
 *
 * @author jingsu
 */
@Controller
public class TrialsController {
    /**
     *
     * @param nctIds: a clinical trial's NCT ID, a comma-separated list of NCT IDs
     * @return trial json string
     * @throws IOException
     * @throws InterruptedException
     */

    @ApiOperation(value = "",
        notes = "Returns trials from clinicaltrials.gov that the user send their ids and save them to Firebase",
        response = Void.class, tags={  })
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Save trials successfully.", response = Void.class),
        @ApiResponse(code = 400, message = "The specified trial ID(s) is invalid.", response = Void.class),
        @ApiResponse(code = 404, message = "Trial(s) with the specified ID(s) was not found.", response = Void.class),
        @ApiResponse(code = 200, message = "Unexpected error.", response = Void.class) })

    @RequestMapping(value="/trials/save/{nctIds}", produces = { "application/json" }, method = RequestMethod.GET)
    public @ResponseBody String saveTrialById(
        @ApiParam(value = "IDs of trials to return", required = true)  @PathVariable("nctIds") String nctIds)
        throws IOException, InterruptedException {

        ProcessBuilder processBuilder = new ProcessBuilder("python",
            System.getenv("CATALINA_HOME")+ "/webapps/matchminer-curate/WEB-INF/classes/python/nci_to_ctml.py", "-i", nctIds);


        return readOutputFromPython(processBuilder);
    }

    /**
     *
     * @param trialObject
     * @return trial YAML string
     * @throws IOException
     * @throws InterruptedException
     */

    @ApiOperation(value = "", notes = "Covert a  trial from json to yaml format.", response = Void.class, tags={  })
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Covert to yaml successfully.", response = Void.class),
        @ApiResponse(code = 400, message = "The trial object is invalid.", response = Void.class),
        @ApiResponse(code = 404, message = "The trial was not found.", response = Void.class),
        @ApiResponse(code = 200, message = "Unexpected error.", response = Void.class) })

    @RequestMapping(value = "/trials/convert/{dataType}",
        method = RequestMethod.POST)
    public String convertDataType(@ApiParam(value = "a json/yaml trial string" ,required=true )
                                      @Valid @RequestBody String trialObject,
                                  @ApiParam(value = "the data type covert to",required=true )
                                  @PathVariable("dataType") String dataType)
        throws IOException, InterruptedException {

        ProcessBuilder processBuilder = new ProcessBuilder("python",
            System.getenv("CATALINA_HOME")+
                "/webapps/matchminer-curate/WEB-INF/classes/python/convert_data_type.py",
            "-i", trialObject, "-t", dataType);

        return readOutputFromPython(processBuilder);
    }

    /**
     *
     * @param processBuilder
     * @return output from python script
     * @throws IOException
     * @throws InterruptedException
     */

    public String readOutputFromPython(ProcessBuilder processBuilder) throws IOException, InterruptedException {
        //From the DOC:  Initially, this property is false, meaning that the
        //standard output and error output of a subprocess are sent to two separate streams
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();
        StringBuilder processOutput = new StringBuilder();

        try (BufferedReader processOutputReader = new BufferedReader(
            new InputStreamReader(process.getInputStream()));) {
            String readLine;

            while ((readLine = processOutputReader.readLine()) != null) {
                processOutput.append(readLine + System.lineSeparator());
            }

            process.waitFor();
        }

        return processOutput.toString();
    }

}
