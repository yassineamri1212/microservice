import json
import logging
from .base import BaseConsumer
from app.database import SessionLocal
from app.schemas import ChatEvent
from app import service
from app.config import settings

logger = logging.getLogger(__name__)

class ChatConsumer(BaseConsumer):
    def __init__(self):
        super().__init__(settings.CHAT_QUEUE)

    def callback(self, ch, method, properties, body):
        try:
            event = ChatEvent(**json.loads(body))
            db = SessionLocal()
            try:
                service.create_chat_notification(db, event)
                logger.info("Chat notification created for user %s", event.receiver_id)
            finally:
                db.close()
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as exc:
            logger.error("Failed to process chat event: %s", exc)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
