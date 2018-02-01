package org.mskcc.oncokb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * LoadData
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2018-02-01T17:14:20.753-05:00")

public class LoadData   {
    @JsonProperty("dataType")
    private String dataType = null;

    @JsonProperty("content")
    private Object content = null;

    public LoadData dataType(String dataType) {
        this.dataType = dataType;
        return this;
    }

    /**
     * Get dataType
     * @return dataType
     **/
    @ApiModelProperty(required = true, value = "")
    @NotNull


    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public LoadData content(Object content) {
        this.content = content;
        return this;
    }

    /**
     * Get content
     * @return content
     **/
    @ApiModelProperty(required = true, value = "")
    @NotNull


    public Object getContent() {
        return content;
    }

    public void setContent(Object content) {
        this.content = content;
    }


    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        LoadData loadData = (LoadData) o;
        return Objects.equals(this.dataType, loadData.dataType) &&
            Objects.equals(this.content, loadData.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(dataType, content);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class LoadData {\n");

        sb.append("    dataType: ").append(toIndentedString(dataType)).append("\n");
        sb.append("    content: ").append(toIndentedString(content)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces
     * (except the first line).
     */
    private String toIndentedString(java.lang.Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}

