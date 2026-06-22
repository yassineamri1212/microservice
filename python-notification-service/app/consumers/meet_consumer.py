import json
import logging
from .base import BaseConsumer
from app.database import SessionLocal
from app.schemas import MeetEvent
from app import service
from app.config import settings

logger = logging.getLogger(__name__)

class MeetConsumer(BaseConsumer):
    def __init__(self):
        super().__init__(settings.MEET_QUEUE)

    def callback(self, ch, method, properties, body):
        try:
            event = MeetEvent(**json.loads(body))
            db = SessionLocal()
            try:
                created = service.create_meeting_notifications(db, event)
                logger.info("Meeting notifications created for %d participants", len(created))
            finally:
                db.close()
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as exc:
            logger.error("Failed to process meet event: %s", exc)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
