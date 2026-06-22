package tn.esprit.userservice.config;

import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class KeycloakConfig {

    @Value("${keycloak.auth-server-url:http://keycloak.default.svc.cluster.local:8086}")
    private String keycloakServerUrl;

    static Keycloak keycloak = null;

    public KeycloakConfig() {
    }

    @Bean
    public Keycloak keycloakInstance(){
        if(keycloak == null){
            log.info("Initializing Keycloak with server URL: {}", keycloakServerUrl);
            
            keycloak = KeycloakBuilder.builder()
                    .serverUrl(keycloakServerUrl)
                    .realm("esprit")
                    .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                    .clientId("angular")
                    .clientSecret("81AzNdjzlT3xJUAdxxnelcqApCo0l7bp")
                    .build();
        }
        return keycloak;
    }

    public static Keycloak getInstance(){
        if(keycloak == null){
            // Fallback for static access - use cluster internal URL
            keycloak = KeycloakBuilder.builder()
                    .serverUrl("http://keycloak.default.svc.cluster.local:8086")
                    .realm("esprit")
                    .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                    .clientId("angular")
                    .clientSecret("81AzNdjzlT3xJUAdxxnelcqApCo0l7bp")
                    .build();
        }
        return keycloak;
    }

}
