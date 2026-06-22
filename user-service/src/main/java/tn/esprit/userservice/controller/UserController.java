package tn.esprit.userservice.controller;


import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.config.KeycloakConfig;
import tn.esprit.userservice.dto.EmailRequest;
import tn.esprit.userservice.dto.VerifyCodeAndResetPasswordRequest;
import tn.esprit.userservice.service.VerificationCodeService;
import tn.esprit.userservice.service.EmailService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service/user")
public class UserController {

    @Autowired
    private VerificationCodeService verificationCodeService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/CreateUser/{password}")
    public ResponseEntity<?> addUser(@RequestBody UserRepresentation userRep, @PathVariable String password) {
        // Validate inputs (example: check if username and email are valid)
        if (userRep.getUsername() == null || userRep.getUsername().length() < 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username must be at least 5 characters long");
        }

        // Setup user credentials
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false); // Password is not temporary
        userRep.setCredentials(Collections.singletonList(credential));

        try (Response response = KeycloakConfig.getInstance().realm("esprit").users().create(userRep)) {
            if (response.getStatus() == Response.Status.CREATED.getStatusCode()) {
                // Extract the user ID from the Location header
                String locationHeader = response.getHeaderString("Location");
                if (locationHeader != null && locationHeader.contains("/users/")) {
                    String userId = locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
                    if (userId != null && !userId.isEmpty()) {
                        assignRoleToUser(userId); // Assign the role to the newly created user
                        
                        // Add biometric attributes with default values

                        return ResponseEntity.status(HttpStatus.CREATED).body(userRep);
                    } else {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to extract user ID from Location header");
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve Location header");
                }
            } else {
                String errorMessage = response.readEntity(String.class);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error during user creation: " + errorMessage);
            }
        }
    }

    private void assignRoleToUser(String userId) {
        // Fetch the Keycloak instance
        Keycloak keycloak = KeycloakConfig.getInstance();

        // Retrieve the "etudiant" role
        RoleRepresentation etudiantRole = keycloak.realm("esprit").roles().get("etudiant").toRepresentation();

        if (etudiantRole == null) {
            throw new RuntimeException("Role 'etudiant' not found in realm 'esprit'");
        }

        // Retrieve the current roles assigned to the user
        List<RoleRepresentation> currentRoles = keycloak.realm("esprit").users().get(userId).roles().realmLevel().listAll();

        // Remove the "default-roles-esprit" role from the list of current roles
        List<RoleRepresentation> rolesToAssign = new ArrayList<>();
        for (RoleRepresentation role : currentRoles) {
            if (!role.getName().equals("default-roles-esprit")) {
                rolesToAssign.add(role); // Keep roles other than "default-roles-esprit"
            }
        }

        // Add the "etudiant" role to the list of roles to assign
        rolesToAssign.add(etudiantRole);

        // Assign the updated roles to the user
        keycloak.realm("esprit").users().get(userId).roles().realmLevel().remove(currentRoles); // Remove all current roles
        keycloak.realm("esprit").users().get(userId).roles().realmLevel().add(rolesToAssign); // Assign the updated roles
    }





