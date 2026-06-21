from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.models.models import User, LearningSource
from app.schemas.schemas import (
    GmailConnectResponse, SyncStatusResponse,
    DiscoveredSource, SourceSelectionRequest, LearningSourceOut,
)
from app.api_routes.auth import get_current_user
from app.services import gmail_service, email_service

router = APIRouter()

# In-memory sync status (replace with Redis in production)
_sync_status: dict = {}


@router.get("/status", response_model=GmailConnectResponse)
async def get_gmail_status(current_user: User = Depends(get_current_user)):
    return GmailConnectResponse(
        connected=current_user.gmail_connected,
        message="Gmail connected" if current_user.gmail_connected else "Gmail not connected",
    )


@router.get("/discover", response_model=list[DiscoveredSource])
async def discover_sources(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze recent Gmail and detect likely learning sources."""
    if not current_user.gmail_connected:
        raise HTTPException(status_code=400, detail="Gmail not connected")

    service = await email_service.get_gmail_service_for_user(current_user)
    sources = gmail_service.discover_learning_sources(
        service,
        lookback_days=30,
    )
    return [DiscoveredSource(**s) for s in sources]


@router.post("/sync", response_model=SyncStatusResponse)
async def trigger_sync(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger an async email sync for the current user."""
    if not current_user.gmail_connected:
        raise HTTPException(status_code=400, detail="Gmail not connected")

    user_id = current_user.user_id if hasattr(current_user, "user_id") else current_user.id
    _sync_status[user_id] = {"status": "running", "emails_processed": 0}

    async def run_sync():
        try:
            result = await email_service.sync_emails_for_user(db, current_user)
            _sync_status[user_id] = {
                "status": "completed",
                "emails_processed": result["emails_processed"],
            }
        except Exception as e:
            _sync_status[user_id] = {"status": "failed", "emails_processed": 0, "message": str(e)}

    background_tasks.add_task(run_sync)

    return SyncStatusResponse(
        status="running",
        emails_processed=0,
        last_sync=current_user.last_sync_at,
        message="Sync started in background.",
    )


@router.get("/sync/status", response_model=SyncStatusResponse)
async def get_sync_status(current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    status_data = _sync_status.get(user_id, {"status": "idle", "emails_processed": 0})
    return SyncStatusResponse(
        status=status_data.get("status", "idle"),
        emails_processed=status_data.get("emails_processed", 0),
        last_sync=current_user.last_sync_at,
        message=status_data.get("message"),
    )