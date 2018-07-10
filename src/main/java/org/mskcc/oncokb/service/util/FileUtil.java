package org.mskcc.oncokb.service.util;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;

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

    /**
     * read a stream and return content
     * @param is
     * @return
     * @throws IOException
     */
    public static String readStream(InputStream is) throws IOException {
        List<String> lines = readTrimedLinesStream(is);
        return StringUtils.join(lines, "\n");
    }

    public static List<String> readTrimedLinesStream(InputStream is) throws IOException {
        return readLinesStream(is, true);
    }

    /**
     * read a stream and return lines
     * @param is
     * @return
     * @throws IOException
     */
    public static List<String> readLinesStream(InputStream is, boolean trim) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(is, "UTF-8"));

        List<String> lines = new ArrayList<String>();
        String line;
        while ((line = in.readLine()) != null) {
            if (trim) {
                line = line.replaceAll("^[\uFEFF-\uFFFF]+", ""); // trim and remove unicode
                line = line.replaceAll("\\[[a-z]\\]", ""); // remove comments from google docs
                line = line.trim();
            }
            if (!line.isEmpty())
                lines.add(line);
        }
        in.close();

        return lines;
    }
}
