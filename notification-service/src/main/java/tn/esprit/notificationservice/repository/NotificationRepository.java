package tn.esprit.notificationservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.notificationservice.entity.Notification;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Get notifications for a specific user (paginated)
    Page<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);
    
    // Get all notifications for a user
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    
    // Get unread notifications for a user
    List<Notification> findByUserEmailAndIsReadFalseOrderByCreatedAtDesc(String userEmail);
    
    // Count unread notifications for a user
    long countByUserEmailAndIsReadFalse(String userEmail);
    
    // Get notifications by type for a user
    List<Notification> findByUserEmailAndNotificationTypeOrderByCreatedAtDesc(String userEmail, String notificationType);
    
    // Get recent notifications (last N hours)
    @Query("SELECT n FROM Notification n WHERE n.userEmail = :userEmail AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("userEmail") String userEmail, @Param("since") LocalDateTime since);
    
    // Mark notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :id")
    void markAsRead(@Param("id") Long id);
    
    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.userEmail = :userEmail AND n.isRead = false")
    void markAllAsReadByUser(@Param("userEmail") String userEmail);
    
    // Delete old notifications (older than specified date)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Delete notifications by user
    void deleteByUserEmail(String userEmail);
    
    // Get notification statistics
    @Query("SELECT COUNT(n), n.notificationType FROM Notification n WHERE n.userEmail = :userEmail GROUP BY n.notificationType")
    List<Object[]> getNotificationStatsByUser(@Param("userEmail") String userEmail);
}
