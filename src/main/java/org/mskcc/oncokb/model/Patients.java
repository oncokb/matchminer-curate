package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * @author Jing Su
 */

public class Patients {
    @JsonProperty("clinicals")
    List<Clinical> clinicals;

    @JsonProperty("genomics")
    List<Genomic> genomics;

    public List<Clinical> getClinicals() {
        return clinicals;
    }

    public void setClinicals(List<Clinical> clinicals) {
        this.clinicals = clinicals;
    }

    public List<Genomic> getGenomics() {
        return genomics;
    }

    public void setGenomics(List<Genomic> genomics) {
        this.genomics = genomics;
    }
}
