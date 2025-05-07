package backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@ConditionalOnProperty(
    prefix = "spring.security.oauth2.client.registration.google", 
    name = "client-id", 
    havingValue = "dummy-client-id", 
    matchIfMissing = false
)
public class OAuth2ClientConfig {
    // This class is intentionally empty
    // When the google.client-id is set to dummy-client-id, Spring will disable OAuth2 client auto-configuration
} 