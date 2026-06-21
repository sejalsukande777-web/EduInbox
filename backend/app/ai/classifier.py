"""
AI Service — Phase 1: Sentence Transformers + scikit-learn classifier
Designed to be swapped for LLM-based classification in Phase 2/3.
"""
from typing import Dict, List, Optional, Tuple, Any
import re
import logging
from datetime import datetime, timezone
import json

logger = logging.getLogger(__name__)

# Lazy-loaded models
_embedding_model = None
_classifier = None
_classifier_trained = False


def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            from app.core.config import settings
            _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("Embedding model loaded.")
        except ImportError:
            logger.warning("sentence-transformers not installed. Using keyword fallback.")
            _embedding_model = None
    return _embedding_model


CATEGORY_KEYWORDS = {
    "notes": [
        "lecture", "notes", "slides", "recording", "class material",
        "study material", "handout", "chapter", "unit", "topic",
        "session", "video", "tutorial", "reading",
    ],
    "assignments": [
        "assignment", "homework", "task", "submission", "submit",
        "due", "deadline", "exam", "quiz", "test", "assessment",
        "project", "lab", "practical", "viva", "midterm", "final",
        "marks", "grade", "score", "evaluation",
    ],
    "announcements": [
        "announcement", "notice", "important", "update", "information",
        "regarding", "attention", "inform", "notification", "alert",
        "circular", "memo", "reminder",
    ],
    "events": [
        "event", "webinar", "seminar", "workshop", "conference",
        "symposium", "fest", "hackathon", "competition", "meeting",
        "invite", "join us", "register", "rsvp",
    ],
    "resources": [
        "resource", "reference", "book", "link", "material",
        "article", "paper", "pdf", "download", "access",
        "portal", "library", "repository", "share",
    ],
}


def classify_email(subject: str, body: str, sender: str = "") -> Tuple[str, float]:
    """
    Classify an email into one of: notes, assignments, announcements, events, resources, other.
    Returns (category, confidence_score).
    """
    text = f"{subject} {body[:500]}".lower()

    # Try embedding-based classification first
    model = get_embedding_model()
    if model and _classifier_trained:
        try:
            embedding = model.encode([text])
            prediction = _classifier.predict(embedding)[0]
            proba = max(_classifier.predict_proba(embedding)[0])
            return prediction, float(proba)
        except Exception as e:
            logger.warning(f"Embedding classifier failed: {e}, falling back to keywords")

    # Keyword-based fallback
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        scores[category] = score

    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]

    if best_score == 0:
        return "other", 0.5

    total = sum(scores.values())
    confidence = best_score / total if total > 0 else 0.5
    return best_category, min(confidence + 0.2, 0.95)


def extract_deadlines(subject: str, body: str, source_name: str = "") -> List[Dict]:
    """
    Extract deadline information from email text using pattern matching.
    Phase 2: Replace with LLM for better accuracy.
    """
    text = f"{subject}\n{body}"
    deadlines = []

    # Date patterns
    date_patterns = [
        # "due on 15th January 2026" / "due by Jan 15"
        r"(?:due|submit|deadline|last date|before)\s+(?:on|by|before)?\s*"
        r"(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"
        r"(?:\s+\d{4})?)",

        # "January 15, 2026" or "15 January 2026"
        r"(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+\d{4})",

        # ISO format dates 2026-01-15
        r"(\d{4}-\d{2}-\d{2})",

        # DD/MM/YYYY
        r"(\d{1,2}/\d{1,2}/\d{4})",

        # "this Friday" / "next Monday"
        r"((?:this|next)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))",
    ]

    deadline_triggers = [
        "due", "submit", "submission", "deadline", "last date", "by",
        "before", "exam on", "test on", "quiz on"
    ]

    lines = text.split("\n")
    for line in lines:
        line_lower = line.lower()
        has_trigger = any(t in line_lower for t in deadline_triggers)
        if not has_trigger:
            continue

        for pattern in date_patterns:
            matches = re.findall(pattern, line, re.IGNORECASE)
            for match in matches:
                deadline_type = _infer_deadline_type(line_lower)
                deadlines.append({
                    "title": _extract_deadline_title(line, subject),
                    "date_text": match,
                    "type": deadline_type,
                    "source": source_name,
                    "raw_line": line.strip()[:200],
                })

    # Deduplicate by date_text
    seen = set()
    unique = []
    for d in deadlines:
        if d["date_text"] not in seen:
            seen.add(d["date_text"])
            unique.append(d)

    return unique[:5]  # Return at most 5 deadlines per email


def _infer_deadline_type(text: str) -> str:
    if any(w in text for w in ["exam", "test", "quiz", "midterm", "final", "viva"]):
        return "exam"
    if any(w in text for w in ["assignment", "homework", "project", "lab", "practical"]):
        return "assignment"
    if any(w in text for w in ["event", "webinar", "seminar", "workshop"]):
        return "event"
    return "other"


def _extract_deadline_title(line: str, fallback: str) -> str:
    line = line.strip()
    if len(line) < 10 or len(line) > 150:
        return fallback[:100]
    return line[:100]


def summarize_email(subject: str, body: str) -> Optional[str]:
    """
    Generate a short summary of the email.
    Phase 1: extractive (first 2 sentences of body).
    Phase 2: LLM-based abstractive summary.
    """
    text = body.strip()
    if not text:
        return None

    # Remove HTML tags if any
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    sentences = re.split(r"(?<=[.!?])\s+", text)
    summary_sentences = [s for s in sentences[:3] if len(s) > 20]
    if not summary_sentences:
        return text[:200] if text else None

    return " ".join(summary_sentences[:2])[:300]


def train_classifier(training_data: List[Dict]):
    """
    Train the sklearn classifier on labeled data.
    training_data: [{"text": "...", "label": "notes"}, ...]
    """
    global _classifier, _classifier_trained
    try:
        from sklearn.linear_model import LogisticRegression
        from sklearn.preprocessing import LabelEncoder
        import numpy as np

        model = get_embedding_model()
        if model is None:
            return

        texts = [d["text"] for d in training_data]
        labels = [d["label"] for d in training_data]

        embeddings = model.encode(texts)
        clf = LogisticRegression(max_iter=1000)
        clf.fit(embeddings, labels)

        _classifier = clf
        _classifier_trained = True
        logger.info(f"Classifier trained on {len(training_data)} samples.")
    except Exception as e:
        logger.error(f"Classifier training failed: {e}")


async def ask_ollama(prompt: str, system: str = "") -> Optional[str]:
    """Phase 2: Query local Ollama LLM."""
    try:
        import httpx
        from app.core.config import settings

        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "system": system,
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
            resp.raise_for_status()
            return resp.json().get("response", "")
    except Exception as e:
        logger.warning(f"Ollama unavailable: {e}")
        return None


async def classify_with_llm(subject: str, body: str) -> Tuple[str, float]:
    """Phase 2 classification via Ollama."""
    categories = ["notes", "assignments", "announcements", "events", "resources", "other"]
    prompt = (
        f"Classify this academic email into exactly one category: {', '.join(categories)}.\n"
        f"Subject: {subject}\n"
        f"Body (first 300 chars): {body[:300]}\n"
        f"Reply with ONLY the category name, nothing else."
    )
    response = await ask_ollama(prompt, system="You are an academic email classifier.")
    if response:
        response = response.strip().lower()
        for cat in categories:
            if cat in response:
                return cat, 0.85
    return "other", 0.5