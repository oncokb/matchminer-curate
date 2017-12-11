package org.mskcc.oncokb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.ApiParam;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 *
 * @author jingsu
 */
@Controller
public class TrialsController {
    /**
     *
     * @param nctIds: a clinical trial's NCT ID, a comma-separated list of NCT IDs
     * @return trial json object(s)
     * @throws IOException
     * @throws InterruptedException
     */

    @RequestMapping(value="/trials/{nctIds}", produces = { "application/json" }, method = RequestMethod.GET)
    public @ResponseBody String getTrials(
        @ApiParam(value = "nctIds", required = true)  @PathVariable("nctIds") String nctIds) throws IOException, InterruptedException {

        ProcessBuilder processBuilder = new ProcessBuilder("python", "src/main/resources/python/nci_to_ctml.py", "-i", nctIds);
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
