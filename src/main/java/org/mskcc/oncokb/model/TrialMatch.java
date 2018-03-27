package org.mskcc.oncokb.model;

import java.util.Set;

public class TrialMatch implements java.io.Serializable{

    private String id;
    private Set<String> nctIds;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Set<String> getNctIds() {
        return nctIds;
    }

    public void setNctIds(Set<String> nctIds) {
        this.nctIds = nctIds;
    }
}
