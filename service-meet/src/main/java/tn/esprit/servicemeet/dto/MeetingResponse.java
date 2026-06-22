package tn.esprit.servicemeet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingResponse {

    private Long id;
    private String roomName;
    private String topic;
    private String description;
    private String roomLink;
    private String createdBy;
    private Integer maxParticipants;
    private Boolean isActive;

    private String participants; // JSON string of participant emails/usernames
    private Boolean isPublic;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Helper fields for frontend
    private boolean isUpcoming;
    private boolean isCurrentlyActive;
    private boolean hasEnded;
}
