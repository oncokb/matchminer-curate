package org.mskcc.oncokb.scheduler;

import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.mskcc.oncokb.service.util.MongoUtil;
import org.mskcc.oncokb.service.util.PythonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class ScheduledTask extends TimerTask {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTask.class);

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

    @Value("${spring.data.mongodb.uri}")
    private String uri;

    @Autowired
    private MongoDatabase mongoDatabase;

    // Add your task here
    @Override
    @Scheduled(fixedRate = 86400000) // rerun MatchEngine every 24 hours
    public void run() {
        System.out.println("\n\n------Start MatchEngine Daemon------\n\n");
        log.info("The time is now {}", dateFormat.format(new Date()));
        Boolean isMatch = runMatch();
        if(isMatch) {
            System.out.println("Rerun MatchEngine match() successfully!");
        } else {
            System.out.println("Rerun MatchEngine match() failed!");
        }
    }

    public Boolean runMatch(){
        Boolean isMatch = false;
        try {
            List<Document> trialMatches = MongoUtil.getCollection(this.mongoDatabase, "trial_match");
            Boolean isDelete = MongoUtil.dropCollection(this.mongoDatabase, "trial_match");

            if (isDelete) {
                ProcessBuilder matchPb = new ProcessBuilder("python", System.getenv("CATALINA_HOME") +
                    "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine/matchengine.py", "match",
                    "--mongo-uri", this.uri);
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
