package org.mskcc.oncokb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.constraints.*;

/**
 * Trial
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2018-05-09T18:04:03.019-04:00")

public class Trial   {
  @JsonProperty("archived")
  private String archived = null;

  @JsonProperty("curationStatus")
  private String curationStatus = null;

  @JsonProperty("nctId")
  private String nctId = null;

  @JsonProperty("longTitle")
  private String longTitle = null;

  @JsonProperty("phase")
  private String phase = null;

  @JsonProperty("shortTitle")
  private String shortTitle = null;

  @JsonProperty("status")
  private String status = null;

  @JsonProperty("treatmentList")
  private String treatmentList = null;

  public Trial archived(String archived) {
    this.archived = archived;
    return this;
  }

   /**
   * Get archived
   * @return archived
  **/
  @ApiModelProperty(value = "")


  public String getArchived() {
    return archived;
  }

  public void setArchived(String archived) {
    this.archived = archived;
  }

  public Trial curationStatus(String curationStatus) {
    this.curationStatus = curationStatus;
    return this;
  }

   /**
   * Get curationStatus
   * @return curationStatus
  **/
  @ApiModelProperty(value = "")


  public String getCurationStatus() {
    return curationStatus;
  }

  public void setCurationStatus(String curationStatus) {
    this.curationStatus = curationStatus;
  }

  public Trial nctId(String nctId) {
    this.nctId = nctId;
    return this;
  }

   /**
   * Get nctId
   * @return nctId
  **/
  @ApiModelProperty(required = true, value = "")
  @NotNull


  public String getNctId() {
    return nctId;
  }

  public void setNctId(String nctId) {
    this.nctId = nctId;
  }

  public Trial longTitle(String longTitle) {
    this.longTitle = longTitle;
    return this;
  }

   /**
   * Get longTitle
   * @return longTitle
  **/
  @ApiModelProperty(value = "")


  public String getLongTitle() {
    return longTitle;
  }

  public void setLongTitle(String longTitle) {
    this.longTitle = longTitle;
  }

  public Trial phase(String phase) {
    this.phase = phase;
    return this;
  }

   /**
   * Get phase
   * @return phase
  **/
  @ApiModelProperty(value = "")


  public String getPhase() {
    return phase;
  }

  public void setPhase(String phase) {
    this.phase = phase;
  }

  public Trial shortTitle(String shortTitle) {
    this.shortTitle = shortTitle;
    return this;
  }

   /**
   * Get shortTitle
   * @return shortTitle
  **/
  @ApiModelProperty(value = "")


  public String getShortTitle() {
    return shortTitle;
  }

  public void setShortTitle(String shortTitle) {
    this.shortTitle = shortTitle;
  }

  public Trial status(String status) {
    this.status = status;
    return this;
  }

   /**
   * Get status
   * @return status
  **/
  @ApiModelProperty(value = "")


  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Trial treatmentList(String treatmentList) {
    this.treatmentList = treatmentList;
    return this;
  }

   /**
   * Get treatmentList
   * @return treatmentList
  **/
  @ApiModelProperty(value = "")


  public String getTreatmentList() {
    return treatmentList;
  }

  public void setTreatmentList(String treatmentList) {
    this.treatmentList = treatmentList;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Trial trial = (Trial) o;
    return Objects.equals(this.archived, trial.archived) &&
        Objects.equals(this.curationStatus, trial.curationStatus) &&
        Objects.equals(this.nctId, trial.nctId) &&
        Objects.equals(this.longTitle, trial.longTitle) &&
        Objects.equals(this.phase, trial.phase) &&
        Objects.equals(this.shortTitle, trial.shortTitle) &&
        Objects.equals(this.status, trial.status) &&
        Objects.equals(this.treatmentList, trial.treatmentList);
  }

  @Override
  public int hashCode() {
    return Objects.hash(archived, curationStatus, nctId, longTitle, phase, shortTitle, status, treatmentList);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Trial {\n");

    sb.append("    archived: ").append(toIndentedString(archived)).append("\n");
    sb.append("    curationStatus: ").append(toIndentedString(curationStatus)).append("\n");
    sb.append("    nctId: ").append(toIndentedString(nctId)).append("\n");
    sb.append("    longTitle: ").append(toIndentedString(longTitle)).append("\n");
    sb.append("    phase: ").append(toIndentedString(phase)).append("\n");
    sb.append("    shortTitle: ").append(toIndentedString(shortTitle)).append("\n");
    sb.append("    status: ").append(toIndentedString(status)).append("\n");
    sb.append("    treatmentList: ").append(toIndentedString(treatmentList)).append("\n");
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

