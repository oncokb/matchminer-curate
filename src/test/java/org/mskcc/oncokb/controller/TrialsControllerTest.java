package org.mskcc.oncokb.controller;

import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.mskcc.oncokb.MatchminerCurateApp;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.*;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(Parameterized.class)
@SpringBootTest(classes = MatchminerCurateApp.class)
public class TrialsControllerTest {
    private String[] clinical;
    private String[] genomics;
    private String[] trialMatch;
    private String[] expectedNctIds;

    public TrialsControllerTest(String[] clinical, String[] genomics, String[] trialMatch, String[] expectedNctIds){
        this.clinical = clinical;
        this.genomics = genomics;
        this.trialMatch = trialMatch;
        this.expectedNctIds = expectedNctIds;
    }

    @Parameterized.Parameters
    public static Collection<String[][]> getParameters() {
        return Arrays.asList(new String[][][]{
            {{
                "{\"ORD_PHYSICIAN_EMAIL\":\"Parker@fake_email.com\"," +
                    "\"VITAL_STATUS\":\"alive\"," +
                    "\"REPORT_DATE\":\"2015-06-15\"," +
                    "\"ORD_PHYSICIAN_NAME\":\"Parker Swinford [fake] M.D.\"," +
                    "\"FIRST_LAST\":\"Shirley Kavanagh[Fake]\"," +
                    "\"ONCOKB_CLINICAL_ID\":\"0\"," +
                    "\"BIRTH_DATE\":\"1961-12-17\"," +
                    "\"GENDER\":\"Female\"," +
                    "\"ONCOTREE_PRIMARY_DIAGNOSIS_NAME\":\"Breast Invasive Ductal Carcinoma\"," +
                    "\"DFCI_MRN\":0," +
                    "\"SAMPLE_ID\":\"BRCA-METABRIC-S1-MB-0506\"}",
                "{\"SAMPLE_ID\":\"BRCA-METABRIC-S1-MB-0877\", " +
                    "\"BIRTH_DATE\":\"1940-09-23\", " +
                    "\"ONCOKB_CLINICAL_ID\":\"19\"," +
                    "\"GENDER\":\"Male\"}"
            }, {
                "{\"ONCOKB_GENOMIC_ID\":\"BRCA-METABRIC-S1-MB-0506&PIK3CA&p.H1047R&Missense_Mutation&MUTATION&&false&chr3&178952085&c.A900G&A&8&&0.5827659956067299&3\"," +
                    "\"TIER\":3," +
                    "\"WILDTYPE\":false," +
                    "\"ANNOTATED_VARIANT\":\"[p.H1047R]\"," +
                    "\"TRUE_CDNA_CHANGE\":\"c.A900G\"," +
                    "\"CHROMOSOME\":\"chr3\"," +
                    "\"POSITION\":\"178952085\"," +
                    "\"TRUE_TRANSCRIPT_EXON\":8," +
                    "\"TRUE_PROTEIN_CHANGE\":\"p.H1047R\"," +
                    "\"REFERENCE_ALLELE\":\"A\"," +
                    "\"TRUE_VARIANT_CLASSIFICATION\":\"Missense_Mutation\"," +
                    "\"VARIANT_CATEGORY\":\"MUTATION\"," +
                    "\"ALLELE_FRACTION\":0.5827659956067299," +
                    "\"CNV_CALL\":\"\"," +
                    "\"SAMPLE_ID\":\"BRCA-METABRIC-S1-MB-0506\"," +
                    "\"TRUE_HUGO_SYMBOL\":\"PIK3CA\"}",
                "{\"ONCOKB_GENOMIC_ID\":\"BRCA-METABRIC-S1-MB-0877&BRAF&T599_V600insEAT&Silent&MUTATION\"," +
                    "\"ANNOTATED_VARIANT\":\"[T599_V600insEAT]\"," +
                    "\"TRUE_PROTEIN_CHANGE\":\"T599_V600insEAT\"," +
                    "\"TRUE_VARIANT_CLASSIFICATION\":\"Silent\"," +
                    "\"VARIANT_CATEGORY\":\"MUTATION\"," +
                    "\"SAMPLE_ID\":\"BRCA-METABRIC-S1-MB-1000\"," +
                    "\"TRUE_HUGO_SYMBOL\":\"BRAF\"}"
            }, {
                "{\"oncokb_clinical_id\":\"19\"," +
                    "\"sample_id\":\"BRCA-METABRIC-S1-MB-0877\"," +
                    "\"ord_physician_name\":\"Parker Swinford [fake] M.D.\"," +
                    "\"ord_physician_email\":\"Parker@fake_email.com\"," +
                    "\"oncotree_primary_diagnosis_name\":\"Breast Invasive Ductal Carcinoma\"," +
                    "\"vital_status\":\"deceased\"," +
                    "\"first_last\":\"Michael Harris[Fake]\"," +
                    "\"report_date\":\"2015-11-17 00:00:00\"," +
                    "\"mrn\":19," +
                    "\"oncokb_genomic_id\":\"BRCA-METABRIC-S1-MB-0877&BRAF&T599_V600insEAT&Silent&MUTATION\"," +
                    "\"true_hugo_symbol\":\"BRAF\"," +
                    "\"true_protein_change\":\"T599_V600insEAT\"," +
                    "\"true_variant_classification\":\"Silent\"," +
                    "\"variant_category\":\"MUTATION\"," +
                    "\"nct_id\":\"NCT02561962\"," +
                    "\"genomic_alteration\":\"BRAF T599_V600insEAT\"," +
                    "\"match_type\":\"annotated_variant\"," +
                    "\"trial_accrual_status\":\"open\"," +
                    "\"match_level\":\"step\"}"

            }, {"NCT02561962"}}

        });
    }
    @Test
    public void testFindMatchedTrials(){
        TrialsController trialsController = new TrialsController();
        JSONArray clinicalArray = new JSONArray();
        JSONArray genomicsArray = new JSONArray();
        Set<Document> trialMatchDocs = new HashSet<>();

        try {
            for(String clinicalJson: this.clinical) {
                clinicalArray.put(new JSONObject(clinicalJson));
            }
            for(String genomicJson: this.genomics) {
                genomicsArray.put(new JSONObject(genomicJson));
            }
            for(String trialMatchJson: this.trialMatch) {
                Document doc = Document.parse(trialMatchJson);
                trialMatchDocs.add(doc);
            }
            List<Document> matchedResults = trialsController.findMatchedTrials(trialMatchDocs,genomicsArray,clinicalArray);
            assertThat(matchedResults.size()).isEqualTo(this.expectedNctIds.length);
            for (Document doc: matchedResults) {
                assertThat(Arrays.asList(this.expectedNctIds).contains(doc.getString("nct_id")));
            }
        } catch(JSONException e) {
            e.printStackTrace();
        }
    }

}
