package org.mskcc.oncokb.service.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class PythonUtil {

    public static Boolean runPythonScript(ProcessBuilder pb) throws IOException, InterruptedException{
        Process p = pb.start();
        String error = "";
        BufferedReader stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
        int exitCode = p.waitFor();
        // read any errors from the attempted command
        if (exitCode != 0) {
            System.out.println("Here is the standard error of the command (if any):\n");
            while ((error = stdError.readLine()) != null) {
                System.out.println(error);
            }
            stdError.close();
        }
        return exitCode == 0 ? true :false;
    }
}
