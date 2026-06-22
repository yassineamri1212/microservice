package tn.esprit.servicechat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishMessageSent(Message message) {
        try {
            String preview = message.getContent();
            if (preview != null && preview.length() > 100) {
                preview = preview.substring(0, 100) + "...";
            }

            Map<String, Object> event = new HashMap<>();
            event.put("sender_id", message.getSenderId());
            event.put("receiver_id", message.getReceiverId());
            event.put("message_preview", preview);
            event.put("timestamp", message.getTimestamp() != null ? message.getTimestamp().toString() : null);

            rabbitTemplate.convertAndSend(RabbitConfig.CHAT_QUEUE, event);
            log.info("Chat event published for receiver {}", message.getReceiverId());
        } catch (Exception e) {
            log.error("Failed to publish chat event: {}", e.getMessage());
        }
    }
}
