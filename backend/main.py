from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api_routes import auth, gmail, emails, sources, attachments, search, analytics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting EduInbox AI...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready.")
    yield
    logger.info("Shutting down EduInbox AI.")


app = FastAPI(
    title="EduInbox AI",
    description="AI-powered academic email assistant for all learners",
    version="1.0.0",
    lifespan=lifespan,
)

os.makedirs("./uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(gmail.router, prefix="/api/gmail", tags=["Gmail"])
app.include_router(sources.router, prefix="/api/sources", tags=["Sources"])
app.include_router(emails.router, prefix="/api/emails", tags=["Emails"])
app.include_router(attachments.router, prefix="/api/attachments", tags=["Attachments"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "EduInbox AI"}