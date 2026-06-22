package tn.esprit.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Notification Service Application
 * 
 * Last updated: Added resource optimization and rebuild triggers
 * Version: v1.1-optimized
 * Features: Email notifications, SMS alerts, and message queuing
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableTransactionManagement
public class NotificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
