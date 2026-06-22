from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .database import get_db
from .schemas import NotificationResponse
from . import service

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("/{user_id}", response_model=List[NotificationResponse])
def get_all(user_id: str, db: Session = Depends(get_db)):
    return service.get_notifications(db, user_id)

@router.get("/{user_id}/unread", response_model=List[NotificationResponse])
def get_unread(user_id: str, db: Session = Depends(get_db)):
    return service.get_unread(db, user_id)

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = service.mark_as_read(db, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.delete("/{notification_id}")
def delete(notification_id: int, db: Session = Depends(get_db)):
    service.delete_notification(db, notification_id)
    return {"message": "Deleted"}
