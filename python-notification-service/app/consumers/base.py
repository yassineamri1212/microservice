import pika
import logging
import threading
import time
from app.config import settings

logger = logging.getLogger(__name__)

class BaseConsumer:
    def __init__(self, queue_name: str):
        self.queue_name = queue_name

    def _connect(self):
        credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASSWORD)
        params = pika.ConnectionParameters(
            host=settings.RABBITMQ_HOST,
            port=settings.RABBITMQ_PORT,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300,
        )
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue=self.queue_name, durable=True)
        channel.basic_qos(prefetch_count=1)
        return connection, channel

    def callback(self, ch, method, properties, body):
        raise NotImplementedError

    def _run(self):
        while True:
            try:
                connection, channel = self._connect()
                logger.info("Connected to RabbitMQ — queue: %s", self.queue_name)
                channel.basic_consume(queue=self.queue_name, on_message_callback=self.callback)
                channel.start_consuming()
            except Exception as exc:
                logger.error("Consumer error on queue %s: %s — retrying in 5s", self.queue_name, exc)
                time.sleep(5)

    def start(self):
        thread = threading.Thread(target=self._run, daemon=True, name=f"consumer-{self.queue_name}")
        thread.start()
