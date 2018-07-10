package org.mskcc.oncokb.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;

@Configuration
public class FirebaseConfiguration {
    private static final String fireConfigPath = "src/main/resources/config/firebase.json";

    @Bean
    public String firebaseToken() throws IOException {
        FileInputStream serviceAccount = new FileInputStream(fireConfigPath);
        // Authenticate a Google credential with the service account
        GoogleCredential googleCred = GoogleCredential.fromStream(serviceAccount);
        // Add the required scopes to the Google credential
        GoogleCredential scoped = googleCred.createScoped(
            Arrays.asList(
                "https://www.googleapis.com/auth/firebase.database",
                "https://www.googleapis.com/auth/userinfo.email"
            )
        );
        // Use the Google credential to generate an access token
        scoped.refreshToken();
        return scoped.getAccessToken();
    }

    @Bean
    public String firebaseProjectId() throws IOException {
        FileInputStream serviceAccount = new FileInputStream(fireConfigPath);
        // Authenticate a Google credential with the service account
        GoogleCredential googleCred = GoogleCredential.fromStream(serviceAccount);
        return googleCred.getServiceAccountProjectId();
    }
}
