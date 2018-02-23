package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModelProperty;

import javax.validation.constraints.NotNull;
import java.util.Objects;

/**
 * TrialJson
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2018-02-23T17:47:44.538-05:00")

public class TrialJson {
  @JsonProperty("trial")
  private Object trial = null;

  public TrialJson trial(Object trial) {
    this.trial = trial;
    return this;
  }

   /**
   * Get trial
   * @return trial
  **/
  @ApiModelProperty(required = true, value = "")
  @NotNull


  public Object getTrial() {
    return trial;
  }

  public void setTrial(Object trial) {
    this.trial = trial;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    TrialJson trialJson = (TrialJson) o;
    return Objects.equals(this.trial, trialJson.trial);
  }

  @Override
  public int hashCode() {
    return Objects.hash(trial);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class TrialJson {\n");

    sb.append("    trial: ").append(toIndentedString(trial)).append("\n");
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

