package org.mskcc.oncokb.model;

public class Trial {
    private String longTitle;
    private String nctId;
    private String phase;
    private String shortTitle;
    private String status;
    private String treatmentList;

    public String getLongTitle() {
        return longTitle;
    }

    public void setLongTitle(String longTitle) {
        this.longTitle = longTitle;
    }

    public String getNctId() {
        return nctId;
    }

    public void setNctId(String nctId) {
        this.nctId = nctId;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getShortTitle() {
        return shortTitle;
    }

    public void setShortTitle(String shortTitle) {
        this.shortTitle = shortTitle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTreatmentList() {
        return treatmentList;
    }

    public void setTreatmentList(String treatmentList) {
        this.treatmentList = treatmentList;
    }
}
