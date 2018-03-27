package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * @author Jing Su
 */

public class Patient {
    @JsonProperty("id")
    String id;

    @JsonProperty("clinical")
    Clinical clinical;

    @JsonProperty("genomics")
    List<Genomic> genomics;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Clinical getClinical() {
        return clinical;
    }

    public void setClinical(Clinical clinical) {
        this.clinical = clinical;
    }

    public List<Genomic> getGenomics() {
        return genomics;
    }

    public void setGenomics(List<Genomic> genomics) {
        this.genomics = genomics;
    }
}
