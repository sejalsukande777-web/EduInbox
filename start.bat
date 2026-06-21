@echo off
echo Starting EduInbox AI...

start "Backend" cmd /k "cd D:\Documents\GitHub\Eduinbox\backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

timeout /t 3

start "Frontend" cmd /k "cd D:\Documents\GitHub\Eduinbox\fronted && npm run dev"

echo Both servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173