package tn.esprit.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.notificationservice.dto.NotificationRequest;
import tn.esprit.notificationservice.dto.NotificationResponse;
import tn.esprit.notificationservice.service.NotificationService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendNotification(@Valid @RequestBody NotificationRequest request) {
        try {
            NotificationResponse response = notificationService.sendNotification(request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success !", true);
            result.put("message", "Notification sent successfully");
            result.put("notification", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error sending notification: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to send notification: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get all notifications for a user (paginated)
     */
    @GetMapping("/user/{userEmail}")
    public ResponseEntity<Map<String, Object>> getUserNotifications(
            @PathVariable String userEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Page<NotificationResponse> notifications = notificationService.getUserNotifications(userEmail, page, size);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("notifications", notifications.getContent());
            result.put("totalElements", notifications.getTotalElements());
            result.put("totalPages", notifications.getTotalPages());
            result.put("currentPage", page);
            result.put("size", size);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error fetching notifications for user {}: {}", userEmail, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch notifications: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get all notifications for a user (non-paginated)
     */
    @GetMapping("/user/{userEmail}/all")
    public ResponseEntity<Map<String, Object>> getAllUserNotifications(@PathVariable String userEmail) {
        try {
            List<NotificationResponse> notifications = notificationService.getAllUserNotifications(userEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("notifications", notifications);
            result.put("count", notifications.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error fetching all notifications for user {}: {}", userEmail, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch notifications: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get unread notifications for a user
     */
    @GetMapping("/user/{userEmail}/unread")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications(@PathVariable String userEmail) {
        try {
            List<NotificationResponse> notifications = notificationService.getUnreadNotifications(userEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("notifications", notifications);
            result.put("count", notifications.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error fetching unread notifications for user {}: {}", userEmail, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch unread notifications: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get unread notification count for a user
     */
    @GetMapping("/user/{userEmail}/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@PathVariable String userEmail) {
        try {
            long count = notificationService.getUnreadCount(userEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("unreadCount", count);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error fetching unread count for user {}: {}", userEmail, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch unread count: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get recent notifications for a user (last 24 hours)
     */
    @GetMapping("/user/{userEmail}/recent")
    public ResponseEntity<Map<String, Object>> getRecentNotifications(@PathVariable String userEmail) {
        try {
            List<NotificationResponse> notifications = notificationService.getRecentNotifications(userEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("notifications", notifications);
            result.put("count", notifications.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error fetching recent notifications for user {}: {}", userEmail, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch recent notifications: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Mark a notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Notification marked as read");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notificationId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to mark notification as read: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/user/{userEmail}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable String userEmail) {
        try {
            notificationService.markAllAsRead(userEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "All notifications marked as read");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error marking all notifications as read for user {}: {}", userEmail, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to mark all notifications as read: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Delete a notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Notification deleted successfully");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", notificationId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to delete notification: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Delete all notifications for a user
     */
    @DeleteMapping("/user/{userEmail}/all")
    public ResponseEntity<Map<String, Object>> deleteAllUserNotifications(@PathVariable String userEmail) {
        try {
            notificationService.deleteAllUserNotifications(userEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "All notifications deleted successfully");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error deleting all notifications for user {}: {}", userEmail, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to delete all notifications: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "notification-service");
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }
}
