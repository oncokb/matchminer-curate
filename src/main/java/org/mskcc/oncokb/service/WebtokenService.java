package org.mskcc.oncokb.service;

import org.mskcc.oncokb.config.ApplicationProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for managing web tokens.
 *
 * @Author Hongxin hang
 */
@Service
public class WebtokenService {
    private List<String> tokens;
    private boolean webtokenEnabled;

    private final ApplicationProperties applicationProperties;

    @Autowired
    public WebtokenService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;

        this.webtokenEnabled = this.applicationProperties.getWebtoken().getEnabled() == null ? false : this.applicationProperties.getWebtoken().getEnabled().booleanValue();
        if (this.webtokenEnabled) {
            try {
                this.tokens = getTokens();
            } catch (IOException e) {
                e.printStackTrace();
                this.webtokenEnabled = false;
            }
        }
    }

    private List<String> getTokens() throws IOException {
        InputStream is = new FileInputStream(this.applicationProperties.getWebtoken().getWhitelist());
        BufferedReader in = new BufferedReader(new InputStreamReader(is, "UTF-8"));

        List<String> lines = new ArrayList<String>();
        String line;
        while ((line = in.readLine()) != null) {
            if (!line.isEmpty())
                lines.add(line);
        }
        in.close();

        return lines;
    }

    public boolean isWebtokenEnabled() {
        return webtokenEnabled;
    }

    public Boolean isValidToken(String token) {
        if (token == null)
            return false;
        return this.tokens.contains(token);
    }
}
