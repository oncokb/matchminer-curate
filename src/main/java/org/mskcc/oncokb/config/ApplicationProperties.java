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

    public final Matchengine matchengine = new Matchengine();

    public Matchengine getMatchengine() {
        return matchengine;
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