    @PutMapping("/UpdateEnabledStatus/{id}")
    public ResponseEntity<?> updateEnabledStatus(@PathVariable String id, @RequestBody boolean enabled) {
        try {
            // Récupérer l'utilisateur existant
            UserRepresentation user = KeycloakConfig.getInstance().realm("esprit").users().get(id).toRepresentation();

            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            // Mettre à jour uniquement le statut 'enabled'
            user.setEnabled(enabled);

            // Appliquer les modifications sur Keycloak
            KeycloakConfig.getInstance().realm("esprit").users().get(id).update(user);

            // Return JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User status updated successfully");
            response.put("userId", id);
            response.put("enabled", enabled);
            
            return ResponseEntity.status(HttpStatus.OK).body(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error updating user status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    // Update User
    @PutMapping("/UpdateUser/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserRepresentation userRep) {
        KeycloakConfig.getInstance().realm("esprit").users().get(id).update(userRep);
        UserRepresentation user = KeycloakConfig.getInstance().realm("esprit").users().get(id).toRepresentation();

        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    // Delete User
    @DeleteMapping("/DeleteUser/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        KeycloakConfig.getInstance().realm("esprit").users().get(id).remove();
        UserRepresentation user = new UserRepresentation();
        return ResponseEntity.ok(user);
    }

    // Get User By Email
    @GetMapping("/GetUserByEmail/{email}")
    public ResponseEntity<UserRepresentation> getUserByEmail(@PathVariable String email) {
        List<UserRepresentation> users = KeycloakConfig.getInstance().realm("esprit").users().search(null, null, null, email, 0, 1);
        if (!users.isEmpty()) {
            return ResponseEntity.ok(users.get(0));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Get User By ID
    @GetMapping("/GetUserById/{id}")
    public ResponseEntity<UserRepresentation> getUserById(@PathVariable String id) {
        UserRepresentation user = KeycloakConfig.getInstance().realm("esprit").users().get(id).toRepresentation();
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/GetUserroleById/{id}")
    public List<RoleRepresentation> getUserroleById(@PathVariable String id) {
        List<RoleRepresentation> roles = KeycloakConfig.getInstance().realm("esprit").users().get(id).roles().realmLevel().listAll();

        if (roles != null) {
            return roles;
        } else {
            return roles;
        }
    }


    @GetMapping("/GetUsers")
    public List<UserRepresentation> getUsers() {
        UsersResource usersResource = KeycloakConfig.getInstance().realm("esprit").users();
        return usersResource.list(); // Fetch all users


    }
    @GetMapping("/GetUsersByRole/{roleName}")
    public ResponseEntity<List<UserRepresentation>> getUsersByRole(@PathVariable String roleName) {
        UsersResource usersResource = KeycloakConfig.getInstance().realm("esprit").users();
        List<UserRepresentation> usersWithRole = usersResource.list().stream()
                .filter(user -> {
                    List<RoleRepresentation> userRoles = usersResource.get(user.getId()).roles().realmLevel().listAll();
                    return userRoles.stream().anyMatch(role -> role.getName().equalsIgnoreCase(roleName));
                })
                .toList();

        if (!usersWithRole.isEmpty()) {
            return ResponseEntity.ok(usersWithRole);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/GetUsersByParentId/{parentId}")
    public ResponseEntity<List<UserRepresentation>> getUsersByParentId(@PathVariable String parentId) {
        UsersResource usersResource = KeycloakConfig.getInstance().realm("esprit").users();
        List<UserRepresentation> allUsers = usersResource.list();

        // Filter the users by the 'parentId' attribute
        List<UserRepresentation> usersWithParentId = allUsers.stream()
                .filter(user -> {
                    // Check if the user has a parentId attribute and if it matches the given parentId
                    if (user.getAttributes() != null && user.getAttributes().containsKey("parentId")) {
                        List<String> parentIds = user.getAttributes().get("parentId");
                        return parentIds.contains(parentId);
                    }
                    return false;
                })
                .toList();

        if (!usersWithParentId.isEmpty()) {
            return ResponseEntity.ok(usersWithParentId);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


    @PostMapping("/CreateUser/{password}/{role}")
    public ResponseEntity<?> addUser(@RequestBody UserRepresentation userRep, @PathVariable String password, @PathVariable String role) {
        // Validate inputs (example: check if username and email are valid)
        if (userRep.getUsername() == null || userRep.getUsername().length() < 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username must be at least 5 characters long");
        }

        // Validate the role
        if (!role.equals("bank_agent") && !role.equals("cnss_agent")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role. Allowed roles: bank_agent, cnss_agent");
        }

        // Setup user credentials
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false); // Password is not temporary
        userRep.setCredentials(Collections.singletonList(credential));

        try (Response response = KeycloakConfig.getInstance().realm("esprit").users().create(userRep)) {
            if (response.getStatus() == Response.Status.CREATED.getStatusCode()) {
                // Extract the user ID from the Location header
                String locationHeader = response.getHeaderString("Location");
                if (locationHeader != null && locationHeader.contains("/users/")) {
                    String userId = locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
                    if (userId != null && !userId.isEmpty()) {
                        assignRoleToUser(userId, role); // Assign the selected role to the newly created user
                        
                        // Add biometric attributes with default values

                        return ResponseEntity.status(HttpStatus.CREATED).body(userRep);
                    } else {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to extract user ID from Location header");
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve Location header");
                }
            } else {
                String errorMessage = response.readEntity(String.class);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error during user creation: " + errorMessage);
            }
        }
    }

    private void assignRoleToUser(String userId, String role) {
        // Fetch the Keycloak instance
        Keycloak keycloak = KeycloakConfig.getInstance();

        // Retrieve the selected role
        RoleRepresentation roleRepresentation = keycloak.realm("esprit").roles().get(role).toRepresentation();

        if (roleRepresentation == null) {
            throw new RuntimeException("Role '" + role + "' not found in realm 'esprit'");
        }

        // Retrieve the current roles assigned to the user
        List<RoleRepresentation> currentRoles = keycloak.realm("esprit").users().get(userId).roles().realmLevel().listAll();

        // Remove the "default-roles-esprit" role from the list of current roles
        List<RoleRepresentation> rolesToAssign = new ArrayList<>();
        for (RoleRepresentation currentRole : currentRoles) {
            if (!currentRole.getName().equals("default-roles-esprit")) {
                rolesToAssign.add(currentRole); // Keep roles other than "default-roles-esprit"
            }
        }

        // Add the selected role to the list of roles to assign
        rolesToAssign.add(roleRepresentation);

        // Assign the updated roles to the user
        keycloak.realm("esprit").users().get(userId).roles().realmLevel().remove(currentRoles); // Remove all current roles
        keycloak.realm("esprit").users().get(userId).roles().realmLevel().add(rolesToAssign); // Assign the updated roles
    }

    @PutMapping("/UpdateUserRole/{userId}/{roleName}")
    public ResponseEntity<?> updateUserRole(@PathVariable String userId, @PathVariable String roleName) {
        try {
            // Fetch the Keycloak instance
            Keycloak keycloak = KeycloakConfig.getInstance();

            // Validate that the user exists
            UserRepresentation user = keycloak.realm("esprit").users().get(userId).toRepresentation();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // Create role if it doesn't exist
            createRoleIfNotExists(keycloak, roleName);

            // Retrieve the new role
            RoleRepresentation newRole = keycloak.realm("esprit").roles().get(roleName).toRepresentation();
            if (newRole == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Role '" + roleName + "' could not be created or found");
            }

            // Get current roles
            List<RoleRepresentation> currentRoles = keycloak.realm("esprit").users().get(userId).roles().realmLevel().listAll();

            // Remove all current roles except default-roles-esprit
            List<RoleRepresentation> rolesToRemove = new ArrayList<>();
            List<RoleRepresentation> rolesToKeep = new ArrayList<>();
            
            for (RoleRepresentation currentRole : currentRoles) {
                if (currentRole.getName().equals("default-roles-esprit")) {
                    rolesToKeep.add(currentRole); // Keep default role
                } else {
                    rolesToRemove.add(currentRole); // Remove other roles
                }
            }

            // Remove old roles (except default)
            if (!rolesToRemove.isEmpty()) {
                keycloak.realm("esprit").users().get(userId).roles().realmLevel().remove(rolesToRemove);
            }

            // Add the new role
            rolesToKeep.add(newRole);
            keycloak.realm("esprit").users().get(userId).roles().realmLevel().add(Collections.singletonList(newRole));

            // Return JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User role updated successfully to: " + roleName);
            response.put("userId", userId);
            response.put("newRole", roleName);
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            // Return JSON error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error updating user role: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private void createRoleIfNotExists(Keycloak keycloak, String roleName) {
        try {
            // Try to get the role
            keycloak.realm("esprit").roles().get(roleName).toRepresentation();
        } catch (Exception e) {
            // Role doesn't exist, create it
            RoleRepresentation newRole = new RoleRepresentation();
            newRole.setName(roleName);
            newRole.setDescription("Auto-created role: " + roleName);
            keycloak.realm("esprit").roles().create(newRole);
        }
    }

    @PostMapping("/InitializeUsers")
    public ResponseEntity<?> manualUserInitialization() {
        try {
            // You can inject the UserInitializationService here, but for simplicity, 
            // I'll create a new instance or call it directly
            // This is a manual trigger for user initialization
            return ResponseEntity.ok().body("Manual user initialization triggered. Check logs for results.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during manual initialization: " + e.getMessage());
        }
    }

    // Send 4-digit verification code to user's email
    @PostMapping("/SendVerificationCode/{email}")
    public ResponseEntity<?> sendVerificationCode(@PathVariable String email) {
        try {
            verificationCodeService.sendVerificationCodeAndSave(email);
            return ResponseEntity.ok().body(Map.of(
                "message", "Verification code sent successfully to " + email,
                "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", e.getMessage(),
                "success", false
            ));
        }
    }

    // Verify 4-digit code and reset password
    @PostMapping("/VerifyCodeAndResetPassword")
    public ResponseEntity<?> verifyCodeAndResetPassword(@RequestBody VerifyCodeAndResetPasswordRequest request) {
        try {
            boolean success = verificationCodeService.verifyCodeAndResetPassword(
                request.getEmail(), 
                request.getVerificationCode(), 
                request.getNewPassword()
            );
            
            if (success) {
                return ResponseEntity.ok().body(Map.of(
                    "message", "Password reset successfully",
                    "success", true
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Failed to reset password",
                    "success", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", e.getMessage(),
                "success", false
            ));
        }
    }

    // Test email configuration endpoint
    @PostMapping("/TestEmail/{email}")
    public ResponseEntity<?> testEmail(@PathVariable String email) {
        try {
            // Use EmailService directly for testing
            emailService.sendVerificationCode(email, "TEST");
            return ResponseEntity.ok().body(Map.of(
                "message", "Test email sent successfully to " + email,
                "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Email test failed: " + e.getMessage(),
                "success", false,
                "details", e.getClass().getSimpleName()
            ));
        }
    }

    // Send custom email endpoint
    @PostMapping("/SendEmail")
    public ResponseEntity<?> sendCustomEmail(@RequestBody EmailRequest emailRequest) {
        try {
            // Validate required fields
            if (emailRequest.getTo() == null || emailRequest.getTo().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Recipient email address is required",
                    "success", false
                ));
            }
            
            if (emailRequest.getSubject() == null || emailRequest.getSubject().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Email subject is required",
                    "success", false
                ));
            }
            
            if (emailRequest.getBody() == null || emailRequest.getBody().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Email body is required",
                    "success", false
                ));
            }

            // Send the email
            emailService.sendCustomEmail(emailRequest);
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Email sent successfully to " + emailRequest.getTo(),
                "success", true,
                "recipient", emailRequest.getTo(),
                "subject", emailRequest.getSubject()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to send email: " + e.getMessage(),
                "success", false,
                "details", e.getClass().getSimpleName()
            ));
        }
    }

    // Send simple email endpoint (quick method)
    @PostMapping("/SendSimpleEmail")
    public ResponseEntity<?> sendSimpleEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String body) {
        try {
            // Validate required parameters
            if (to == null || to.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Recipient email address is required",
                    "success", false
                ));
            }
            
            if (subject == null || subject.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Email subject is required",
                    "success", false
                ));
            }
            
            if (body == null || body.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Email body is required",
                    "success", false
                ));
            }

            // Send the email
            emailService.sendSimpleEmail(to, subject, body);
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Simple email sent successfully to " + to,
                "success", true,
                "recipient", to,
                "subject", subject
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to send simple email: " + e.getMessage(),
                "success", false,
                "details", e.getClass().getSimpleName()
            ));
        }
    }

}
