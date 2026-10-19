# EduInbox AI

This project is a simple student email organizer. It takes your Gmail emails, finds important stuff like assignments and deadlines, and shows it in a dashboard.

It is still a learning project, so some parts are basic and can be improved later.

## What this project does

- Connects to Gmail
- Looks for emails from teachers, colleges, or learning platforms
- Sorts emails into categories like notes, assignments, announcements, events, and resources
- Shows deadlines and recent activity in a dashboard

## Live Demo
Frontend: https://edu-inbox.vercel.app
Backend API: http://3.26.211.180:8000/docs

## Main folders

- backend/ - Python FastAPI backend
- fronted/ - React frontend

## What you need before starting

- Python 3.11 
- Node.js 20 
- PostgreSQL
- Redis
- A Google Cloud account for Gmail login


## How to run it locally

### 1. Backend setup

cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt


Create a `.env` file and add your settings.

Important values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET_KEY`
- `ENCRYPTION_KEY`

Then start the backend:

uvicorn main:app --reload --host 0.0.0.0 --port 8000


### 2. Frontend setup

```bash
cd fronted
npm install
npm run dev
```

Open the app in your browser:

http://localhost:5173


## Google login setup

1. Go to Google Cloud Console
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth credentials
5. Add this redirect URL:

http://localhost:8000/api/auth/google/callback


## Database and Redis

You need PostgreSQL and Redis running locally.

Example values:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/eduinbox
REDIS_URL=redis://localhost:6379


## Screenshots

![Landing Page](screenshots/landing.png)
![Dashboard](screenshots/dashboard.png)
![Emails](screenshots/emails.png)
![Timeline](screenshots/timeline.png)

## Notes

This project is still in progress. Some features may not be fully finished yet, but the basic idea is working: Gmail + AI + dashboard.
