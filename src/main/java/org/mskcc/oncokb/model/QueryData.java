package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModelProperty;

import javax.validation.constraints.NotNull;
import java.util.Objects;

/**
 * QueryData
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2018-02-12T18:27:51.197-05:00")

public class QueryData {
  @JsonProperty("clinical")
  private Object clinical = null;

  @JsonProperty("genomic")
  private Object genomic = null;

  public QueryData clinical(Object clinical) {
    this.clinical = clinical;
    return this;
  }

   /**
   * Get clinical
   * @return clinical
  **/
  @ApiModelProperty(value = "")


  public Object getClinical() {
    return clinical;
  }

  public void setClinical(Object clinical) {
    this.clinical = clinical;
  }

  public QueryData genomic(Object genomic) {
    this.genomic = genomic;
    return this;
  }

   /**
   * Get genomic
   * @return genomic
  **/
  @ApiModelProperty(required = true, value = "")
  @NotNull


  public Object getGenomic() {
    return genomic;
  }

  public void setGenomic(Object genomic) {
    this.genomic = genomic;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    QueryData queryData = (QueryData) o;
    return Objects.equals(this.clinical, queryData.clinical) &&
        Objects.equals(this.genomic, queryData.genomic);
  }

  @Override
  public int hashCode() {
    return Objects.hash(clinical, genomic);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class QueryData {\n");

    sb.append("    clinical: ").append(toIndentedString(clinical)).append("\n");
    sb.append("    genomic: ").append(toIndentedString(genomic)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

