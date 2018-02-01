package org.mskcc.oncokb.web.rest;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;

/**
 * REST controller for proxy service.
 *
 * This proxy code is copy-over from cBioPortal repo.
 * Currently, the CSRF is disabled in order to make POST method works.
 * Authentication is also disabled which should be enabled when the front-end enables the authentication.
 */
@RestController
@RequestMapping("/proxy")
public class ProxyController {

    @RequestMapping(value = "/**", method = { RequestMethod.GET, RequestMethod.POST })
    public String proxy(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {

        String queryString = request.getQueryString();

        // In the original code, we jse getPathInfo. But for some reason, we get null.
        // This needs to be updated.
        URI uri = new URI("http://" + request.getRequestURI().replaceFirst("/proxy/", "") + (queryString == null ? "" : "?" + queryString));

        HttpHeaders httpHeaders = new HttpHeaders();
        String contentType = request.getHeader("Content-Type");
        if (contentType != null) {
            httpHeaders.setContentType(MediaType.valueOf(contentType));
        }

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        System.out.println(uri);
        System.out.println(method);
        return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), String.class).getBody();
    }
}
