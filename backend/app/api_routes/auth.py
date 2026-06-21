from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import (
    create_access_token, create_refresh_token,
    verify_token, encrypt_token,
)
from app.models.models import User
from app.schemas.schemas import TokenResponse, UserOut, RefreshRequest, GoogleAuthURL
from app.services.gmail_service import get_authorization_url, exchange_code

router = APIRouter()


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ", 1)[1]
    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/google/url", response_model=GoogleAuthURL)
async def get_google_auth_url():
    """Get the Google OAuth authorization URL."""
    url, state = get_authorization_url()
    return {"url": url}


@router.get("/google/callback")
async def google_callback(code: str, state: str = "", db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback — exchange code for tokens."""
    try:
        token_data = exchange_code(code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {e}")

    user_info = token_data["user_info"]
    google_id = user_info.get("id")
    email = user_info.get("email")

    # Find or create user
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            name=user_info.get("name"),
            avatar_url=user_info.get("picture"),
            google_id=google_id,
        )
        db.add(user)
        await db.flush()

    # Store encrypted Gmail tokens
    user.google_id = google_id
    user.name = user_info.get("name")
    user.avatar_url = user_info.get("picture")
    user.gmail_connected = True
    user.gmail_access_token_enc = encrypt_token(token_data["access_token"])
    if token_data.get("refresh_token"):
        user.gmail_refresh_token_enc = encrypt_token(token_data["refresh_token"])
    user.gmail_token_expiry = token_data.get("expiry")

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    # Redirect to frontend with tokens
    from app.core.config import settings
    frontend_url = settings.ALLOWED_ORIGINS[0] if settings.ALLOWED_ORIGINS else "http://localhost:5173"
    return RedirectResponse(
        url=f"{frontend_url}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = verify_token(body.refresh_token, "refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/logout")
async def logout():
    return {"message": "Logged out. Clear tokens client-side."}