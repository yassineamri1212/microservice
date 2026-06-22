package com.example.bank.apigatewayservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway Service Application
 * 
 * Rebuild trigger: 2025-09-14 - Optimized for minikube resource usage
 * Last updated: Added resource optimization and rebuild triggers
 * Version: v1.1-optimized
 * Features: Request routing, load balancing, and service gateway
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayServiceApplication.class, args);
    }

}
