package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModelProperty;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author Jing Su
 */

public class Patient {
    @JsonProperty("id")
    @ApiModelProperty(required = true, value = "", example = "TCGA-D3-A5GT")
    @NotNull
    String id;

    @JsonProperty("clinical")
    @ApiModelProperty(required = true, value = "")
    @NotNull
    Clinical clinical;

    @JsonProperty("genomics")
    @ApiModelProperty(required = true, value = "")
    @NotNull
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
