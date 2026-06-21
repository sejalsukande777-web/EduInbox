from typing import List, Optional
from datetime import datetime, timezone
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.models import User, Email, Attachment, Deadline, LearningSource, Notification
from app.services import gmail_service, storage_service
from app.ai import classifier
from app.core.security import decrypt_token

logger = logging.getLogger(__name__)


async def get_gmail_service_for_user(user: User):
    """Build authenticated Gmail service from stored user tokens."""
    if not user.gmail_connected:
        raise ValueError("Gmail not connected for this user.")
    access_token = decrypt_token(user.gmail_access_token_enc)
    refresh_token = decrypt_token(user.gmail_refresh_token_enc)
    return gmail_service.build_gmail_service(access_token, refresh_token)


async def sync_emails_for_user(db: AsyncSession, user: User) -> dict:
    """
    Main sync function: fetches emails from active sources,
    classifies them, saves attachments.
    """
    service = await get_gmail_service_for_user(user)

    # Get active sources
    result = await db.execute(
        select(LearningSource).where(
            and_(LearningSource.user_id == user.id, LearningSource.is_active == True)
        )
    )
    sources = result.scalars().all()

    if not sources:
        return {"status": "no_sources", "emails_processed": 0}

    emails_processed = 0

    for source in sources:
        patterns = source.sender_patterns or []
        if not patterns:
            continue

        # Build Gmail query for this source
        from_query = " OR ".join([f"from:{p}" for p in patterns[:5]])
        messages = gmail_service.list_messages(
            service,
            max_results=50,
            query=f"({from_query})",
        )

        for msg_ref in messages:
            try:
                existing = await db.execute(
                    select(Email).where(
                        and_(Email.user_id == user.id, Email.gmail_id == msg_ref["id"])
                    )
                )
                if existing.scalar_one_or_none():
                    continue  # Already processed

                raw = gmail_service.get_message(service, msg_ref["id"])
                if not raw:
                    continue

                parsed = gmail_service.parse_message(raw)

                # AI classification
                category, confidence = classifier.classify_email(
                    parsed["subject"] or "",
                    parsed["body_text"] or "",
                    parsed["sender_email"] or "",
                )
                summary = classifier.summarize_email(
                    parsed["subject"] or "",
                    parsed["body_text"] or "",
                )
                deadlines = classifier.extract_deadlines(
                    parsed["subject"] or "",
                    parsed["body_text"] or "",
                    source.name,
                )

                email = Email(
                    user_id=user.id,
                    source_id=source.id,
                    gmail_id=parsed["gmail_id"],
                    thread_id=parsed["thread_id"],
                    subject=parsed["subject"],
                    sender=parsed["sender"],
                    sender_email=parsed["sender_email"],
                    snippet=parsed["snippet"],
                    body_text=parsed["body_text"],
                    body_html=parsed["body_html"],
                    category=category,
                    ai_confidence=confidence,
                    ai_summary=summary,
                    detected_deadlines=deadlines,
                    received_at=parsed["received_at"],
                    processed_at=datetime.now(timezone.utc),
                )
                db.add(email)
                await db.flush()

                # Process deadlines
                for dl in deadlines:
                    deadline = Deadline(
                        user_id=user.id,
                        email_id=email.id,
                        title=dl["title"],
                        deadline_type=dl["type"],
                        source_name=source.name,
                    )
                    db.add(deadline)

                # Process attachments
                for att in parsed["attachments"]:
                    file_type = storage_service.get_file_type(
                        att.get("mime_type", ""), att.get("filename", "")
                    )
                    if not file_type:
                        continue  # Skip unsupported types

                    att_data = None
                    if att.get("attachment_id"):
                        att_data = gmail_service.fetch_attachment_data(
                            service, parsed["gmail_id"], att["attachment_id"]
                        )

                    storage_path, storage_url = None, None
                    if att_data:
                        rel_path = storage_service.build_storage_path(
                            user.id, source.name, category, att["filename"]
                        )
                        storage_path, storage_url = await storage_service.save_file(att_data, rel_path)

                    attachment = Attachment(
                        email_id=email.id,
                        user_id=user.id,
                        filename=att["filename"],
                        file_type=file_type,
                        mime_type=att.get("mime_type"),
                        size_bytes=att.get("size", 0),
                        storage_path=storage_path,
                        storage_url=storage_url,
                        source_name=source.name,
                        category=category,
                    )
                    db.add(attachment)

                emails_processed += 1

            except Exception as e:
                logger.error(f"Error processing message {msg_ref['id']}: {e}")
                continue

        # Update source email count
        source.email_count += emails_processed

    # Update user last sync time
    user.last_sync_at = datetime.now(timezone.utc)

    # Create sync notification
    notif = Notification(
        user_id=user.id,
        title="Sync Complete",
        message=f"Processed {emails_processed} new emails from {len(sources)} sources.",
        notification_type="sync_complete",
    )
    db.add(notif)

    await db.commit()
    return {"status": "completed", "emails_processed": emails_processed}