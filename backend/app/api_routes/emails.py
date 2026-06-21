from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from typing import Optional
from app.core.database import get_db
from app.models.models import User, Email, Attachment
from app.api_routes.auth import get_current_user

router = APIRouter()

@router.get("/")
async def list_emails(
    category: Optional[str] = None,
    source_id: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Email).where(Email.user_id == current_user.id)
    if category:
        query = query.where(Email.category == category)
    if source_id:
        query = query.where(Email.source_id == source_id)

    count_q = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_q.scalar()

    query = query.order_by(desc(Email.received_at)).offset((page-1)*per_page).limit(per_page)
    result = await db.execute(query)
    emails = result.scalars().all()

    items = []
    for e in emails:
        att_result = await db.execute(select(Attachment).where(Attachment.email_id == e.id))
        atts = att_result.scalars().all()
        items.append({
            "id": e.id, "gmail_id": e.gmail_id, "subject": e.subject,
            "sender": e.sender, "sender_email": e.sender_email,
            "snippet": e.snippet, "category": e.category,
            "ai_confidence": e.ai_confidence, "ai_summary": e.ai_summary,
            "detected_deadlines": e.detected_deadlines or [],
            "received_at": e.received_at, "is_read": e.is_read,
            "source_id": e.source_id,
            "attachments": [
                {"id": a.id, "filename": a.filename, "file_type": a.file_type,
                 "mime_type": a.mime_type, "size_bytes": a.size_bytes,
                 "storage_url": a.storage_url, "created_at": a.created_at}
                for a in atts
            ],
        })
    return {"items": items, "total": total, "page": page, "per_page": per_page}

@router.get("/{email_id}")
async def get_email(
    email_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Email).where(and_(Email.id == email_id, Email.user_id == current_user.id))
    )
    email = result.scalar_one_or_none()
    if not email:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Email not found")
    return email