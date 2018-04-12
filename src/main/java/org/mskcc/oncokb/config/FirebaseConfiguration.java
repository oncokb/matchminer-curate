package org.mskcc.oncokb.config;

import org.mskcc.oncokb.service.util.PythonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PostConstruct;

@Configuration
public class FirebaseConfiguration {
    private final Logger log = LoggerFactory.getLogger(FirebaseConfiguration.class);
    @Value("${application.firebase.file-id}")
    private String fileId;

    @PostConstruct
    public void configFirebase(){
        // Download environment file when in heroku model
        if(this.fileId != null && this.fileId.length() > 0) {
            downloadFileFromGoogleDrive(this.fileId);
        }
    }

    public void downloadFileFromGoogleDrive(String fileId) {
        try {
            String googleDriveDownloadLink = "\"https://drive.google.com/uc?export=download&id=" + fileId + "\"";
            ProcessBuilder pbDownload = new ProcessBuilder("wget", googleDriveDownloadLink, "-O",
                "./src/main/webapp/app/environment.ts");
            Boolean isDownload = PythonUtil.runPythonScript(pbDownload);

            if(isDownload){
                log.info("Download environment.ts successfully!");
            } else {
                log.error("Download environment.ts failed");
            }


        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
