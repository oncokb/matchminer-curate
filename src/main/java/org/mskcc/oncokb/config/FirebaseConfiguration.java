package org.mskcc.oncokb.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.FileInputStream;

@Configuration
public class FirebaseConfiguration {
    private static final String FIREDB = "https://herokucurationdevelopment.firebaseio.com";

    @Bean
    public FirebaseDatabase firebaseDatabase() throws Exception {
        FileInputStream serviceAccount = new FileInputStream("src/main/resources/config/firebase.json");

        FirebaseOptions options = new FirebaseOptions.Builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .setDatabaseUrl(FIREDB)
            .build();
        FirebaseApp defaultApp = FirebaseApp.initializeApp(options);

        return FirebaseDatabase.getInstance(defaultApp);
    }

}
