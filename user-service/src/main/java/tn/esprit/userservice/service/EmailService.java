package tn.esprit.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.dto.EmailRequest;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationCode(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset Verification Code");
            message.setText(
                "Hello,\n\n" +
                "You have requested to reset your password. Please use the following 4-digit verification code:\n\n" +
                "Verification Code: " + verificationCode + "\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "STB Stages Team"
            );

            mailSender.send(message);
            System.out.println("Verification code email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send verification code email: " + e.getMessage());
            throw new RuntimeException("Failed to send verification code email", e);
        }
    }

    /**
     * Send a custom email with subject and body
     */
    public void sendCustomEmail(EmailRequest emailRequest) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(emailRequest.getTo());
            message.setSubject(emailRequest.getSubject());
            message.setText(emailRequest.getBody());
            
            // Add CC if provided
            if (emailRequest.getCc() != null && !emailRequest.getCc().trim().isEmpty()) {
                message.setCc(emailRequest.getCc());
            }
            
            // Add BCC if provided  
            if (emailRequest.getBcc() != null && !emailRequest.getBcc().trim().isEmpty()) {
                message.setBcc(emailRequest.getBcc());
            }

            mailSender.send(message);
            System.out.println("Custom email sent successfully to: " + emailRequest.getTo());
        } catch (Exception e) {
            System.err.println("Failed to send custom email: " + e.getMessage());
            throw new RuntimeException("Failed to send custom email", e);
        }
    }

    /**
     * Send a simple email with basic parameters
     */
    public void sendSimpleEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("Simple email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send simple email: " + e.getMessage());
            throw new RuntimeException("Failed to send simple email", e);
        }
    }
}