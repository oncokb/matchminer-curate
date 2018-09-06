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
    public final Webtoken webtoken = new Webtoken();

    public Matchengine getMatchengine() {
        return matchengine;
    }

    public Webtoken getWebtoken() {
        return webtoken;
    }

    private static class Matchengine {
        private String path;

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }
    }

    public static class Webtoken {
        private Boolean enabled;
        private String whitelist;

        public Boolean getEnabled() {
            return enabled;
        }

        public void setEnabled(Boolean enabled) {
            this.enabled = enabled;
        }

        public String getWhitelist() {
            return whitelist;
        }

        public void setWhitelist(String whitelist) {
            this.whitelist = whitelist;
        }
    }
}
