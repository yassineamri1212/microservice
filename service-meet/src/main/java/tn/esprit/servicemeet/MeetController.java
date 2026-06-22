package tn.esprit.servicemeet;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.servicemeet.dto.MeetingRequest;
import tn.esprit.servicemeet.dto.MeetingResponse;
import tn.esprit.servicemeet.service.MeetingService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meet")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MeetController {

    private final MeetingService meetingService;

    /**
     * Create a new meeting
     */
    @PostMapping("/create")
    public ResponseEntity<MeetingResponse> createMeeting(@Valid @RequestBody MeetingRequest request) {
        log.info("Creating meeting with topic: {}", request.getTopic());
        
        MeetingResponse response = meetingService.createMeeting(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all scheduled meetings
     */
    @GetMapping("/scheduled")
    public ResponseEntity<List<MeetingResponse>> getScheduledMeetings() {
        log.info("Retrieving all scheduled meetings");
        
        List<MeetingResponse> meetings = meetingService.getAllScheduledMeetings();
        return ResponseEntity.ok(meetings);
    }

    /**
     * Get upcoming meetings
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<MeetingResponse>> getUpcomingMeetings() {
        log.info("Retrieving upcoming meetings");
        
        List<MeetingResponse> meetings = meetingService.getUpcomingMeetings();
        return ResponseEntity.ok(meetings);
    }

    /**
     * Get currently active meetings
     */
    @GetMapping("/active")
    public ResponseEntity<List<MeetingResponse>> getCurrentlyActiveMeetings() {
        log.info("Retrieving currently active meetings");
        
        List<MeetingResponse> meetings = meetingService.getCurrentlyActiveMeetings();
        return ResponseEntity.ok(meetings);
    }

    /**
     * Get meetings within date range
     */
    @GetMapping("/range")
    public ResponseEntity<List<MeetingResponse>> getMeetingsBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.info("Retrieving meetings between {} and {}", startDate, endDate);
        
        List<MeetingResponse> meetings = meetingService.getMeetingsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(meetings);
    }

    /**
     * Get meetings created by a specific user
     */
    @GetMapping("/user/{createdBy}")
    public ResponseEntity<List<MeetingResponse>> getMeetingsByUser(@PathVariable String createdBy) {
        log.info("Retrieving meetings created by: {}", createdBy);
        
        List<MeetingResponse> meetings = meetingService.getMeetingsByCreatedBy(createdBy);
        return ResponseEntity.ok(meetings);
    }

    /**
     * Search meetings by topic
     */
    @GetMapping("/search")
    public ResponseEntity<List<MeetingResponse>> searchMeetingsByTopic(@RequestParam String topic) {
        log.info("Searching meetings by topic: {}", topic);
        
        List<MeetingResponse> meetings = meetingService.searchMeetingsByTopic(topic);
        return ResponseEntity.ok(meetings);
    }

    /**
     * Join a specific meeting by room name
     */
    @GetMapping("/join/{roomName}")
    public ResponseEntity<MeetingResponse> joinMeeting(@PathVariable String roomName) {
        log.info("Joining meeting with room name: {}", roomName);
        
        MeetingResponse meeting = meetingService.getMeetingByRoomName(roomName);
        return ResponseEntity.ok(meeting);
    }

    /**
     * Get meeting by ID
     */
    @GetMapping("/id/{meetingId}")
    public ResponseEntity<MeetingResponse> getMeetingById(@PathVariable Long meetingId) {
        log.info("Retrieving meeting with ID: {}", meetingId);
        
        MeetingResponse meeting = meetingService.getMeetingById(meetingId);
        return ResponseEntity.ok(meeting);
    }

    /**
     * Update a meeting
     */
    @PutMapping("/id/{meetingId}")
    public ResponseEntity<MeetingResponse> updateMeeting(
            @PathVariable Long meetingId,
            @Valid @RequestBody MeetingRequest request) {
        
        log.info("Updating meeting with ID: {}", meetingId);
        
        MeetingResponse response = meetingService.updateMeeting(meetingId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a meeting (soft delete)
     */
    @DeleteMapping("/id/{meetingId}")
    public ResponseEntity<Map<String, String>> deleteMeeting(@PathVariable Long meetingId) {
        log.info("Deleting meeting with ID: {}", meetingId);
        
        meetingService.deleteMeeting(meetingId);
        
        Map<String, String> response = Map.of(
            "message", "Meeting deleted successfully",
            "meetingId", meetingId.toString()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Check if room name exists
     */
    @GetMapping("/room/{roomName}/exists")
    public ResponseEntity<Map<String, Boolean>> checkRoomNameExists(@PathVariable String roomName) {
        log.info("Checking if room name exists: {}", roomName);
        
        boolean exists = meetingService.existsByRoomName(roomName);
        Map<String, Boolean> response = Map.of("exists", exists);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Check if user can access a meeting
     */
    @GetMapping("/access/{roomName}")
    public ResponseEntity<Map<String, Object>> checkMeetingAccess(
            @PathVariable String roomName,
            @RequestParam String userEmail) {
        
        log.info("Checking access for user {} to room {}", userEmail, roomName);
        
        boolean hasAccess = meetingService.checkUserAccess(roomName, userEmail);
        MeetingResponse meeting = meetingService.getMeetingByRoomName(roomName);
        
        Map<String, Object> response = Map.of(
            "hasAccess", hasAccess,
            "meeting", meeting,
            "userEmail", userEmail
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cleanup old meetings (admin endpoint)
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, String>> cleanupOldMeetings() {
        log.info("Starting cleanup of old meetings");
        
        meetingService.cleanupOldMeetings();
        
        Map<String, String> response = Map.of(
            "message", "Old meetings cleanup completed successfully"
        );
        
        return ResponseEntity.ok(response);
    }
}
