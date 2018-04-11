package org.mskcc.oncokb.config;

import org.apache.commons.io.FileUtils;
import org.mskcc.oncokb.service.util.PythonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PostConstruct;
import java.nio.file.Files;
import java.io.File;
import java.nio.file.Paths;

@Configuration
public class MatchEngineConfiguration {

    private final Logger log = LoggerFactory.getLogger(MatchEngineConfiguration.class);
    @Value("${application.matchengine.absolute-path}")
    private String matchengineAbsolutePath;
    @Value("${application.matchengine.git-url}")
    private String gitUrl;
    @Value("${application.matchengine.branch}")
    private String branch;

    @PostConstruct
    public void cloneMatchEngineFromGit() {
        try {
            if (Files.exists(Paths.get(this.matchengineAbsolutePath))) {
                FileUtils.cleanDirectory(new File(this.matchengineAbsolutePath));
            }
            ProcessBuilder pbClone = new ProcessBuilder("git", "clone", this.gitUrl, "-b", this.branch,
                this.matchengineAbsolutePath);
            Boolean isClone = PythonUtil.runPythonScript(pbClone);

            if(isClone){
                log.info("Clone matchminer-engine successfully!");
            } else {
                log.error("Clone matchminer-engine failed");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
