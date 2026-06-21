from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from app.core.database import get_db
from app.models.models import User, LearningSource
from app.api_routes.auth import get_current_user

router = APIRouter()

@router.get("/")
async def list_sources(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSource).where(LearningSource.user_id == current_user.id)
    )
    sources = result.scalars().all()
    return [
        {
            "id": s.id, "name": s.name, "sender_patterns": s.sender_patterns,
            "is_active": s.is_active, "is_custom": s.is_custom,
            "email_count": s.email_count, "detected_at": s.detected_at,
        }
        for s in sources
    ]

@router.post("/select")
async def select_sources(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for s in body.get("sources", []):
        existing = await db.execute(
            select(LearningSource).where(
                and_(LearningSource.user_id == current_user.id, LearningSource.name == s["name"])
            )
        )
        if not existing.scalar_one_or_none():
            db.add(LearningSource(
                user_id=current_user.id,
                name=s["name"],
                sender_patterns=s.get("sender_patterns", []),
                email_count=s.get("email_count", 0),
                is_active=True,
            ))
    for cs in body.get("custom_sources", []):
        db.add(LearningSource(
            user_id=current_user.id,
            name=cs.get("name", "Custom"),
            sender_patterns=cs.get("sender_patterns", []),
            is_custom=True,
            is_active=True,
        ))
    await db.commit()
    return {"message": "Sources saved"}

@router.patch("/{source_id}")
async def update_source(
    source_id: str,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSource).where(
            and_(LearningSource.id == source_id, LearningSource.user_id == current_user.id)
        )
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    if "is_active" in body:
        source.is_active = body["is_active"]
    if "name" in body:
        source.name = body["name"]
    await db.commit()
    return {"message": "Updated"}

@router.delete("/{source_id}")
async def delete_source(
    source_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSource).where(
            and_(LearningSource.id == source_id, LearningSource.user_id == current_user.id)
        )
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    await db.delete(source)
    await db.commit()
    return {"message": "Deleted"}

@router.post("/custom")
async def add_custom_source(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    source = LearningSource(
        user_id=current_user.id,
        name=body["name"],
        sender_patterns=body.get("sender_patterns", []),
        is_custom=True,
        is_active=True,
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return {
        "id": source.id, "name": source.name,
        "sender_patterns": source.sender_patterns,
        "is_active": source.is_active, "is_custom": source.is_custom,
        "email_count": source.email_count, "detected_at": source.detected_at,
    }