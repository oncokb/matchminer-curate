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
        public String getAbsolutePath() {
            return absolutePath;
        }
        public void setAbsolutePath(String absolutePath) {
            this.absolutePath = absolutePath;
        }
    }
}
