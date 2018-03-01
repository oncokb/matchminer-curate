package org.mskcc.oncokb.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Jing Su
 */

public class Genomic implements java.io.Serializable{

    private String sampleId;
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
    private Integer trueTranscriptExon;
    private String canonicalStand;
    private Double alleleFraction;
    private Integer tier;
    @JsonIgnore
    private List<String> oncokbVariant;

    public Genomic() {
    }
    // constructor for oncokb
    public Genomic(String sampleId, String trueHugoSymbol, String trueProteinChange,
                   String trueVariantClassification, String variantCategory) {
        this.sampleId = sampleId;
        this.trueHugoSymbol = trueHugoSymbol;
        this.trueProteinChange = trueProteinChange;
        this.trueVariantClassification = trueVariantClassification;
        this.variantCategory = variantCategory;
    }

    // constructor for matchminer
    public Genomic(String sampleId, String trueHugoSymbol, String trueProteinChange,
                   String trueVariantClassification, String variantCategory, String cnvCall, Boolean wildtype,
                   String chromosome, String position, String trueCdnaChange, String referenceAllele,
                   Integer trueTranscriptExon, String canonicalStand, Double alleleFraction, Integer tier) {
        this.sampleId = sampleId;
        this.trueHugoSymbol = trueHugoSymbol;
        this.trueProteinChange = trueProteinChange;
        this.trueVariantClassification = trueVariantClassification;
        this.variantCategory = variantCategory;
        this.cnvCall = cnvCall;
        this.wildtype = wildtype;
        this.chromosome = chromosome;
        this.position = position;
        this.trueCdnaChange = trueCdnaChange;
        this.referenceAllele = referenceAllele;
        this.trueTranscriptExon = trueTranscriptExon;
        this.canonicalStand = canonicalStand;
        this.alleleFraction = alleleFraction;
        this.tier = tier;
    }

    public String getSampleId() {
        return sampleId;
    }

    public void setSampleId(String sampleId) {
        this.sampleId = sampleId;
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

    public Integer getTrueTranscriptExon() {
        return trueTranscriptExon;
    }

    public void setTrueTranscriptExon(Integer trueTranscriptExon) {
        this.trueTranscriptExon = trueTranscriptExon;
    }

    public String getCanonicalStand() {
        return canonicalStand;
    }

    public void setCanonicalStand(String canonicalStand) {
        this.canonicalStand = canonicalStand;
    }

    public Double getAlleleFraction() {
        return alleleFraction;
    }

    public void setAlleleFraction(Double alleleFraction) {
        this.alleleFraction = alleleFraction;
    }

    public Integer getTier() {
        return tier;
    }

    public void setTier(Integer tier) {
        this.tier = tier;
    }

    @JsonIgnore
    public List<String> getOncokbVariant() {
        return oncokbVariant;
    }

    @JsonIgnore
    public void setOncokbVariant(List<String> oncokbVariant) {
        this.oncokbVariant = oncokbVariant;
    }

    @JsonIgnore
    public String getGenomicId(){

        List<String> content = new ArrayList<>();
        if (this.sampleId != null) {
            content.add(this.sampleId);
        } else {
            content.add("");
        }
        if (this.trueHugoSymbol != null) {
            content.add(this.trueHugoSymbol);
        } else {
            content.add("");
        }
        if (this.trueProteinChange != null) {
            content.add(this.trueProteinChange);
        } else {
            content.add("");
        }
        if (this.trueVariantClassification != null) {
            content.add(this.trueVariantClassification);
        } else {
            content.add("");
        }
        if (this.variantCategory != null) {
            content.add(this.variantCategory);
        } else {
            content.add("");
        }
        if (this.cnvCall != null) {
            content.add(this.cnvCall);
        } else {
            content.add("");
        }
        if (this.wildtype != null) {
            if (this.wildtype) {
                content.add("true");
            } else {
                content.add("false");
            }
        } else {
            content.add("");
        }
        if (this.chromosome != null) {
            content.add(this.chromosome);
        } else {
            content.add("");
        }
        if (this.position != null) {
            content.add(this.position);
        } else {
            content.add("");
        }
        if (this.trueCdnaChange != null) {
            content.add(this.trueCdnaChange);
        } else {
            content.add("");
        }
        if (this.referenceAllele != null) {
            content.add(this.referenceAllele);
        } else {
            content.add("");
        }
        if (this.trueTranscriptExon != null) {
            content.add(Integer.toString(this.trueTranscriptExon));
        } else {
            content.add("");
        }
        if (this.canonicalStand != null) {
            content.add(this.canonicalStand);
        } else {
            content.add("");
        }

        if (this.alleleFraction != null) {
            content.add(Double.toString(this.alleleFraction));
        } else {
            content.add("");
        }

        if (this.tier != null) {
            content.add(Integer.toString(this.tier));
        } else {
            content.add("");
        }

        return StringUtils.join(content.toArray(), "&");
    }
}


