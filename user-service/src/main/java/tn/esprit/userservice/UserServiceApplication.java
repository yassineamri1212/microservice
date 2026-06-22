package tn.esprit.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * User Service Application
 * 
 * Rebuild trigger: 2025-09-14 - Optimized for minikube resource usage
 * Last updated: Added resource optimization and rebuild triggers
 * Version: v1.1-optimized
 */
@SpringBootApplication
public class UserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

}
