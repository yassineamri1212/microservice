from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "mysql"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "rootpassword"
    DB_NAME: str = "notification_py_db"

    RABBITMQ_HOST: str = "rabbitmq"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "rabbituser"
    RABBITMQ_PASSWORD: str = "rabbitpass"

    CHAT_QUEUE: str = "chat.notification"
    MEET_QUEUE: str = "meet.notification"

    class Config:
        env_file = ".env"

settings = Settings()
