package tn.esprit.servicemeet.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import tn.esprit.servicemeet.entity.Meeting;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MeetEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishMeetingCreated(Meeting meeting) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("organizer_id", meeting.getCreatedBy());
            event.put("meeting_topic", meeting.getTopic());
            event.put("participants", meeting.getParticipants() != null ? meeting.getParticipants() : "[]");
            event.put("scheduled_at", meeting.getStartTime() != null ? meeting.getStartTime().toString() : null);
            event.put("room_link", meeting.getRoomLink());

            rabbitTemplate.convertAndSend(RabbitConfig.MEET_QUEUE, event);
            log.info("Meet event published for meeting '{}'", meeting.getTopic());
        } catch (Exception e) {
            log.error("Failed to publish meet event: {}", e.getMessage());
        }
    }
}
