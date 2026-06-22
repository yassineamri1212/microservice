package tn.esprit.notificationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String userEmail;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    @Column(name = "sender_email")
    private String senderEmail;
    
    @Column(name = "sender_name")
    private String senderName;
    
    @Column(name = "notification_type")
    private String notificationType; // MEETING, PAYMENT, SYSTEM, etc.
    
    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "action_url")
    private String actionUrl; // URL to navigate when notification is clicked
    
    @Column(name = "icon")
    private String icon; // FontAwesome icon class
    
    @Column(name = "priority")
    @Builder.Default
    private String priority = "normal"; // low, normal, high, urgent
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (isRead && readAt == null) {
            readAt = LocalDateTime.now();
        }
    }
}
