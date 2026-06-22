package tn.esprit.servicemeet.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.servicemeet.service.MeetingService;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final MeetingService meetingService;

    /**
     * Cleanup old meetings every day at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldMeetings() {
        log.info("Starting scheduled cleanup of old meetings");
        
        try {
            meetingService.cleanupOldMeetings();
            log.info("Scheduled cleanup of old meetings completed successfully");
        } catch (Exception e) {
            log.error("Error during scheduled cleanup of old meetings: {}", e.getMessage(), e);
        }
    }
}
