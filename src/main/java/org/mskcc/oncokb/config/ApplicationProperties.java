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
        private String path;

        public String getPath() {
            return path;
        }
        public void setPath(String path) {
            this.path = path;
        }
    }
}
