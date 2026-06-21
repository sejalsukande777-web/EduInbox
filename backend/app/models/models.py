from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text,
    ForeignKey, Enum, BigInteger, JSON, Float, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
import enum
from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class EmailCategory(str, enum.Enum):
    notes = "notes"
    assignments = "assignments"
    announcements = "announcements"
    events = "events"
    resources = "resources"
    other = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String)
    avatar_url = Column(String)
    google_id = Column(String, unique=True, index=True)

    # Encrypted Gmail OAuth tokens
    gmail_access_token_enc = Column(Text)
    gmail_refresh_token_enc = Column(Text)
    gmail_token_expiry = Column(DateTime(timezone=True))
    gmail_connected = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_sync_at = Column(DateTime(timezone=True))

    sources = relationship("LearningSource", back_populates="user", cascade="all, delete-orphan")
    emails = relationship("Email", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class LearningSource(Base):
    __tablename__ = "learning_sources"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String, nullable=False)
    sender_patterns = Column(JSON, default=list)  # list of email addresses / domains
    is_active = Column(Boolean, default=True)
    is_custom = Column(Boolean, default=False)
    email_count = Column(Integer, default=0)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sources")
    emails = relationship("Email", back_populates="source")


class Email(Base):
    __tablename__ = "emails"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String, ForeignKey("learning_sources.id", ondelete="SET NULL"), nullable=True, index=True)

    gmail_id = Column(String, nullable=False)
    thread_id = Column(String)
    subject = Column(String)
    sender = Column(String)
    sender_email = Column(String)
    snippet = Column(Text)
    body_text = Column(Text)
    body_html = Column(Text)

    category = Column(Enum(EmailCategory), default=EmailCategory.other)
    ai_confidence = Column(Float)
    ai_summary = Column(Text)
    detected_deadlines = Column(JSON, default=list)  # [{date, title, type}]

    received_at = Column(DateTime(timezone=True))
    processed_at = Column(DateTime(timezone=True))
    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)

    user = relationship("User", back_populates="emails")
    source = relationship("LearningSource", back_populates="emails")
    attachments = relationship("Attachment", back_populates="email", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_emails_user_gmail", "user_id", "gmail_id", unique=True),
        Index("ix_emails_received", "user_id", "received_at"),
        Index("ix_emails_category", "user_id", "category"),
    )


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String, primary_key=True, default=gen_uuid)
    email_id = Column(String, ForeignKey("emails.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    filename = Column(String, nullable=False)
    file_type = Column(String)  # pdf, pptx, docx, image
    mime_type = Column(String)
    size_bytes = Column(BigInteger)
    storage_path = Column(String)  # relative path in storage
    storage_url = Column(String)   # public URL if applicable

    source_name = Column(String)
    category = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    email = relationship("Email", back_populates="attachments")


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    email_id = Column(String, ForeignKey("emails.id", ondelete="SET NULL"), nullable=True)

    title = Column(String, nullable=False)
    deadline_date = Column(DateTime(timezone=True))
    deadline_type = Column(String)  # assignment, exam, event, other
    source_name = Column(String)
    is_notified = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String)
    message = Column(Text)
    notification_type = Column(String)  # email_received, deadline_reminder, sync_complete
    is_read = Column(Boolean, default=False)
    meta = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")