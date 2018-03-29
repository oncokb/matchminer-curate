package org.mskcc.oncokb.controller;

import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mskcc.oncokb.MatchminerCurateApp;
import org.mskcc.oncokb.model.Clinical;
import org.mskcc.oncokb.model.Genomic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit4.SpringRunner;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@Configuration
@SpringBootTest(classes = MatchminerCurateApp.class)
public class TrialsControllerTest {
    private List<Clinical> clinicals;
    private List<Genomic> genomics;
    private JSONArray clinicalArray;
    private JSONArray genomicArray;
    private Set<Document> trialMatchDocs;
    private TrialsController trialsController;

    @Value("${application.oncokb.api.match-variant}")
    private String oncokbMatchVariantApi;

    @Before
    public void setup() {
        clinicals = new ArrayList<>();
        genomics = new ArrayList<>();
        clinicalArray = new JSONArray();
        genomicArray = new JSONArray();
        trialMatchDocs = new HashSet<>();
        trialsController = new TrialsController();

        try {
            clinicals.add(new Clinical("BRCA-METABRIC-S1-MB-0506","Parker Swinford [fake] M.D.",
                "Parker@fake_email.com", "Breast Invasive Ductal Carcinoma",
                "2015-06-15", "alive", "Shirley Kavanagh[Fake]", "1961-12-17",
                0, "female"));
            clinicals.add(new Clinical("BRCA-METABRIC-S1-MB-0877", "1937-04-30", "female"));
            genomics.add(new Genomic("BRCA-METABRIC-S1-MB-0506", "PIK3CA",
                "p.H1047R", "Missense_Mutation", "MUTATION", null,
                false, "chr3", "178952085", "c.A900G", "A",
                8, "-", 0.5827659956067299, 3));
            genomics.add(new Genomic("BRCA-METABRIC-S1-MB-0506", "TP53",
                "p.C135W", "Missense_Mutation", "Mutation", null,
                false, "chr17", "7578525", "c.G531C", "G",
                8, "-", 0.5721701032601486, 2));
            genomics.add(new Genomic("BRCA-METABRIC-S1-MB-0877", "BRAF",
                "T599_V600insEAT", "Silent", "MUTATION"));

            clinicalArray.put(new JSONObject("{\"ORD_PHYSICIAN_EMAIL\":\"Parker@fake_email.com\"," +
                "\"VITAL_STATUS\":\"alive\"," +
                "\"REPORT_DATE\":\"2015-06-15\"," +
                "\"ORD_PHYSICIAN_NAME\":\"Parker Swinford [fake] M.D.\"," +
                "\"FIRST_LAST\":\"Shirley Kavanagh[Fake]\"," +
                "\"ONCOKB_CLINICAL_ID\":\"0\"," +
                "\"BIRTH_DATE\":\"1961-12-17\"," +
                "\"GENDER\":\"Female\"," +
                "\"ONCOTREE_PRIMARY_DIAGNOSIS_NAME\":\"Breast Invasive Ductal Carcinoma\"," +
                "\"DFCI_MRN\":0," +
                "\"SAMPLE_ID\":\"BRCA-METABRIC-S1-MB-0506\"}"));
            clinicalArray.put(new JSONObject("{\"SAMPLE_ID\":\"BRCA-METABRIC-S1-MB-0877\", " +
                "\"BIRTH_DATE\":\"1940-09-23\", " +
                "\"ONCOKB_CLINICAL_ID\":\"19\"," +
                "\"GENDER\":\"Male\"}"));

            genomicArray.put(new JSONObject("{\"ONCOKB_GENOMIC_ID\":\"BRCA-METABRIC-S1-MB-0506&PIK3CA&p.H1047R&Missense_Mutation&MUTATION&&false&chr3&178952085&c.A900G&A&8&&0.5827659956067299&3\"," +
                "\"TIER\":3," +
                "\"WILDTYPE\":false," +
                "\"ONCOKB_VARIANT\":\"[p.H1047R]\"," +
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
                "\"TRUE_HUGO_SYMBOL\":\"PIK3CA\"}"));
            genomicArray.put(new JSONObject("{\"ONCOKB_GENOMIC_ID\":\"BRCA-METABRIC-S1-MB-0877&BRAF&T599_V600insEAT&Silent&MUTATION\"," +
                "\"ONCOKB_VARIANT\":\"[T599_V600insEAT]\"," +
                "\"TRUE_PROTEIN_CHANGE\":\"T599_V600insEAT\"," +
                "\"TRUE_VARIANT_CLASSIFICATION\":\"Silent\"," +
                "\"VARIANT_CATEGORY\":\"MUTATION\"," +
                "\"SAMPLE_ID\":\"BRCA-METABRIC-S1-MB-1000\"," +
                "\"TRUE_HUGO_SYMBOL\":\"BRAF\"}"));

            Document doc = new Document();
            doc.put("oncokb_clinical_id", "19");
            doc.put("sample_id", "BRCA-METABRIC-S1-MB-0877");
            doc.put("ord_physician_name", "Parker Swinford [fake] M.D.");
            doc.put("ord_physician_email", "Parker@fake_email.com");
            doc.put("oncotree_primary_diagnosis_name", "Breast Invasive Ductal Carcinoma");
            doc.put("vital_status", "deceased");
            doc.put("first_last", "Michael Harris[Fake]");
            doc.put("report_date", "2015-11-17 00:00:00");
            doc.put("mrn", 19);
            doc.put("oncokb_genomic_id", "BRCA-METABRIC-S1-MB-0877&BRAF&T599_V600insEAT&Silent&MUTATION");
            doc.put("true_hugo_symbol", "BRAF");
            doc.put("true_protein_change", "T599_V600insEAT");
            doc.put("true_variant_classification", "Silent");
            doc.put("variant_category", "MUTATION");
            doc.put("nct_id", "NCT02561962");
            doc.put("genomic_alteration", "BRAF T599_V600insEAT");
            doc.put("match_type", "oncokb_variant");
            doc.put("trial_accrual_status", "open");
            doc.put("match_level", "step");
            trialMatchDocs.add(doc);

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testFindMatchedTrials(){
        try {
            List<Document> matchedResults = trialsController.findMatchedTrials(trialMatchDocs,genomicArray,clinicalArray);
            assertThat(matchedResults.size()).isEqualTo(1);
            for (Document doc: matchedResults) {
                assertThat(doc.getString("nct_id")).isEqualTo("NCT02561962");
            }
        } catch(JSONException e) {
            e.printStackTrace();
        }
    }

}
