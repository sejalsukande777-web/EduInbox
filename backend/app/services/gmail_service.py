from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta, timezone
import base64
import email as email_lib
from typing import List, Dict, Optional, Any
import logging
import re
from collections import defaultdict

from app.core.config import settings
from app.core.security import encrypt_token, decrypt_token

logger = logging.getLogger(__name__)

GMAIL_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly",
]

def get_oauth_flow() -> Flow:
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        },
        scopes=GMAIL_SCOPES,
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    return flow


def get_authorization_url() -> tuple[str, str]:
    flow = get_oauth_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return auth_url, state


def exchange_code(code: str) -> Dict:
    flow = get_oauth_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials

    # Get user info
    service = build("oauth2", "v2", credentials=credentials)
    user_info = service.userinfo().get().execute()

    return {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "expiry": credentials.expiry,
        "user_info": user_info,
    }


def build_gmail_service(access_token: str, refresh_token: str):
    credentials = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=GMAIL_SCOPES,
    )
    return build("gmail", "v1", credentials=credentials)


def list_messages(service, max_results: int = 100, query: str = "") -> List[Dict]:
    try:
        result = service.users().messages().list(
            userId="me",
            maxResults=max_results,
            q=query,
        ).execute()
        return result.get("messages", [])
    except HttpError as e:
        logger.error(f"Gmail list_messages error: {e}")
        return []


def get_message(service, message_id: str) -> Optional[Dict]:
    try:
        return service.users().messages().get(
            userId="me",
            id=message_id,
            format="full",
        ).execute()
    except HttpError as e:
        logger.error(f"Gmail get_message error: {e}")
        return None


def parse_message(msg: Dict) -> Dict:
    headers = {h["name"].lower(): h["value"] for h in msg.get("payload", {}).get("headers", [])}

    subject = headers.get("subject", "(No Subject)")
    sender = headers.get("from", "")
    date_str = headers.get("date", "")
    snippet = msg.get("snippet", "")

    # Parse sender name and email
    sender_name = sender
    sender_email = sender
    match = re.match(r"^(.*?)\s*<(.+?)>$", sender)
    if match:
        sender_name = match.group(1).strip().strip('"')
        sender_email = match.group(2).strip()

    # Parse date
    received_at = None
    try:
        from email.utils import parsedate_to_datetime
        received_at = parsedate_to_datetime(date_str)
    except Exception:
        pass

    # Extract body
    body_text, body_html = "", ""
    attachments_info = []
    _extract_parts(msg.get("payload", {}), body_text, body_html, attachments_info)
    body_text, body_html = _get_body(msg.get("payload", {}))
    attachments_info = _get_attachments(msg.get("payload", {}))

    return {
        "gmail_id": msg["id"],
        "thread_id": msg.get("threadId"),
        "subject": subject,
        "sender": sender_name,
        "sender_email": sender_email,
        "snippet": snippet,
        "body_text": body_text,
        "body_html": body_html,
        "received_at": received_at,
        "attachments": attachments_info,
    }


def _get_body(payload: Dict) -> tuple[str, str]:
    body_text, body_html = "", ""
    mime_type = payload.get("mimeType", "")

    if mime_type == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            body_text = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
    elif mime_type == "text/html":
        data = payload.get("body", {}).get("data", "")
        if data:
            body_html = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
    elif "parts" in payload:
        for part in payload["parts"]:
            t, h = _get_body(part)
            body_text = body_text or t
            body_html = body_html or h

    return body_text, body_html


def _get_attachments(payload: Dict) -> List[Dict]:
    attachments = []
    if "parts" in payload:
        for part in payload["parts"]:
            filename = part.get("filename", "")
            if filename:
                attachments.append({
                    "filename": filename,
                    "mime_type": part.get("mimeType"),
                    "size": part.get("body", {}).get("size", 0),
                    "attachment_id": part.get("body", {}).get("attachmentId"),
                    "part_id": part.get("partId"),
                })
            attachments.extend(_get_attachments(part))
    return attachments


def _extract_parts(payload, body_text, body_html, attachments):
    pass  # handled above


def fetch_attachment_data(service, message_id: str, attachment_id: str) -> Optional[bytes]:
    try:
        result = service.users().messages().attachments().get(
            userId="me",
            messageId=message_id,
            id=attachment_id,
        ).execute()
        data = result.get("data", "")
        return base64.urlsafe_b64decode(data + "==") if data else None
    except HttpError as e:
        logger.error(f"Fetch attachment error: {e}")
        return None


def discover_learning_sources(service, lookback_days: int = 30) -> List[Dict]:
    """
    Analyze recent emails to detect recurring academic / course-related senders.
    Groups senders by domain and name patterns, ranks by frequency.
    """
    since = (datetime.now(timezone.utc) - timedelta(days=lookback_days)).strftime("%Y/%m/%d")
    messages = list_messages(service, max_results=200, query=f"after:{since}")

    sender_map = defaultdict(lambda: {"count": 0, "subjects": [], "emails": set()})

    for msg_ref in messages:
        msg = get_message(service, msg_ref["id"])
        if not msg:
            continue
        parsed = parse_message(msg)
        sender_email = parsed["sender_email"]
        sender_name = parsed["sender"]
        subject = parsed["subject"]

        # Extract domain
        domain_match = re.search(r"@([\w.-]+)", sender_email)
        domain = domain_match.group(1) if domain_match else sender_email

        key = _infer_source_name(sender_name, domain)
        sender_map[key]["count"] += 1
        sender_map[key]["emails"].add(sender_email)
        if len(sender_map[key]["subjects"]) < 3:
            sender_map[key]["subjects"].append(subject)

    # Filter to likely academic sources (appeared 2+ times)
    sources = []
    for name, data in sender_map.items():
        if data["count"] >= 2:
            sources.append({
                "name": name,
                "sender_patterns": list(data["emails"]),
                "email_count": data["count"],
                "sample_subject": data["subjects"][0] if data["subjects"] else None,
            })

    # Sort by frequency
    sources.sort(key=lambda x: x["email_count"], reverse=True)
    return sources[:20]  # Return top 20


def _infer_source_name(sender_name: str, domain: str) -> str:
    """Try to infer a human-readable source name from sender info."""
    # Remove common email suffixes
    domain_clean = re.sub(r"\.(edu|ac\.in|org|com|net|co\.in)$", "", domain)
    domain_clean = domain_clean.replace(".", " ").replace("-", " ").title()

    if sender_name and sender_name != domain:
        # Use sender name if it looks like an institution
        for keyword in ["university", "college", "institute", "academy", "course", "school", "dept", "department"]:
            if keyword.lower() in sender_name.lower():
                return sender_name
        # Use domain-based name if domain looks more institutional
        return sender_name if len(sender_name) > 3 else domain_clean
    return domain_clean