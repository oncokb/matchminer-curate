package org.mskcc.oncokb.service.util;

import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;

/**
 * Copy from oncokb
 * @author jgao
 */

public class FileUtil {

    private FileUtil() {
        throw new AssertionError();
    }

    public static List<String> getFilesInFolder(final String pathToFolder, final String suffix) {
        File folder = new File(pathToFolder);

        String[] files = folder.list(new FilenameFilter() {
            public boolean accept(File dir, String name) {
                return name.toUpperCase().endsWith(suffix.toUpperCase());
            }
        });

        List<String> ret = new ArrayList<String>();
        for (String file : files) {
            ret.add(pathToFolder + File.separator + file);
        }

        return ret;
    }

    /**
     * read local files and return content
     * @param pathToFile
     * @return
     * @throws IOException
     */
    public static String readLocal(String pathToFile) throws IOException {
        return readStream(new FileInputStream(pathToFile));
    }

    /**
     * return remote files and return content
     * @param urlToFile
     * @return
     * @throws IOException
     */
    public static String readRemote(String urlToFile) throws IOException {
        URL url = new URL(urlToFile);
        return readStream(url.openStream());
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
