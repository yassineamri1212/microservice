package tn.esprit.servicemeet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.servicemeet.entity.Meeting;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    /**
     * Find meeting by room name
     */
    Optional<Meeting> findByRoomName(String roomName);

    /**
     * Find all active meetings
     */
    List<Meeting> findByIsActiveTrueOrderByStartTimeAsc();

    /**
     * Find meetings created by a specific user
     */
    List<Meeting> findByCreatedByAndIsActiveTrueOrderByStartTimeAsc(String createdBy);

    /**
     * Find upcoming meetings (start time after current time)
     */
    @Query("SELECT m FROM Meeting m WHERE m.startTime > :currentTime AND m.isActive = true ORDER BY m.startTime ASC")
    List<Meeting> findUpcomingMeetings(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Find meetings within a date range
     */
    @Query("SELECT m FROM Meeting m WHERE m.startTime BETWEEN :startDate AND :endDate AND m.isActive = true ORDER BY m.startTime ASC")
    List<Meeting> findMeetingsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find currently active meetings (meetings that should be happening now)
     */
    @Query("SELECT m FROM Meeting m WHERE m.startTime <= :currentTime AND " +
           "(m.endTime IS NULL AND m.startTime >= :oneHourAgo OR m.endTime > :currentTime) " +
           "AND m.isActive = true")
    List<Meeting> findCurrentlyActiveMeetings(@Param("currentTime") LocalDateTime currentTime, 
                                            @Param("oneHourAgo") LocalDateTime oneHourAgo);

    /**
     * Find meetings that need cleanup (ended more than 24 hours ago)
     */
    @Query("SELECT m FROM Meeting m WHERE " +
           "(m.endTime IS NOT NULL AND m.endTime < :cleanupTime) OR " +
           "(m.endTime IS NULL AND m.startTime < :cleanupTimeForNoEndTime)")
    List<Meeting> findMeetingsForCleanup(@Param("cleanupTime") LocalDateTime cleanupTime, 
                                       @Param("cleanupTimeForNoEndTime") LocalDateTime cleanupTimeForNoEndTime);

    /**
     * Check if room name exists
     */
    boolean existsByRoomName(String roomName);

    /**
     * Find meetings by topic containing text (case insensitive)
     */
    @Query("SELECT m FROM Meeting m WHERE LOWER(m.topic) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "AND m.isActive = true ORDER BY m.startTime ASC")
    List<Meeting> findByTopicContainingIgnoreCase(@Param("searchTerm") String searchTerm);

    /**
     * Soft delete a meeting by setting isActive to false
     */
    @Query("UPDATE Meeting m SET m.isActive = false, m.updatedAt = CURRENT_TIMESTAMP WHERE m.id = :meetingId")
    int softDeleteMeeting(@Param("meetingId") Long meetingId);
}
