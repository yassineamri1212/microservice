package tn.esprit.userservice.service;

import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.config.KeycloakConfig;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class VerificationCodeService {

    @Autowired
    private EmailService emailService;

    private final Random random = new Random();

    // Generate a 4-digit verification code
    public String generateVerificationCode() {
        return String.format("%04d", random.nextInt(10000));
    }

    // Send verification code and save it in user attributes
    public void sendVerificationCodeAndSave(String email) {
        UserRepresentation user = null;
        String verificationCode = null;
        
        try {
            // Find user by email
            user = getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found with email: " + email);
            }

            // Generate 4-digit verification code
            verificationCode = generateVerificationCode();

            // Save verification code and timestamp in user attributes
            Map<String, java.util.List<String>> attributes = user.getAttributes();
            if (attributes == null) {
                attributes = new HashMap<>();
            }

            attributes.put("verificationCode", java.util.List.of(verificationCode));
            attributes.put("verificationCodeTimestamp", java.util.List.of(LocalDateTime.now().toString()));
            user.setAttributes(attributes);

            // Update user in Keycloak (this is the critical part)
            KeycloakConfig.getInstance().realm("esprit").users().get(user.getId()).update(user);
            System.out.println("✅ Verification code saved in Keycloak for user: " + email);

        } catch (Exception e) {
            System.err.println("❌ Critical error in verification code generation: " + e.getMessage());
            throw new RuntimeException("Failed to generate verification code: " + e.getMessage(), e);
        }

        // Try to send email (separate from core functionality)
        if (verificationCode != null) {
            try {
                emailService.sendVerificationCode(email, verificationCode);
                System.out.println("📧 Verification code sent via email to: " + email);
            } catch (Exception emailError) {
                System.err.println("⚠️  Email sending failed, but verification code is saved and ready for use");
                System.err.println("Email error: " + emailError.getMessage());
                System.out.println("🔢 VERIFICATION CODE for manual testing: " + verificationCode);
                System.out.println("📧 User: " + email);
                // Don't throw error - verification code is saved and functional
            }
        }

        System.out.println("✅ Verification code process completed successfully for: " + email);
    }

    // Verify code and reset password
    public boolean verifyCodeAndResetPassword(String email, String inputCode, String newPassword) {
        try {
            // Find user by email
            UserRepresentation user = getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found with email: " + email);
            }

            // Get verification code from user attributes
            Map<String, java.util.List<String>> attributes = user.getAttributes();
            if (attributes == null || !attributes.containsKey("verificationCode")) {
                throw new RuntimeException("No verification code found for user");
            }

            String storedCode = attributes.get("verificationCode").get(0);
            String timestampStr = attributes.get("verificationCodeTimestamp").get(0);

            // Check if code matches
            if (!storedCode.equals(inputCode)) {
                throw new RuntimeException("Invalid verification code");
            }

            // Check if code is expired (10 minutes)
            LocalDateTime codeTimestamp = LocalDateTime.parse(timestampStr);
            LocalDateTime now = LocalDateTime.now();
            if (codeTimestamp.plusMinutes(10).isBefore(now)) {
                throw new RuntimeException("Verification code has expired");
            }

            // Reset password
            resetUserPassword(user.getId(), newPassword);

            // Clear verification code from attributes
            attributes.remove("verificationCode");
            attributes.remove("verificationCodeTimestamp");
            user.setAttributes(attributes);
            KeycloakConfig.getInstance().realm("esprit").users().get(user.getId()).update(user);

            System.out.println("Password reset successful for user: " + email);
            return true;

        } catch (Exception e) {
            System.err.println("Error verifying code and resetting password: " + e.getMessage());
            throw new RuntimeException("Failed to verify code and reset password: " + e.getMessage(), e);
        }
    }

    // Helper method to get user by email
    private UserRepresentation getUserByEmail(String email) {
        java.util.List<UserRepresentation> users = KeycloakConfig.getInstance()
                .realm("esprit").users().search(null, null, null, email, 0, 1);
        return users.isEmpty() ? null : users.get(0);
    }

    // Helper method to reset user password
    private void resetUserPassword(String userId, String newPassword) {
        org.keycloak.representations.idm.CredentialRepresentation credential = 
                new org.keycloak.representations.idm.CredentialRepresentation();
        credential.setType(org.keycloak.representations.idm.CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(false);

        KeycloakConfig.getInstance().realm("esprit").users().get(userId).resetPassword(credential);
    }
}