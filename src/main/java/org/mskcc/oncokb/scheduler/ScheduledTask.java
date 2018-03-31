package org.mskcc.oncokb.scheduler;

import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.mskcc.oncokb.service.util.PythonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.TimerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class ScheduledTask extends TimerTask {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTask.class);


    @Value("${spring.data.mongodb.uri}")
    private String uri;

    @Value("${application.matchengine.absolute-path}")
    private String matchengineAbsolutePath;

    @Autowired
    private MongoDatabase mongoDatabase;

    // Add your task here
    @Override
    @Scheduled(fixedRate = 86400000) // rerun MatchEngine every 24 hours
    public void run() {
        System.out.println("\n\n------Start MatchEngine match() every 24 hours------\n\n");
        Boolean isMatch = runMatch();
        if(isMatch) {
            System.out.println("\nRerun MatchEngine match() successfully!\n");
        } else {
            System.out.println("\nRerun MatchEngine match() failed!\n");
        }
    }

    public Boolean runMatch(){
        Boolean isMatch = false;
        String runnableScriptPath = PythonUtil.getMatchEnginePath(this.matchengineAbsolutePath);
        if (runnableScriptPath == null || runnableScriptPath.length() <= 0 ) {
            return isMatch;
        }
        try {
            List<Document> trialMatches = MongoUtil.getCollection(this.mongoDatabase, "trial_match");
            Boolean isDelete = MongoUtil.dropCollection(this.mongoDatabase, "trial_match");

            if (isDelete) {
                ProcessBuilder matchPb = new ProcessBuilder("python",
                    runnableScriptPath + "/matchengine.py", "match", "--mongo-uri", this.uri);
                isMatch = PythonUtil.runPythonScript(matchPb);
                if (!isMatch) {
                    MongoUtil.createCollection(this.mongoDatabase, "trial_match", trialMatches);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return isMatch;

    }
}
