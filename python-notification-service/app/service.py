import json
from sqlalchemy.orm import Session
from .models import Notification
from .schemas import ChatEvent, MeetEvent

def create_chat_notification(db: Session, event: ChatEvent):
    notif = Notification(
        user_id=event.receiver_id,
        type="CHAT_MESSAGE",
        title="New message",
        message=event.message_preview,
        extra={"sender_id": event.sender_id, "timestamp": event.timestamp},
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def create_meeting_notifications(db: Session, event: MeetEvent):
    try:
        participant_ids = json.loads(event.participants)
    except (json.JSONDecodeError, TypeError):
        participant_ids = [p.strip() for p in event.participants.split(",") if p.strip()]

    created = []
    for user_id in participant_ids:
        notif = Notification(
            user_id=user_id,
            type="MEETING_SCHEDULED",
            title=f"Meeting: {event.meeting_topic}",
            message=f"A meeting has been scheduled for {event.scheduled_at}",
            extra={
                "organizer_id": event.organizer_id,
                "meeting_topic": event.meeting_topic,
                "scheduled_at": event.scheduled_at,
                "room_link": event.room_link,
            },
        )
        db.add(notif)
        created.append(notif)
    db.commit()
    return created

def get_notifications(db: Session, user_id: str):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

def get_unread(db: Session, user_id: str):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .order_by(Notification.created_at.desc())
        .all()
    )

def mark_as_read(db: Session, notification_id: int):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif

def delete_notification(db: Session, notification_id: int):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        db.delete(notif)
        db.commit()
