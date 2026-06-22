package tn.esprit.userservice.service;

import jakarta.annotation.PostConstruct;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.config.KeycloakConfig;

import java.util.*;

@Service
public class UserInitializationService {

    private static final Logger logger = LoggerFactory.getLogger(UserInitializationService.class);

    @PostConstruct
    public void initializeDefaultUsers() {
        logger.info("Starting user initialization...");
        
        try {
            // Initialize Bank Admin
            initializeBankAdmin();
            
            // Initialize CNSS Admin
            initializeCnssAdmin();
            
            logger.info("User initialization completed successfully");
        } catch (Exception e) {
            logger.error("Error during user initialization: {}", e.getMessage(), e);
        }
    }

    private void initializeBankAdmin() {
        String username = "bankadmin";
        String email = "bankadmin@stb.com.tn";
        
        logger.info("Checking if bank admin user exists...");
        
        if (!userExists(username, email)) {
            logger.info("Creating bank admin user...");
            
            UserRepresentation bankAdmin = new UserRepresentation();
            bankAdmin.setUsername(username);
            bankAdmin.setFirstName("stbadmin");
            bankAdmin.setLastName("stbadmin");
            bankAdmin.setEmail(email);
            bankAdmin.setEnabled(true);
            bankAdmin.setEmailVerified(true);
            
            // Set custom attributes
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("phoneNumber", Collections.singletonList("70 140 000"));
            attributes.put("address", Collections.singletonList("Rue Hédi Nouira - 1001 Tunis"));
            attributes.put("age", Collections.singletonList("18"));
            attributes.put("avatar", Collections.singletonList("avatar1.jpg"));
            bankAdmin.setAttributes(attributes);
            
            // Set password
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue("bankadmin");
            credential.setTemporary(false);
            bankAdmin.setCredentials(Collections.singletonList(credential));
            
            createUserWithRole(bankAdmin, "bank_officer");
        } else {
            logger.info("Bank admin user already exists, skipping creation");
        }
    }

    private void initializeCnssAdmin() {
        String username = "cnssadmin";
        String email = "cnssadmin@cnss.nat.tn";
        
        logger.info("Checking if CNSS admin user exists...");
        
        if (!userExists(username, email)) {
            logger.info("Creating CNSS admin user...");
            
            UserRepresentation cnssAdmin = new UserRepresentation();
            cnssAdmin.setUsername(username);
            cnssAdmin.setFirstName("cnssadmin");
            cnssAdmin.setLastName("cnssadmin");
            cnssAdmin.setEmail(email);
            cnssAdmin.setEnabled(true);
            cnssAdmin.setEmailVerified(true);
            
            // Set custom attributes
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("phoneNumber", Collections.singletonList("71 123 456"));
            attributes.put("address", Collections.singletonList("Avenue Mohamed V - 1002 Tunis"));
            attributes.put("age", Collections.singletonList("18"));
            attributes.put("avatar", Collections.singletonList("avatar1.jpg"));
            cnssAdmin.setAttributes(attributes);
            
            // Set password
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue("cnssadmin");
            credential.setTemporary(false);
            cnssAdmin.setCredentials(Collections.singletonList(credential));
            
            createUserWithRole(cnssAdmin, "cnss_officer");
        } else {
            logger.info("CNSS admin user already exists, skipping creation");
        }
    }

    private boolean userExists(String username, String email) {
        try {
            Keycloak keycloak = KeycloakConfig.getInstance();
            
            // Check by username
            List<UserRepresentation> usersByUsername = keycloak.realm("esprit").users().search(username, true);
            if (!usersByUsername.isEmpty()) {
                logger.info("User with username '{}' already exists", username);
                return true;
            }
            
            // Check by email
            List<UserRepresentation> usersByEmail = keycloak.realm("esprit").users().search(null, null, null, email, 0, 1);
            if (!usersByEmail.isEmpty()) {
                logger.info("User with email '{}' already exists", email);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            logger.warn("Error checking if user exists: {}", e.getMessage());
            return false;
        }
    }

    private void createUserWithRole(UserRepresentation userRep, String roleName) {
        try {
            Keycloak keycloak = KeycloakConfig.getInstance();
            
            // Create the user
            try (Response response = keycloak.realm("esprit").users().create(userRep)) {
                if (response.getStatus() == Response.Status.CREATED.getStatusCode()) {
                    // Extract the user ID from the Location header
                    String locationHeader = response.getHeaderString("Location");
                    if (locationHeader != null && locationHeader.contains("/users/")) {
                        String userId = locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
                        
                        logger.info("User '{}' created successfully with ID: {}", userRep.getUsername(), userId);
                        
                        // Assign role to the user
                        assignRoleToUser(userId, roleName);
                        
                        logger.info("Role '{}' assigned to user '{}'", roleName, userRep.getUsername());
                    } else {
                        logger.error("Failed to extract user ID from Location header for user '{}'", userRep.getUsername());
                    }
                } else {
                    String errorMessage = "Unknown error";
                    try {
                        errorMessage = response.readEntity(String.class);
                    } catch (Exception e) {
                        logger.warn("Could not read error response: {}", e.getMessage());
                    }
                    logger.error("Failed to create user '{}'. Status: {}, Error: {}", 
                               userRep.getUsername(), response.getStatus(), errorMessage);
                }
            }
        } catch (Exception e) {
            logger.error("Error creating user '{}': {}", userRep.getUsername(), e.getMessage(), e);
        }
    }

    private void assignRoleToUser(String userId, String roleName) {
        try {
            Keycloak keycloak = KeycloakConfig.getInstance();
            
            // Retrieve the role
            RoleRepresentation role = keycloak.realm("esprit").roles().get(roleName).toRepresentation();
            if (role == null) {
                logger.error("Role '{}' not found in realm 'esprit'", roleName);
                return;
            }
            
            // Get current roles
            List<RoleRepresentation> currentRoles = keycloak.realm("esprit").users().get(userId).roles().realmLevel().listAll();
            
            // Prepare roles to assign (excluding default-roles-esprit)
            List<RoleRepresentation> rolesToAssign = new ArrayList<>();
            for (RoleRepresentation currentRole : currentRoles) {
                if (!currentRole.getName().equals("default-roles-esprit")) {
                    rolesToAssign.add(currentRole);
                }
            }
            
            // Add the new role
            rolesToAssign.add(role);
            
            // Remove all current roles and assign the updated roles
            keycloak.realm("esprit").users().get(userId).roles().realmLevel().remove(currentRoles);
            keycloak.realm("esprit").users().get(userId).roles().realmLevel().add(rolesToAssign);
            
        } catch (Exception e) {
            logger.error("Error assigning role '{}' to user ID '{}': {}", roleName, userId, e.getMessage(), e);
        }
    }
}
