package tn.esprit.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.notificationservice.dto.NotificationRequest;
import tn.esprit.notificationservice.dto.NotificationResponse;
import tn.esprit.notificationservice.entity.Notification;
import tn.esprit.notificationservice.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send a new notification to a user
     */
    public NotificationResponse sendNotification(NotificationRequest request) {
        try {
            // Create and save notification
            Notification notification = Notification.builder()
                    .userEmail(request.getUserEmail())
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .senderEmail(request.getSenderEmail())
                    .senderName(request.getSenderName())
                    .notificationType(request.getNotificationType())
                    .actionUrl(request.getActionUrl())
                    .icon(request.getIcon())
                    .priority(request.getPriority())
                    .isRead(false)
                    .build();
            
            Notification savedNotification = notificationRepository.save(notification);
            log.info("Notification created with ID: {} for user: {}", savedNotification.getId(), request.getUserEmail());
            
            // Convert to response
            NotificationResponse response = convertToResponse(savedNotification);
            
            // Send real-time notification via WebSocket
            sendRealTimeNotification(response);
            
            return response;
            
        } catch (Exception e) {
            log.error("Error creating notification for user {}: {}", request.getUserEmail(), e.getMessage());
            throw new RuntimeException("Failed to send notification: " + e.getMessage());
        }
    }
    
    /**
     * Get all notifications for a user (paginated)
     */
    public Page<NotificationResponse> getUserNotifications(String userEmail, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail, pageable);
            
            return notifications.map(this::convertToResponse);
            
        } catch (Exception e) {
            log.error("Error fetching notifications for user {}: {}", userEmail, e.getMessage());
            throw new RuntimeException("Failed to fetch notifications: " + e.getMessage());
        }
    }
    
    /**
     * Get all notifications for a user (non-paginated)
     */
    public List<NotificationResponse> getAllUserNotifications(String userEmail) {
        try {
            List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
            return notifications.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Error fetching all notifications for user {}: {}", userEmail, e.getMessage());
            throw new RuntimeException("Failed to fetch notifications: " + e.getMessage());
        }
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<NotificationResponse> getUnreadNotifications(String userEmail) {
        try {
            List<Notification> notifications = notificationRepository.findByUserEmailAndIsReadFalseOrderByCreatedAtDesc(userEmail);
            return notifications.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Error fetching unread notifications for user {}: {}", userEmail, e.getMessage());
            throw new RuntimeException("Failed to fetch unread notifications: " + e.getMessage());
        }
    }
    
    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(String userEmail) {
        try {
            return notificationRepository.countByUserEmailAndIsReadFalse(userEmail);
        } catch (Exception e) {
            log.error("Error getting unread count for user {}: {}", userEmail, e.getMessage());
            return 0;
        }
    }
    
    /**
     * Mark a notification as read
     */
    public void markAsRead(Long notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();
                notification.setIsRead(true);
                notification.setReadAt(LocalDateTime.now());
                notificationRepository.save(notification);
                
                log.info("Notification {} marked as read", notificationId);
            } else {
                log.warn("Notification with ID {} not found", notificationId);
            }
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notificationId, e.getMessage());
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(String userEmail) {
        try {
            notificationRepository.markAllAsReadByUser(userEmail);
            log.info("All notifications marked as read for user: {}", userEmail);
        } catch (Exception e) {
            log.error("Error marking all notifications as read for user {}: {}", userEmail, e.getMessage());
        }
    }
    
    /**
     * Delete a notification
     */
    public void deleteNotification(Long notificationId) {
        try {
            if (notificationRepository.existsById(notificationId)) {
                notificationRepository.deleteById(notificationId);
                log.info("Notification {} deleted", notificationId);
            } else {
                log.warn("Notification with ID {} not found for deletion", notificationId);
            }
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", notificationId, e.getMessage());
        }
    }
    
    /**
     * Delete all notifications for a user
     */
    public void deleteAllUserNotifications(String userEmail) {
        try {
            notificationRepository.deleteByUserEmail(userEmail);
            log.info("All notifications deleted for user: {}", userEmail);
        } catch (Exception e) {
            log.error("Error deleting all notifications for user {}: {}", userEmail, e.getMessage());
        }
    }
    
    /**
     * Get recent notifications (last 24 hours)
     */
    public List<NotificationResponse> getRecentNotifications(String userEmail) {
        try {
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            List<Notification> notifications = notificationRepository.findRecentNotifications(userEmail, since);
            return notifications.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching recent notifications for user {}: {}", userEmail, e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Send real-time notification via WebSocket
     */
    private void sendRealTimeNotification(NotificationResponse notification) {
        try {
            String destination = "/topic/notifications/" + notification.getUserEmail();
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Real-time notification sent to: {}", notification.getUserEmail());
        } catch (Exception e) {
            log.error("Error sending real-time notification: {}", e.getMessage());
        }
    }
    
    /**
     * Convert entity to response DTO
     */
    private NotificationResponse convertToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userEmail(notification.getUserEmail())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .senderEmail(notification.getSenderEmail())
                .senderName(notification.getSenderName())
                .notificationType(notification.getNotificationType())
                .isRead(notification.getIsRead())
                .actionUrl(notification.getActionUrl())
                .icon(notification.getIcon())
                .priority(notification.getPriority())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
