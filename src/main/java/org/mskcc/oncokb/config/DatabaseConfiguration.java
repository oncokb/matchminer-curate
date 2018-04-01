package org.mskcc.oncokb.config;

import com.mongodb.*;
import com.mongodb.client.MongoDatabase;
import io.github.jhipster.config.JHipsterConstants;
import com.github.mongobee.Mongobee;
import io.github.jhipster.domain.util.JSR310DateConverters.DateToZonedDateTimeConverter;
import io.github.jhipster.domain.util.JSR310DateConverters.ZonedDateTimeToDateConverter;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.CustomConversions;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableMongoRepositories("org.mskcc.oncokb.repository")
@Profile("!" + JHipsterConstants.SPRING_PROFILE_CLOUD)
@Import(value = MongoAutoConfiguration.class)
@EnableMongoAuditing(auditorAwareRef = "springSecurityAuditorAware")
public class DatabaseConfiguration extends AbstractMongoConfiguration{

    private final Logger log = LoggerFactory.getLogger(DatabaseConfiguration.class);
    @Value("${spring.data.mongodb.uri}")
    private String uri;
    @Value("${spring.data.mongodb.database}")
    private String database;

    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Bean
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(DateToZonedDateTimeConverter.INSTANCE);
        converters.add(ZonedDateTimeToDateConverter.INSTANCE);
        return new CustomConversions(converters);
    }

    @Bean
    public Mongobee mongobee(MongoClient mongoClient, MongoTemplate mongoTemplate, MongoProperties mongoProperties) {
        log.debug("Configuring Mongobee");
        Mongobee mongobee = new Mongobee(mongoClient);
        mongobee.setDbName(mongoProperties.getDatabase());
        mongobee.setMongoTemplate(mongoTemplate);
        // package to scan for migrations
        mongobee.setChangeLogsScanPackage("org.mskcc.oncokb.config.dbmigrations");
        mongobee.setEnabled(true);
        return mongobee;
    }

    @Override
    public String getDatabaseName() {
        return this.database;
    }

    @Override
    @Bean
    public Mongo mongo() throws Exception {
        System.out.println("\n\nthis.uri:" + this.uri + "\n\n");
        return new MongoClient(new MongoClientURI(this.uri));
    }

    @Bean
    public MongoDatabase mongoDatabase() throws Exception {
        MongoClientURI uri  = new MongoClientURI(this.uri);
        MongoClient client = new MongoClient(uri);
        MongoDatabase db;
        if (this.uri.contains("mlab")) {
           db = client.getDatabase(uri.getDatabase());
        } else {
           db = client.getDatabase(getDatabaseName());
        }

        return db;
    }


}
