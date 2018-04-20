package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.annotations.ApiModelProperty;
import org.apache.commons.lang3.StringUtils;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Jing Su
 */

public class Clinical implements java.io.Serializable {

    @ApiModelProperty(required = true, value = "", example = "TCGA-D3-A5GT-01")
    @NotNull
    private String sampleId;
    @ApiModelProperty(example = "Parker Swinford [fake] M.D.")
    private String ordPhysicianName;
    @ApiModelProperty(example = "Parker@fake_email.com")
    private String ordPhysicianEmail;
    @ApiModelProperty(example = "Melanoma")
    private String oncotreePrimaryDiagnosisName;
    @ApiModelProperty(example = "2015-06-15")
    private String reportDate; // format: yyyy-mm-dd
    @ApiModelProperty(example = "alive")
    private String vitalStatus;
    @ApiModelProperty(example = "Shirley Kavanagh[Fake]")
    private String firstLast;
    @ApiModelProperty(example = "1975-03-01")
    private String birthDate; // format: yyyy-mm-dd
    @ApiModelProperty(example = "mrn123")
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
        if (this.mrn != null){
            clinicalId = Integer.toString(this.mrn);
        } else {
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
            clinicalId = StringUtils.join(content.toArray(), "&");
        }

        return clinicalId;
    }

}
