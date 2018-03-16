package org.mskcc.oncokb.controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mskcc.oncokb.controller.api.MongoApi;
import org.mskcc.oncokb.model.*;
import org.mskcc.oncokb.service.util.FileUtil;
import org.mskcc.oncokb.service.util.HttpUtil;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.mskcc.oncokb.service.util.PythonUtil;
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
public class MongoController implements MongoApi{

    @Value("${application.oncokb.api.match-variant}")
    private String oncokbMatchVariantApi;

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
        String runnableScriptPath = PythonUtil.getMatchEnginePath(this.matchengineAbsolutePath);
        if (runnableScriptPath == null || runnableScriptPath.length() <= 0 ) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try{
            ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            String json = ow.writeValueAsString(body.getTrial());

            // this temporary file remains after the jvm exits
            File tempFile = File.createTempFile("trial", ".json");
            String trialPath = FileUtil.buildJsonTempFile(json, tempFile);

            ProcessBuilder pb = new ProcessBuilder("python", runnableScriptPath + "/matchengine.py",
                "load", "-t", trialPath, "--trial-format", "json", "--mongo-uri", this.uri);
            Boolean isLoad = PythonUtil.runPythonScript(pb);
            tempFile.delete();

            if(!isLoad) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
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
    public ResponseEntity<List<TrialMatch>> matchTrial(@RequestBody(required = true) Patient body) {
        // check if MatchEngine is accessible.
        String runnableScriptPath = PythonUtil.getMatchEnginePath(this.matchengineAbsolutePath);
        if (runnableScriptPath == null || runnableScriptPath.length() <= 0 ) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Clinical> clinicals = body.getClinicals();
        List<Genomic> genomics = body.getGenomics();
        Set<Document> previousMatchedRecordsSet = new HashSet<>(MongoUtil.getCollection(this.mongoDatabase,
            "trial_match"));
        List<Document> matchedResults = new LinkedList<>();
        List<TrialMatch> trialMatchResult = new LinkedList<>();

        try {
            List<Genomic> annotatedGenomics = annotateOncokbVariant(genomics, this.oncokbMatchVariantApi);
            if(annotatedGenomics == null) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            File clinicalTempFile = File.createTempFile("clinical", ".json");
            File genomicTempFile = File.createTempFile("genomic", ".json");
            JSONArray clinicalArray = new JSONArray();
            JSONArray genomicArray = new JSONArray();

            for(Clinical clinical: clinicals){
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("ONCOKB_CLINICAL_ID", clinical.getClinicalId());
                jsonObject.put("SAMPLE_ID", clinical.getSampleId());
                jsonObject.put("ORD_PHYSICIAN_NAME", clinical.getOrdPhysicianName());
                jsonObject.put("ORD_PHYSICIAN_EMAIL", clinical.getOrdPhysicianEmail());
                jsonObject.put("ONCOTREE_PRIMARY_DIAGNOSIS_NAME", clinical.getOncotreePrimaryDiagnosisName());
                jsonObject.put("REPORT_DATE", clinical.getReportDate());
                jsonObject.put("VITAL_STATUS", clinical.getVitalStatus());
                jsonObject.put("FIRST_LAST", clinical.getFirstLast());
                jsonObject.put("BIRTH_DATE", clinical.getBirthDate());
                jsonObject.put("DFCI_MRN", clinical.getMrn());
                jsonObject.put("GENDER", clinical.getGender());
                clinicalArray.put(jsonObject);
            }

            for(Genomic genomic: annotatedGenomics){
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
                if (genomic.getOncokbVariant() != null && genomic.getOncokbVariant().size() > 0 ) {
                    jsonObject.put("ONCOKB_VARIANT",genomic.getOncokbVariant().toString());
                }
                genomicArray.put(jsonObject);
            }

            // check if any trials matched for query data. We check trials from history(collection "trial_match") to
            // see if any matched records can be found and save them to "matchedResults".
            matchedResults.addAll(findMatchedTrials(previousMatchedRecordsSet, genomicArray, clinicalArray));

            // drop collection "trial_query" first to clean records for previous queries
            // create a new collection "trial_query" to save matched trials from history(collection "trial_match").
            Boolean isDropped = MongoUtil.dropCollection(this.mongoDatabase, "trial_query");
            if (matchedResults.size() > 0) {
                if(isDropped) {
                    Boolean isCreated = MongoUtil.createCollection(this.mongoDatabase,
                        "trial_query", new ArrayList<>(matchedResults));
                    if (!isCreated) {
                        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
            }

            String clinicalPath = FileUtil.buildJsonTempFile(clinicalArray.toString(), clinicalTempFile);
            String genomicPath = FileUtil.buildJsonTempFile(genomicArray.toString(), genomicTempFile);


            ProcessBuilder loadPb = new ProcessBuilder("python", runnableScriptPath + "/matchengine.py",
                "load", "-c", clinicalPath, "-g", genomicPath, "--patient-format", "json", "--mongo-uri", this.uri);
            Boolean isLoad = PythonUtil.runPythonScript(loadPb);

            if(isLoad) {
                // run MatchEngine match() with "--query" flag. "--query" means only match trials to
                // current patient data that is newly added to "new_genomic" and "new_clinical" collections.
                // In this way, MatchEngine won't match from "clinical" and "genomic" collections
                // in case generate duplicate matched records.
                ProcessBuilder matchPb = new ProcessBuilder("python", runnableScriptPath + "/matchengine.py",
                    "match", "--mongo-uri", this.uri);
                Boolean isMatch = PythonUtil.runPythonScript(matchPb);

                if(isMatch) {
                    // export matched result from collection "trial_match" in MongoDB "matchminer"
                    List<Document> matchedTrialDocs = MongoUtil.getCollection(this.mongoDatabase,
                        "new_trial_match");
                    matchedResults.addAll(matchedTrialDocs);
                } else {
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            trialMatchResult = capsulateTrialMatchDoc(matchedResults);

            clinicalTempFile.delete();
            genomicTempFile.delete();

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(trialMatchResult,  HttpStatus.OK);
    }

    public List<Genomic> annotateOncokbVariant(List<Genomic> genomics, String annotateApi) {

        List<Genomic> results = new ArrayList<>(genomics);

        try {
            Set<MatchVariant> matchVariants = new HashSet<>();
            List<Query> queries = new ArrayList<>();
            Map<String, Set<String>> oncoVaMap = new HashMap<>();

            // get genomic attributes for querying "oncokb_variant"
            for (Genomic genomic: genomics) {
                String sampleId = genomic.getSampleId();
                String hugoSymbol = genomic.getTrueHugoSymbol();
                String proteinChange = genomic.getTrueProteinChange();

                // each item of "oncoKbVariants" should be unique
                if (oncoVaMap.containsKey(hugoSymbol)) {
                    oncoVaMap.get(hugoSymbol).add(proteinChange);
                } else {
                    Set<String> proteinChangeSet = new HashSet<>() ;
                    proteinChangeSet.add(proteinChange);
                    oncoVaMap.put(hugoSymbol, proteinChangeSet);
                }

                Query query = new Query();
                query.setId(sampleId);
                query.setHugoSymbol(hugoSymbol);
                query.setAlteration(proteinChange);
                queries.add(query);
            }

            // flatten oncoVaMap
            Set<String> keys = oncoVaMap.keySet();
            for(String key: keys){
                Set<String> valuesSet = oncoVaMap.get(key);
                String[] valuesArr = valuesSet.toArray(new String[valuesSet.size()]);
                for (int i = 0; i < valuesArr.length; i++) {
                    MatchVariant matchVariant = new MatchVariant();
                    matchVariant.setHugoSymbol(key);
                    matchVariant.setAlteration(valuesArr[i]);
                    matchVariants.add(matchVariant);
                }
            }

            MatchVariantRequest request = new MatchVariantRequest();
            request.setOncokbVariants(matchVariants);
            request.setQueries(queries);

            ObjectMapper mapper = new ObjectMapper();
            String postBody = mapper.writeValueAsString(request);
            String response = HttpUtil.postRequest(annotateApi, postBody, true);
            if (response != "TIMEOUT") {
                Gson gson = new GsonBuilder().create();
                MatchVariantResult[] matchVariantResultArr = gson.fromJson(response, MatchVariantResult[].class);

                if (matchVariantResultArr != null) {
                    for (int i = 0; i < matchVariantResultArr.length; i++) {
                        Set<MatchVariant> mvResult= matchVariantResultArr[i].getResult();
                        if (mvResult.size() > 0 ) {
                            ArrayList<String> alterationList = new ArrayList<String>();
                            for (MatchVariant mv: mvResult) {
                                alterationList.add(mv.getAlteration());
                            }
                            results.get(i).setOncokbVariant(alterationList);
                        }
                    }
                } else {
                    return null;
                }
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
        return results;
    }

    public List<TrialMatch> capsulateTrialMatchDoc(List<Document> documents) {
        List<TrialMatch> trialMatches = new LinkedList<>();
        for (Document doc: documents) {
            TrialMatch trialMatch = new TrialMatch();
            trialMatch.setClinicalId(doc.getString("oncokb_clinical_id"));
            trialMatch.setSampleId(doc.getString("sample_id"));
            trialMatch.setOrdPhysicianName(doc.getString("ord_physician_name"));
            trialMatch.setOrdPhysicianEmail(doc.getString("ord_physician_email"));
            trialMatch.setOncotreePrimaryDiagnosisName(doc.getString("oncotree_primary_diagnosis_name"));
            trialMatch.setVitalStatus(doc.getString("vital_status"));
            trialMatch.setFirstLast(doc.getString("first_last"));
            trialMatch.setReportDate(doc.getString("report_date"));
            trialMatch.setMrn(doc.getInteger("mrn"));

            trialMatch.setGenomicId(doc.getString("oncokb_genomic_id"));
            trialMatch.setTrueHugoSymbol(doc.getString("true_hugo_symbol"));
            trialMatch.setTrueProteinChange(doc.getString("true_protein_change"));
            trialMatch.setTrueVariantClassification(doc.getString("true_variant_classification"));
            trialMatch.setVariantCategory(doc.getString("variant_category"));
            trialMatch.setCnvCall(doc.getString("cnv_call"));

            trialMatch.setWildtype(doc.getBoolean("wildtype"));
            trialMatch.setChromosome(doc.getString("chromosome"));
            trialMatch.setPosition(doc.getString("position"));
            trialMatch.setTrueCdnaChange(doc.getString("true_cdna_change"));
            trialMatch.setReferenceAllele(doc.getString("reference_allele"));
            trialMatch.setTrueTranscriptExon(doc.getDouble("true_transcript_exon"));
            trialMatch.setCanonicalStrand(doc.getString("canonical_strand"));
            trialMatch.setAlleleFraction(doc.getDouble("allele_fraction"));
            trialMatch.setTier(doc.getDouble("tier"));

            trialMatch.setProtocolNo(doc.getString("protocol_no"));
            trialMatch.setNctId(doc.getString("nct_id"));
            trialMatch.setGenomicAlteration(doc.getString("genomic_alteration"));
            trialMatch.setMatchType(doc.getString("match_type"));
            trialMatch.setTrialAccrualStatus(doc.getString("trial_accrual_status"));
            trialMatch.setMatchLevel(doc.getString("match_level"));
            trialMatch.setCode(doc.getString("code"));
            trialMatch.setInternalId(doc.getString("internal_id"));

            trialMatches.add(trialMatch);
        }

        return trialMatches;
    }

    public List<Document> findMatchedTrials(Set<Document> matchedRecordsSet,
                                           JSONArray genomicArray, JSONArray clinicalArray) throws JSONException{
        List<Document> matchedResults = new LinkedList<>();
        for (Document doc: matchedRecordsSet) {
            for (int i = 0; i < genomicArray.length(); i++){
                if (doc.getString("oncokb_genomic_id").equals(
                    genomicArray.getJSONObject(i).getString("ONCOKB_GENOMIC_ID"))){
                    for (int j = 0; j < clinicalArray.length(); j++) {
                        if (doc.getString("oncokb_clinical_id").equals(clinicalArray.getJSONObject(j)
                            .getString("ONCOKB_CLINICAL_ID"))){
                            matchedResults.add(doc);
                            if (matchedResults.size() == matchedRecordsSet.size()) {
                                return matchedResults;
                            }
                        }
                    }
                }
            }
        }
        return  matchedResults;
    }
}

