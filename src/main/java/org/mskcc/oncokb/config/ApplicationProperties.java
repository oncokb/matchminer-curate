package org.mskcc.oncokb.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Matchminer Curate.
 * <p>
 * Properties are configured in the application.yml file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application.oncokb.api", ignoreUnknownFields = false)
public class ApplicationProperties {
    private String matchVariant;

    public String getMatchVariant() {
        return matchVariant;
    }

    public void setMatchVariant(String matchVariant) {
        this.matchVariant = matchVariant;
    }
}
