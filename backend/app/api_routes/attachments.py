from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from app.core.database import get_db
from app.models.models import User, Attachment
from app.api_routes.auth import get_current_user

router = APIRouter()

@router.get("/")
async def list_attachments(
    file_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Attachment).where(Attachment.user_id == current_user.id)
    if file_type:
        query = query.where(Attachment.file_type == file_type)
    result = await db.execute(query.order_by(desc(Attachment.created_at)))
    atts = result.scalars().all()
    return [
        {
            "id": a.id, "filename": a.filename, "file_type": a.file_type,
            "mime_type": a.mime_type, "size_bytes": a.size_bytes,
            "storage_url": a.storage_url, "created_at": a.created_at,
        }
        for a in atts
    ]