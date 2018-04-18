package org.mskcc.oncokb.model;

import java.util.List;

public class MatchTrialResult {

    private String id;
    private List<Trial> trials;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Trial> getTrials() {
        return trials;
    }

    public void setTrials(List<Trial> trials) {
        this.trials = trials;
    }
}
