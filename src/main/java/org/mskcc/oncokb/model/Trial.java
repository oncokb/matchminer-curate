package org.mskcc.oncokb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Trial
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-12-15T19:20:18.631-05:00")

public class Trial   {
  @JsonProperty("content")
  private String content = null;

  @JsonProperty("dataType")
  private String dataType = null;

  public Trial content(String content) {
    this.content = content;
    return this;
  }

   /**
   * trial object json/yaml string
   * @return content
  **/
  @ApiModelProperty(required = true, value = "trial object json/yaml string")
  @NotNull


  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public Trial dataType(String dataType) {
    this.dataType = dataType;
    return this;
  }

   /**
   * choose one of json/yaml type
   * @return dataType
  **/
  @ApiModelProperty(required = true, value = "choose one of json/yaml type")
  @NotNull


  public String getDataType() {
    return dataType;
  }

  public void setDataType(String dataType) {
    this.dataType = dataType;
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
    return Objects.equals(this.content, trial.content) &&
        Objects.equals(this.dataType, trial.dataType);
  }

  @Override
  public int hashCode() {
    return Objects.hash(content, dataType);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Trial {\n");

    sb.append("    content: ").append(toIndentedString(content)).append("\n");
    sb.append("    dataType: ").append(toIndentedString(dataType)).append("\n");
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

