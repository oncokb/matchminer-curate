package org.mskcc.oncokb.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Matchminer Curate.
 * <p>
 * Properties are configured in the application.yml file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    public final Oncokb oncokb = new Oncokb();
    public final Matchengine matchengine = new Matchengine();
    public Oncokb getOncokb() {
        return oncokb;
    }
    public Matchengine getMatchengine() {
        return matchengine;
    }

    public static class Oncokb {
        private Api api = new Api();
        public Api getApi() {
            return api;
        }
        public void setApi(Api api) {
            this.api = api;
        }
        public static class Api {
            private String matchVariant;
            public String getMatchVariant() {
                return matchVariant;
            }
            public void setMatchVariant(String matchVariant) {
                this.matchVariant = matchVariant;
            }
        }

    }

    public static class Matchengine {
        private String absolutePath;
        private String gitUrl;
        private String branch;
        public String getAbsolutePath() {
            return absolutePath;
        }
        public void setAbsolutePath(String absolutePath) {
            this.absolutePath = absolutePath;
        }
        public String getGitUrl() {
            return gitUrl;
        }
        public void setGitUrl(String gitUrl) {
            this.gitUrl = gitUrl;
        }
        public String getBranch() {
            return branch;
        }
        public void setBranch(String branch) {
            this.branch = branch;
        }
    }
}
