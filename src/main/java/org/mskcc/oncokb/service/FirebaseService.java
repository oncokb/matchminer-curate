package org.mskcc.oncokb.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;

/**
 * Service class for managing Firebase credentials
 */
@Service
public class FirebaseService {
    private final String FIRE_CONFIG_PATH = "src/main/resources/config/firebase.json";

    private GoogleCredential scopedGoogleCredential;
    private GoogleCredential googleCredential;

    @Autowired
    public FirebaseService() throws IOException {
        FileInputStream serviceAccount = new FileInputStream(FIRE_CONFIG_PATH);
        // Authenticate a Google credential with the service account
        this.googleCredential = GoogleCredential.fromStream(serviceAccount);

        // Add the required scopes to the Google credential
        this.scopedGoogleCredential = this.googleCredential.createScoped(
            Arrays.asList(
                "https://www.googleapis.com/auth/firebase.database",
                "https://www.googleapis.com/auth/userinfo.email"
            )
        );
    }

    public String getFirebaseToken() throws IOException {
        if (this.scopedGoogleCredential.getExpiresInSeconds() == null || this.scopedGoogleCredential.getExpiresInSeconds() < 600) {
            this.scopedGoogleCredential.refreshToken();
        }

        return this.scopedGoogleCredential.getAccessToken();
    }

    public String getFirebaseProjectId() throws IOException {
        return this.googleCredential.getServiceAccountProjectId();
    }
}
