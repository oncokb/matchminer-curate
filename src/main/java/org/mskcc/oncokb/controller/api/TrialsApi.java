/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package org.mskcc.oncokb.controller.api;

import io.swagger.annotations.*;
import org.mskcc.oncokb.model.MatchTrialResult;
import org.mskcc.oncokb.model.Patient;
import org.mskcc.oncokb.model.TrialJson;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Api(value = "trials", description = "Trials Resource")
public interface TrialsApi {

    @ApiOperation(value = "", notes = "Load trial data into Mongo DB.", response = Void.class, tags={ })
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Load the trial successfully!", response = Void.class),
        @ApiResponse(code = 500, message = "Load the trial failed!", response = Void.class)})

    @RequestMapping(value = "/trials/create",
        consumes = {"application/json"},
        method = RequestMethod.POST)
    ResponseEntity<Void> loadTrial(@ApiParam(value = "A trial json object.", required = true) @RequestBody TrialJson body);


    @ApiOperation(value = "", notes = "Match trial in Mongo DB to patient", response = MatchTrialResult.class, tags={ })
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Match trials successfully!", response = MatchTrialResult.class),
        @ApiResponse(code = 500, message = "Match trials failed!", response = Void.class)})

    @RequestMapping(value = "/trials/match",
        consumes = {"application/json"},
        produces = {"application/json"},
        method = RequestMethod.POST)
    ResponseEntity<MatchTrialResult> matchTrial(@ApiParam(value = "Clinical and genomic data of a patient.", required = true) @RequestBody Patient body);

}
