import os
import aiofiles
from pathlib import Path
from typing import Optional
import logging
import mimetypes

from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {
    "application/pdf": "pdf",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "image",
    "image/png": "image",
    "image/gif": "image",
    "image/webp": "image",
}


def get_file_type(mime_type: str, filename: str) -> Optional[str]:
    """Map MIME type to our internal file type."""
    if mime_type in ALLOWED_EXTENSIONS:
        return ALLOWED_EXTENSIONS[mime_type]
    # Fallback: guess from filename
    ext = Path(filename).suffix.lower().lstrip(".")
    type_map = {
        "pdf": "pdf", "ppt": "ppt", "pptx": "pptx",
        "doc": "doc", "docx": "docx",
        "jpg": "image", "jpeg": "image", "png": "image", "gif": "image", "webp": "image",
    }
    return type_map.get(ext)


def build_storage_path(user_id: str, source_name: str, category: str, filename: str) -> str:
    """
    Builds organized path: {user_id}/{source_name}/{category}/{filename}
    Sanitizes names to be filesystem-safe.
    """
    safe_source = _safe_name(source_name)
    safe_category = _safe_name(category)
    safe_filename = _safe_name(filename)
    return f"{user_id}/{safe_source}/{safe_category}/{safe_filename}"


def _safe_name(name: str) -> str:
    import re
    name = re.sub(r'[^\w\s.-]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name[:100] or "unknown"


async def save_file_local(data: bytes, relative_path: str) -> str:
    """Save file to local storage. Returns the relative path."""
    full_path = Path(settings.STORAGE_LOCAL_PATH) / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    async with aiofiles.open(full_path, "wb") as f:
        await f.write(data)

    logger.info(f"Saved file: {full_path}")
    return relative_path


async def save_file(data: bytes, relative_path: str) -> tuple[str, Optional[str]]:
    """
    Save file to configured storage.
    Returns (storage_path, public_url).
    """
    if settings.STORAGE_TYPE == "local":
        path = await save_file_local(data, relative_path)
        return path, f"/api/attachments/file/{relative_path}"
    elif settings.STORAGE_TYPE in ("s3", "r2"):
        return await _save_to_s3(data, relative_path)
    else:
        return await save_file_local(data, relative_path)


async def _save_to_s3(data: bytes, relative_path: str) -> tuple[str, Optional[str]]:
    try:
        import aioboto3
        session = aioboto3.Session()
        kwargs = {
            "aws_access_key_id": settings.STORAGE_KEY_ID,
            "aws_secret_access_key": settings.STORAGE_SECRET,
        }
        if settings.STORAGE_ENDPOINT:
            kwargs["endpoint_url"] = settings.STORAGE_ENDPOINT

        async with session.client("s3", **kwargs) as s3:
            await s3.put_object(
                Bucket=settings.STORAGE_BUCKET,
                Key=relative_path,
                Body=data,
            )
        url = f"https://{settings.STORAGE_BUCKET}/{relative_path}"
        return relative_path, url
    except Exception as e:
        logger.error(f"S3 upload failed: {e}. Falling back to local.")
        return await save_file_local(data, relative_path), None


async def read_file_local(relative_path: str) -> Optional[bytes]:
    full_path = Path(settings.STORAGE_LOCAL_PATH) / relative_path
    if not full_path.exists():
        return None
    async with aiofiles.open(full_path, "rb") as f:
        return await f.read()