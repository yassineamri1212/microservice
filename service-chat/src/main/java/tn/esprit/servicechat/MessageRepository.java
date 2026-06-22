package tn.esprit.servicechat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface MessageRepository  extends JpaRepository<Message, Long> {
    List<Message> findBySenderIdAndReceiverId(String senderId, String receiverId);
    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :user1Id AND m.receiverId = :user2Id) OR " +
            "(m.senderId = :user2Id AND m.receiverId = :user1Id) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findBySenderAndReceiver(@Param("user1Id") String user1Id, @Param("user2Id") String user2Id);
}
