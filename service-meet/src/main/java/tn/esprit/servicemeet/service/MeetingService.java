package tn.esprit.servicemeet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.servicemeet.dto.MeetingRequest;
import tn.esprit.servicemeet.dto.MeetingResponse;
import tn.esprit.servicemeet.entity.Meeting;
import tn.esprit.servicemeet.exception.MeetingNotFoundException;
import tn.esprit.servicemeet.exception.RoomNameAlreadyExistsException;
import tn.esprit.servicemeet.repository.MeetingRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;

    /**
     * Create a new meeting
     */
    public MeetingResponse createMeeting(MeetingRequest request) {
        log.info("Creating meeting with topic: {}", request.getTopic());
        
        try {
            Meeting meeting = new Meeting();
            meeting.setTopic(request.getTopic());
            meeting.setStartTime(request.getStartTime());
            meeting.setEndTime(request.getEndTime());
            meeting.setDescription(request.getDescription());
            meeting.setMaxParticipants(request.getMaxParticipants());
            meeting.setCreatedBy(request.getCreatedBy());
            meeting.setParticipants(request.getParticipants());
            meeting.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
            
            // Generate unique room name
            String roomName;
            do {
                roomName = "room-" + UUID.randomUUID().toString();
            } while (meetingRepository.existsByRoomName(roomName));
            
            meeting.setRoomName(roomName);
            meeting.setRoomLink("https://meet.jitsi.si/" + roomName);
            meeting.setIsActive(true);

            Meeting savedMeeting = meetingRepository.save(meeting);
            log.info("Meeting created successfully with ID: {} and room: {}", 
                    savedMeeting.getId(), savedMeeting.getRoomName());
            
            return convertToResponse(savedMeeting);
            
        } catch (Exception e) {
            log.error("Error creating meeting: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create meeting: " + e.getMessage());
        }
    }

    /**
     * Get all scheduled meetings
     */
    @Transactional(readOnly = true)
    public List<MeetingResponse> getAllScheduledMeetings() {
        log.info("Retrieving all scheduled meetings");
        
        List<Meeting> meetings = meetingRepository.findByIsActiveTrueOrderByStartTimeAsc();
        return meetings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get meeting by room name
     */
    @Transactional(readOnly = true)
    public MeetingResponse getMeetingByRoomName(String roomName) {
        log.info("Retrieving meeting with room name: {}", roomName);
        
        Meeting meeting = meetingRepository.findByRoomName(roomName)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with room name: " + roomName));
        
        return convertToResponse(meeting);
    }

    /**
     * Get meeting by ID
     */
    @Transactional(readOnly = true)
    public MeetingResponse getMeetingById(Long meetingId) {
        log.info("Retrieving meeting with ID: {}", meetingId);
        
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with ID: " + meetingId));
        
        return convertToResponse(meeting);
    }

    /**
     * Get upcoming meetings
     */
    @Transactional(readOnly = true)
    public List<MeetingResponse> getUpcomingMeetings() {
        log.info("Retrieving upcoming meetings");
        
        List<Meeting> meetings = meetingRepository.findUpcomingMeetings(LocalDateTime.now());
        return meetings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get meetings within date range
     */
    @Transactional(readOnly = true)
    public List<MeetingResponse> getMeetingsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Retrieving meetings between {} and {}", startDate, endDate);
        
        List<Meeting> meetings = meetingRepository.findMeetingsBetweenDates(startDate, endDate);
        return meetings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get currently active meetings
     */
    @Transactional(readOnly = true)
    public List<MeetingResponse> getCurrentlyActiveMeetings() {
        log.info("Retrieving currently active meetings");
        
        LocalDateTime currentTime = LocalDateTime.now();
        LocalDateTime oneHourAgo = currentTime.minusHours(1);
        
        List<Meeting> meetings = meetingRepository.findCurrentlyActiveMeetings(currentTime, oneHourAgo);
        return meetings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get meetings created by a specific user
     */
    @Transactional(readOnly = true)
    public List<MeetingResponse> getMeetingsByCreatedBy(String createdBy) {
        log.info("Retrieving meetings created by: {}", createdBy);
        
        List<Meeting> meetings = meetingRepository.findByCreatedByAndIsActiveTrueOrderByStartTimeAsc(createdBy);
        return meetings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update a meeting
     */
    public MeetingResponse updateMeeting(Long meetingId, MeetingRequest request) {
        log.info("Updating meeting with ID: {}", meetingId);
        
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with ID: " + meetingId));

        if (!meeting.getIsActive()) {
            throw new IllegalStateException("Cannot update inactive meeting");
        }

        // Update fields
        meeting.setTopic(request.getTopic());
        meeting.setStartTime(request.getStartTime());
        meeting.setEndTime(request.getEndTime());
        meeting.setDescription(request.getDescription());
        meeting.setMaxParticipants(request.getMaxParticipants());

        Meeting updatedMeeting = meetingRepository.save(meeting);
        log.info("Meeting updated successfully with ID: {}", updatedMeeting.getId());
        
        return convertToResponse(updatedMeeting);
    }

    /**
     * Delete a meeting (soft delete)
     */
    public void deleteMeeting(Long meetingId) {
        log.info("Deleting meeting with ID: {}", meetingId);
        
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with ID: " + meetingId));

        meeting.setIsActive(false);
        meetingRepository.save(meeting);
        
        log.info("Meeting soft deleted successfully with ID: {}", meetingId);
    }

    /**
     * Search meetings by topic
     */
    @Transactional(readOnly = true)
    public List<MeetingResponse> searchMeetingsByTopic(String searchTerm) {
        log.info("Searching meetings by topic: {}", searchTerm);
        
        List<Meeting> meetings = meetingRepository.findByTopicContainingIgnoreCase(searchTerm);
        return meetings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Count meetings for a class
     */
    @Transactional(readOnly = true)
    public boolean existsByRoomName(String roomName) {
        return meetingRepository.existsByRoomName(roomName);
    }

    /**
     * Clean up old meetings (for scheduled cleanup job)
     */
    public void cleanupOldMeetings() {
        log.info("Starting cleanup of old meetings");
        
        LocalDateTime cleanupTime = LocalDateTime.now().minusDays(1);
        LocalDateTime cleanupTimeForNoEndTime = LocalDateTime.now().minusDays(1);
        
        List<Meeting> oldMeetings = meetingRepository.findMeetingsForCleanup(cleanupTime, cleanupTimeForNoEndTime);
        
        for (Meeting meeting : oldMeetings) {
            meeting.setIsActive(false);
        }
        
        meetingRepository.saveAll(oldMeetings);
        log.info("Cleaned up {} old meetings", oldMeetings.size());
    }

    /**
     * Convert Meeting entity to MeetingResponse DTO
     */
    private MeetingResponse convertToResponse(Meeting meeting) {
        MeetingResponse response = new MeetingResponse();
        response.setId(meeting.getId());
        response.setRoomName(meeting.getRoomName());
        response.setTopic(meeting.getTopic());
        response.setDescription(meeting.getDescription());
        response.setRoomLink(meeting.getRoomLink());
        response.setCreatedBy(meeting.getCreatedBy());
        response.setMaxParticipants(meeting.getMaxParticipants());
        response.setIsActive(meeting.getIsActive());
        response.setParticipants(meeting.getParticipants());
        response.setIsPublic(meeting.getIsPublic());
        response.setStartTime(meeting.getStartTime());
        response.setEndTime(meeting.getEndTime());
        response.setCreatedAt(meeting.getCreatedAt());
        response.setUpdatedAt(meeting.getUpdatedAt());
        
        // Set helper fields
        response.setUpcoming(meeting.isUpcoming());
        response.setCurrentlyActive(meeting.isCurrentlyActive());
        response.setHasEnded(meeting.hasEnded());
        
        return response;
    }

    /**
     * Check if a user has access to a meeting
     */
    public boolean checkUserAccess(String roomName, String userEmail) {
        try {
            Meeting meeting = meetingRepository.findByRoomName(roomName)
                    .orElseThrow(() -> new RuntimeException("Meeting not found: " + roomName));

            // If meeting is public, everyone can access
            if (meeting.getIsPublic() != null && meeting.getIsPublic()) {
                return true;
            }

            // If meeting is private, check if user is in participants list
            if (meeting.getParticipants() != null && !meeting.getParticipants().isEmpty()) {
                // Simple check if email is in the participants string
                return meeting.getParticipants().toLowerCase().contains(userEmail.toLowerCase());
            }

            // If no participants specified but meeting is private, only creator can access
            return meeting.getCreatedBy().equalsIgnoreCase(userEmail);

        } catch (Exception e) {
            log.error("Error checking user access: {}", e.getMessage());
            return false;
        }
    }
}
