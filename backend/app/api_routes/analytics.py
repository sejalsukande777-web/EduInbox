from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import Optional
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.models import User, Email, Attachment, Deadline, Notification, LearningSource
from app.api_routes.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uid = current_user.id
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    async def count(model, *filters):
        r = await db.execute(select(func.count()).select_from(
            select(model).where(model.user_id == uid, *filters).subquery()
        ))
        return r.scalar() or 0

    return {
        "total_notes": await count(Email, Email.category == "notes"),
        "total_assignments": await count(Email, Email.category == "assignments"),
        "total_announcements": await count(Email, Email.category == "announcements"),
        "total_events": await count(Email, Email.category == "events"),
        "total_resources": await count(Email, Email.category == "resources"),
        "total_emails": await count(Email),
        "total_attachments": await count(Attachment),
        "upcoming_deadlines": await count(Deadline, Deadline.is_completed == False),
        "new_today": await count(Email, Email.received_at >= today),
        "sources_active": await count(LearningSource, LearningSource.is_active == True),
    }

@router.get("/timeline")
async def get_timeline(
    days: int = 30,
    source_id: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    query = select(Email).where(
        and_(Email.user_id == current_user.id, Email.received_at >= since)
    )
    if source_id:
        query = query.where(Email.source_id == source_id)
    if category:
        query = query.where(Email.category == category)

    result = await db.execute(query.order_by(desc(Email.received_at)))
    emails = result.scalars().all()

    grouped: dict = {}
    for e in emails:
        if not e.received_at:
            continue
        date_key = e.received_at.strftime("%b %d")
        if date_key not in grouped:
            grouped[date_key] = []
        grouped[date_key].append({
            "id": e.id, "subject": e.subject, "category": e.category,
            "sender": e.sender, "source_name": None,
            "received_at": e.received_at.isoformat(),
        })
    return [{"date": d, "items": items} for d, items in grouped.items()]

@router.get("/activity")
async def get_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Email).where(Email.user_id == current_user.id)
        .order_by(desc(Email.processed_at)).limit(limit)
    )
    emails = result.scalars().all()
    return [
        {
            "id": e.id, "type": "email_received",
            "title": e.subject or "New Email",
            "description": e.snippet,
            "timestamp": (e.processed_at or e.received_at or datetime.now(timezone.utc)).isoformat(),
            "category": e.category, "source_name": None,
        }
        for e in emails
    ]

@router.get("/deadlines")
async def get_deadlines(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Deadline).where(
            and_(Deadline.user_id == current_user.id, Deadline.is_completed == False)
        ).order_by(Deadline.deadline_date)
    )
    deadlines = result.scalars().all()
    return [
        {
            "id": d.id, "title": d.title, "deadline_date": d.deadline_date,
            "deadline_type": d.deadline_type, "source_name": d.source_name,
            "is_completed": d.is_completed, "email_id": d.email_id,
            "created_at": d.created_at,
        }
        for d in deadlines
    ]

@router.get("/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at)).limit(50)
    )
    notifs = result.scalars().all()
    return [
        {
            "id": n.id, "title": n.title, "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read, "created_at": n.created_at,
        }
        for n in notifs
    ]

    @router.post("/notifications/read-all")
    async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
       result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id)
    )
    for n in result.scalars().all():
        n.is_read = True
    await db.commit()
    return {"message": "All marked as read"}