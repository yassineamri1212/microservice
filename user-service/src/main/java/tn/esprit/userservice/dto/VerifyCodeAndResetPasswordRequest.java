package tn.esprit.userservice.dto;

import lombok.Data;

@Data
public class VerifyCodeAndResetPasswordRequest {
    private String email;
    private String verificationCode;
    private String newPassword;
}