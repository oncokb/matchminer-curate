package org.mskcc.oncokb.config;

import org.apache.commons.io.FileUtils;
import org.mskcc.oncokb.service.util.PythonUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PostConstruct;
import java.nio.file.Files;
import java.io.File;
import java.nio.file.Paths;

@Configuration
public class MatchEngineConfiguration {

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
                System.out.println("Clone matchminer-engine successfully!");
            } else {
                System.out.println("Clone matchminer-engine failed");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
