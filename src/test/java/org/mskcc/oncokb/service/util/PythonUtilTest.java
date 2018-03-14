package org.mskcc.oncokb.service.util;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mskcc.oncokb.MatchminerCurateApp;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = MatchminerCurateApp.class)
public class PythonUtilTest {

    @Value("${application.matchengine.absolute-path}")
    private String matchengineAbsolutePath;

    ProcessBuilder pb;

    @Before
    public void setup(){
        String runnableScriptPath = PythonUtil.getMatchEnginePath(this.matchengineAbsolutePath);
        if (runnableScriptPath != null && runnableScriptPath.length() > 0 ) {
            // this command used to test MatchEngine by its own test cases
            pb = new ProcessBuilder("nosetests", "-w", runnableScriptPath);
        } else {
            System.out.println("Test MatchEngine failed!");
        }
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
