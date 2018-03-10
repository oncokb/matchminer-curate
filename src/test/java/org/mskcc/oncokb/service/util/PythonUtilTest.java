package org.mskcc.oncokb.service.util;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mskcc.oncokb.MatchminerCurateApp;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = MatchminerCurateApp.class)
public class PythonUtilTest {
    ProcessBuilder pb;

    @Before
    public void setup(){
        // this command used to test MatchEngine by its own test cases
        pb = new ProcessBuilder("nosetests", "-w", System.getenv("CATALINA_HOME") +
                "/webapps/matchminer-curate/WEB-INF/classes/matchminer-engine");
    }

    @Test
    public void testRunPythonScript() {
        try {
            Boolean isPassed = PythonUtil.runPythonScript(pb);
            assertThat(isPassed).isEqualTo(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
