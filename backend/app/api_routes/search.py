from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_, desc
from typing import Optional
from app.core.database import get_db
from app.models.models import User, Email, Attachment
from app.api_routes.auth import get_current_user

router = APIRouter()

@router.post("/")
async def search(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query_str = body.get("query", "")
    category = body.get("category")
    limit = body.get("limit", 20)
    offset = body.get("offset", 0)

    query = select(Email).where(Email.user_id == current_user.id)
    if query_str:
        q = f"%{query_str}%"
        query = query.where(or_(
            Email.subject.ilike(q),
            Email.snippet.ilike(q),
            Email.body_text.ilike(q),
            Email.sender.ilike(q),
        ))
    if category:
        query = query.where(Email.category == category)

    count_r = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_r.scalar()

    result = await db.execute(query.order_by(desc(Email.received_at)).offset(offset).limit(limit))
    emails = result.scalars().all()

    return {
        "results": [
            {
                "email_id": e.id, "subject": e.subject, "snippet": e.snippet,
                "sender": e.sender, "category": e.category,
                "received_at": e.received_at, "source_name": None,
                "matched_attachments": [],
            }
            for e in emails
        ],
        "total": total,
        "query": query_str,
    }