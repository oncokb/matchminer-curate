package org.mskcc.oncokb.config;

import org.mskcc.oncokb.service.util.PythonUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PostConstruct;

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
            ProcessBuilder pbClone = new ProcessBuilder("git", "clone", this.gitUrl, "-b", this.branch);
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
