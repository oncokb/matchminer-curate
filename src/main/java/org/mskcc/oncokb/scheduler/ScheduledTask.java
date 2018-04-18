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
    @Scheduled(cron = "0 0 1 * * ?") // rerun MatchEngine at 1am everyday
    public void run() {
        log.info("Start MatchEngine match() at 1am everyday!");
        Boolean isMatch = runMatch();
        if(isMatch) {
            log.info("Rerun MatchEngine match() successfully!");
        } else {
            log.error("Rerun MatchEngine match() failed!");
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
                    runnableScriptPath + "/matchengine.py", "match", "--mongo-uri", MongoUtil.getPureMongoUri(this.uri));
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
