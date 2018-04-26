package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.annotations.ApiModelProperty;
import org.apache.commons.lang3.StringUtils;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Jing Su
 */

public class Clinical implements java.io.Serializable {

    @ApiModelProperty(required = true, value = "", example = "TCGA-D3-A5GT-01")
    @NotNull
    private String sampleId;
    @ApiModelProperty(example = " ")
    private String ordPhysicianName;
    @ApiModelProperty(example = " ")
    private String ordPhysicianEmail;
    @ApiModelProperty(example = "Melanoma")
    private String oncotreePrimaryDiagnosisName;
    @Pattern(regexp="/(\\d{4}[-]\\d{2}[-]\\d{2})/", message="Invalid report date format! Report date should be yyyy-mm-dd.")
    @ApiModelProperty(example = "2018-03-01")
    private String reportDate; // format: yyyy-mm-dd
    @ApiModelProperty(example = " ")
    private String vitalStatus;
    @ApiModelProperty(example = " ")
    private String firstLast;
    @Pattern(regexp="/(\\d{4}[-]\\d{2}[-]\\d{2})/", message="Invalid birth date format! Birth date should be yyyy-mm-dd.")
    @ApiModelProperty(example = "1975-03-01")
    private String birthDate; // format: yyyy-mm-dd
    @ApiModelProperty(example = " ")
    private Integer mrn;
    @ApiModelProperty(example = "Male")
    private String gender;

    public Clinical(){
    }

    // constructor for oncokb
    public Clinical(String sampleId, String birthDate, String gender) {
        this.birthDate = birthDate;
        this.sampleId = sampleId;
        this.gender = gender;
    }

    public Clinical(String sampleId, String birthDate, String gender, String oncotreePrimaryDiagnosisName) {
        this.birthDate = birthDate;
        this.sampleId = sampleId;
        this.gender = gender;
        this.oncotreePrimaryDiagnosisName = oncotreePrimaryDiagnosisName;
    }

    // constructor for matchminer
    public Clinical(String sampleId, String ordPhysicianName, String ordPhysicianEmail,
                    String oncotreePrimaryDiagnosisName, String reportDate, String vitalStatus,
                    String firstLast, String birthDate, Integer mrn, String gender) {
        this.sampleId = sampleId;
        this.ordPhysicianName = ordPhysicianName;
        this.ordPhysicianEmail = ordPhysicianEmail;
        this.oncotreePrimaryDiagnosisName = oncotreePrimaryDiagnosisName;
        this.reportDate = reportDate;
        this.vitalStatus = vitalStatus;
        this.firstLast = firstLast;
        this.birthDate = birthDate;
        this.mrn = mrn;
        this.gender = gender;
    }

    public String getSampleId() {
        return sampleId;
    }

    public void setSampleId(String sampleId) {
        this.sampleId = sampleId;
    }

    public String getOrdPhysicianName() {
        return ordPhysicianName;
    }

    public void setOrdPhysicianName(String ordPhysicianName) {
        this.ordPhysicianName = ordPhysicianName;
    }

    public String getOrdPhysicianEmail() {
        return ordPhysicianEmail;
    }

    public void setOrdPhysicianEmail(String ordPhysicianEmail) {
        this.ordPhysicianEmail = ordPhysicianEmail;
    }

    public String getOncotreePrimaryDiagnosisName() {
        return oncotreePrimaryDiagnosisName;
    }

    public void setOncotreePrimaryDiagnosisName(String oncotreePrimaryDiagnosisName) {
        this.oncotreePrimaryDiagnosisName = oncotreePrimaryDiagnosisName;
    }

    public String getReportDate() {
        return reportDate;
    }

    public void setReportDate(String reportDate) {
        this.reportDate = reportDate;
    }

    public String getVitalStatus() {
        return vitalStatus;
    }

    public void setVitalStatus(String vitalStatus) {
        this.vitalStatus = vitalStatus;
    }

    public String getFirstLast() {
        return firstLast;
    }

    public void setFirstLast(String firstLast) {
        this.firstLast = firstLast;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public Integer getMrn() {
        return mrn;
    }

    public void setMrn(Integer mrn) {
        this.mrn = mrn;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    @JsonIgnore
    public String getClinicalId() {
        String clinicalId = "";
        List<String> content = new ArrayList<>();
        if (this.sampleId != null) {
            content.add(this.sampleId);
        } else {
            content.add("");
        }
//            if (this.ordPhysicianName != null) {
//                content.add(this.ordPhysicianName);
//            } else {
//                content.add("");
//            }
//            if (this.ordPhysicianEmail != null) {
//                content.add(this.ordPhysicianEmail);
//            } else {
//                content.add("");
//            }
        if (this.oncotreePrimaryDiagnosisName != null) {
            content.add(this.oncotreePrimaryDiagnosisName);
        } else {
            content.add("");
        }
//            if (this.reportDate != null) {
//                content.add(this.reportDate);
//            } else {
//                content.add("");
//            }
        if (this.vitalStatus != null) {
            content.add(this.vitalStatus);
        } else {
            content.add("");
        }
        if (this.firstLast != null) {
            content.add(this.firstLast);
        } else {
            content.add("");
        }
        if (this.birthDate != null) {
            content.add(this.birthDate);
        } else {
            content.add("");
        }
        if (this.gender != null) {
            content.add(this.gender);
        } else {
            content.add("");
        }
        if (this.mrn != null) {
            content.add(Integer.toString(this.mrn));
        } else {
            content.add("");
        }
        clinicalId = StringUtils.join(content.toArray(), "&");

        return clinicalId;
    }

}
