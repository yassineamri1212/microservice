package tn.esprit.servicechat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageService messageService;

    @Autowired
    private ChatEventPublisher chatEventPublisher;

    @GetMapping("/{senderId}/{receiverId}")
    public List<Message> getChatHistory(@PathVariable String senderId, @PathVariable String receiverId) {
        return messageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/messages")
    public Message broadcastMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        messageRepository.save(message);
        chatEventPublisher.publishMessageSent(message);
        return message;
    }
}
