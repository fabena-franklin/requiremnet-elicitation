@echo off
title No Idea - MVP Requirements

echo Starting Ollama...
start "" ollama serve

timeout /t 3 /nobreak >nul

echo Starting FastAPI backend...
cd /d "%~dp0backend"

start "" cmd /k "python -m uvicorn backend:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo Opening No Idea...
start "" "%~dp0frontend\index.html"

echo.
echo No Idea is running!
echo Backend: http://127.0.0.1:8000
echo API docs: http://127.0.0.1:8000/docs
echo.
pause
