from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Dict, List

class NotificationResponse(BaseModel):
    id: int
    user_id: str
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    extra: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- RabbitMQ event payloads ---

class ChatEvent(BaseModel):
    sender_id: str
    receiver_id: str
    message_preview: str
    timestamp: Optional[str] = None

class MeetEvent(BaseModel):
    organizer_id: str
    meeting_topic: str
    participants: str           # JSON string: ["user1@x.com","user2@x.com"]
    scheduled_at: str
    room_link: Optional[str] = None
