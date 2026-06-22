package tn.esprit.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    
    private Long id;
    private String userEmail;
    private String title;
    private String message;
    private String senderEmail;
    private String senderName;
    private String notificationType;
    private Boolean isRead;
    private String actionUrl;
    private String icon;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    // Helper method to get time ago string
    public String getTimeAgo() {
        if (createdAt == null) return "";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(createdAt, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minutes ago";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " hours ago";
        
        long days = hours / 24;
        if (days < 7) return days + " days ago";
        
        return createdAt.toLocalDate().toString();
    }
}
