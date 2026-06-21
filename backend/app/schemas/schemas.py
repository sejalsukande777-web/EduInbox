from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


class EmailCategory(str, Enum):
    notes = "notes"
    assignments = "assignments"
    announcements = "announcements"
    events = "events"
    resources = "resources"
    other = "other"


# ── Auth ──────────────────────────────────────────────────────────────────────

class GoogleAuthURL(BaseModel):
    url: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class RefreshRequest(BaseModel):
    refresh_token: str


# ── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    gmail_connected: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Learning Sources ───────────────────────────────────────────────────────────

class DiscoveredSource(BaseModel):
    name: str
    sender_patterns: List[str]
    email_count: int
    sample_subject: Optional[str] = None


class SourceSelectionRequest(BaseModel):
    sources: List[DiscoveredSource]
    custom_sources: Optional[List[Dict[str, Any]]] = []


class LearningSourceOut(BaseModel):
    id: str
    name: str
    sender_patterns: List[str]
    is_active: bool
    is_custom: bool
    email_count: int
    detected_at: datetime

    class Config:
        from_attributes = True


class SourceUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    name: Optional[str] = None


class CustomSourceCreate(BaseModel):
    name: str
    sender_patterns: List[str]


# ── Emails ────────────────────────────────────────────────────────────────────

class AttachmentOut(BaseModel):
    id: str
    filename: str
    file_type: Optional[str]
    mime_type: Optional[str]
    size_bytes: Optional[int]
    storage_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class EmailOut(BaseModel):
    id: str
    gmail_id: str
    subject: Optional[str]
    sender: Optional[str]
    sender_email: Optional[str]
    snippet: Optional[str]
    category: EmailCategory
    ai_confidence: Optional[float]
    ai_summary: Optional[str]
    detected_deadlines: Optional[List[Dict]] = []
    received_at: Optional[datetime]
    is_read: bool
    source_id: Optional[str]
    attachments: List[AttachmentOut] = []

    class Config:
        from_attributes = True


class EmailListResponse(BaseModel):
    items: List[EmailOut]
    total: int
    page: int
    per_page: int


# ── Deadlines ─────────────────────────────────────────────────────────────────

class DeadlineOut(BaseModel):
    id: str
    title: str
    deadline_date: Optional[datetime]
    deadline_type: Optional[str]
    source_name: Optional[str]
    is_completed: bool
    email_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: str
    title: Optional[str]
    message: Optional[str]
    notification_type: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Search ────────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
    category: Optional[EmailCategory] = None
    source_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = Field(default=20, le=100)
    offset: int = 0


class SearchResult(BaseModel):
    email_id: str
    subject: Optional[str]
    snippet: Optional[str]
    sender: Optional[str]
    category: EmailCategory
    received_at: Optional[datetime]
    source_name: Optional[str]
    relevance_score: Optional[float] = None
    matched_attachments: List[AttachmentOut] = []


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    query: str


# ── Analytics ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_notes: int
    total_assignments: int
    total_announcements: int
    total_events: int
    total_resources: int
    total_emails: int
    total_attachments: int
    upcoming_deadlines: int
    new_today: int
    sources_active: int


class TimelineItem(BaseModel):
    date: str
    items: List[Dict[str, Any]]


class ActivityItem(BaseModel):
    id: str
    type: str  # email_received, attachment_saved, deadline_detected
    title: str
    description: Optional[str]
    timestamp: datetime
    category: Optional[str]
    source_name: Optional[str]


# ── Gmail Sync ────────────────────────────────────────────────────────────────

class GmailConnectResponse(BaseModel):
    connected: bool
    message: str


class SyncStatusResponse(BaseModel):
    status: str  # idle, running, completed, failed
    emails_processed: int
    last_sync: Optional[datetime]
    message: Optional[str]