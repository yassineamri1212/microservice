package tn.esprit.servicemeet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "meetings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_name", unique = true, nullable = false)
    private String roomName;

    @Column(name = "topic", nullable = false)
    @NotBlank(message = "Topic is required")
    private String topic;

    @Column(name = "start_time", nullable = false)
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "room_link", nullable = false)
    private String roomLink;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "participants", length = 2000)
    private String participants; // JSON string of participant emails/usernames

    @Column(name = "is_public")
    private Boolean isPublic = true; // If false, only invited participants can join

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    private void generateRoomName() {
        if (this.roomName == null || this.roomName.isEmpty()) {
            this.roomName = "room-" + UUID.randomUUID().toString();
        }
        if (this.roomLink == null || this.roomLink.isEmpty()) {
            this.roomLink = "https://meet.jitsi.si/" + this.roomName;
        }
    }

    // Custom constructor for basic meeting creation
    public Meeting(String topic, LocalDateTime startTime, String createdBy) {
        this.topic = topic;
        this.startTime = startTime;
        this.createdBy = createdBy;
        this.isActive = true;
    }

    // Helper method to check if meeting is currently active
    public boolean isCurrentlyActive() {
        LocalDateTime now = LocalDateTime.now();
        if (endTime != null) {
            return now.isAfter(startTime) && now.isBefore(endTime);
        }
        // If no end time specified, assume 1 hour duration
        return now.isAfter(startTime) && now.isBefore(startTime.plusHours(1));
    }

    // Helper method to check if meeting is upcoming
    public boolean isUpcoming() {
        return LocalDateTime.now().isBefore(startTime);
    }

    // Helper method to check if meeting has ended
    public boolean hasEnded() {
        LocalDateTime now = LocalDateTime.now();
        if (endTime != null) {
            return now.isAfter(endTime);
        }
        // If no end time specified, assume 1 hour duration
        return now.isAfter(startTime.plusHours(1));
    }
}
