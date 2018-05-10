package org.mskcc.oncokb.service.util;

import java.io.*;

public class FileUtil {

    private FileUtil() {
        throw new AssertionError();
    }

    public static String buildJsonTempFile(String json, File tempFile){
        String absolutePath = "";
        try {
            absolutePath = tempFile.getAbsolutePath();
            BufferedWriter bw = new BufferedWriter(new FileWriter(tempFile));
            bw.write(json);
            bw.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

        return absolutePath;
    }

}
