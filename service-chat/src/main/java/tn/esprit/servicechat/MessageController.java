package tn.esprit.servicechat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*") // Allow requests from any origin
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageService messageService;

    // Get chat history between two users
    @GetMapping("/{senderId}/{receiverId}")
    public List<Message> getChatHistory(@PathVariable String senderId, @PathVariable String receiverId) {
        return messageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }

    // WebSocket: Receive and broadcast a message
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/messages")
    public Message broadcastMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        messageRepository.save(message); // Persist the message
        return message;
    }
}
