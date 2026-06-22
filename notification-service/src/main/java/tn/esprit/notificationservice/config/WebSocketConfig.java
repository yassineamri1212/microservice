package tn.esprit.notificationservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker to carry the messages
        // back to the client on destinations prefixed with "/topic"
        config.enableSimpleBroker("/topic", "/queue");
        
        // Designate the "/app" prefix for messages that are bound to methods
        // annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        
        // Set the prefix for user-specific destinations
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register "/ws-notifications" endpoint, enabling SockJS fallback options
        // so that alternative transports may be used if WebSocket is not available
        registry.addEndpoint("/ws-notifications")
                .setAllowedOrigins(
                    "http://localhost:4200",
                    "https://localhost:4200", 
                    "https://stb-stages.com",
                    "http://stb-stages.com"
                )
                .withSockJS(); // Enable SockJS fallback
        
        // Register a raw WebSocket endpoint for clients that prefer it
        registry.addEndpoint("/ws-notifications-raw")
                .setAllowedOrigins(
                    "http://localhost:4200",
                    "https://localhost:4200", 
                    "https://stb-stages.com",
                    "http://stb-stages.com"
                );
    }
}
