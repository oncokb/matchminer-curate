package org.mskcc.oncokb.model;


public class TrialMatch implements java.io.Serializable{

    // attributes from Clinical
    private String clinicalId;
    private String sampleId;
    private String ordPhysicianName;
    private String ordPhysicianEmail;
    private String oncotreePrimaryDiagnosisName;
    private String vitalStatus;
    private String firstLast;
    private String reportDate; // format: mm/dd/yy hh:mm
    private Integer mrn;

    // attributes from Genomic
    private String genomicId;
    private String trueHugoSymbol;
    private String trueProteinChange;
    private String trueVariantClassification;
    private String variantCategory;
    private String cnvCall;
    private Boolean wildtype;
    private String chromosome;
    private String position;
    private String trueCdnaChange;
    private String referenceAllele;
    private Double trueTranscriptExon;
    private String canonicalStrand;
    private Double alleleFraction;
    private Double tier;

    // attributes from Trial
    private String protocolNo;
    private String nctId;
    private String genomicAlteration;
    private String matchType;
    private String trialAccrualStatus;
    private String matchLevel;
    private String code;
    private String internalId;

    public String getSampleId() {
        return sampleId;
    }

    public String getClinicalId() {
        return clinicalId;
    }

    public void setClinicalId(String clinicalId) {
        this.clinicalId = clinicalId;
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

    public String getReportDate() {
        return reportDate;
    }

    public void setReportDate(String reportDate) {
        this.reportDate = reportDate;
    }

    public Integer getMrn() {
        return mrn;
    }

    public void setMrn(Integer mrn) {
        this.mrn = mrn;
    }

    public String getGenomicId() {
        return genomicId;
    }

    public void setGenomicId(String genomicId) {
        this.genomicId = genomicId;
    }

    public String getTrueHugoSymbol() {
        return trueHugoSymbol;
    }

    public void setTrueHugoSymbol(String trueHugoSymbol) {
        this.trueHugoSymbol = trueHugoSymbol;
    }

    public String getTrueProteinChange() {
        return trueProteinChange;
    }

    public void setTrueProteinChange(String trueProteinChange) {
        this.trueProteinChange = trueProteinChange;
    }

    public String getTrueVariantClassification() {
        return trueVariantClassification;
    }

    public void setTrueVariantClassification(String trueVariantClassification) {
        this.trueVariantClassification = trueVariantClassification;
    }

    public String getVariantCategory() {
        return variantCategory;
    }

    public void setVariantCategory(String variantCategory) {
        this.variantCategory = variantCategory;
    }

    public String getCnvCall() {
        return cnvCall;
    }

    public void setCnvCall(String cnvCall) {
        this.cnvCall = cnvCall;
    }

    public Boolean getWildtype() {
        return wildtype;
    }

    public void setWildtype(Boolean wildtype) {
        this.wildtype = wildtype;
    }

    public String getChromosome() {
        return chromosome;
    }

    public void setChromosome(String chromosome) {
        this.chromosome = chromosome;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getTrueCdnaChange() {
        return trueCdnaChange;
    }

    public void setTrueCdnaChange(String trueCdnaChange) {
        this.trueCdnaChange = trueCdnaChange;
    }

    public String getReferenceAllele() {
        return referenceAllele;
    }

    public void setReferenceAllele(String referenceAllele) {
        this.referenceAllele = referenceAllele;
    }

    public Double getTrueTranscriptExon() {
        return trueTranscriptExon;
    }

    public void setTrueTranscriptExon(Double trueTranscriptExon) {
        this.trueTranscriptExon = trueTranscriptExon;
    }

    public String getCanonicalStrand() {
        return canonicalStrand;
    }

    public void setCanonicalStrand(String canonicalStrand) {
        this.canonicalStrand = canonicalStrand;
    }

    public Double getAlleleFraction() {
        return alleleFraction;
    }

    public void setAlleleFraction(Double alleleFraction) {
        this.alleleFraction = alleleFraction;
    }

    public Double getTier() {
        return tier;
    }

    public void setTier(Double tier) {
        this.tier = tier;
    }

    public String getProtocolNo() {
        return protocolNo;
    }

    public void setProtocolNo(String protocolNo) {
        this.protocolNo = protocolNo;
    }

    public String getNctId() {
        return nctId;
    }

    public void setNctId(String nctId) {
        this.nctId = nctId;
    }

    public String getGenomicAlteration() {
        return genomicAlteration;
    }

    public void setGenomicAlteration(String genomicAlteration) {
        this.genomicAlteration = genomicAlteration;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public String getTrialAccrualStatus() {
        return trialAccrualStatus;
    }

    public void setTrialAccrualStatus(String trialAccrualStatus) {
        this.trialAccrualStatus = trialAccrualStatus;
    }

    public String getMatchLevel() {
        return matchLevel;
    }

    public void setMatchLevel(String matchLevel) {
        this.matchLevel = matchLevel;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getInternalId() {
        return internalId;
    }

    public void setInternalId(String internalId) {
        this.internalId = internalId;
    }
}
