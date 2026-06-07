@echo off
title Starting Aditi Assistant
cd /d "%~dp0"

echo Starting MongoDB...
net start MongoDB >nul 2>&1

echo Starting Ollama...
start "" /min cmd /c "ollama serve"

timeout /t 8 /nobreak >nul

echo Starting Backend...
start "" /min cmd /k "cd /d ""%~dp0aiBackend"" && npm run dev"

timeout /t 8 /nobreak >nul

echo Starting Frontend...
start "" /min cmd /k "cd /d ""%~dp0aiFrontend"" && npm run dev -- --host 127.0.0.1"

timeout /t 8 /nobreak >nul

echo Opening Electron App...
start "" cmd /k "cd /d ""%~dp0"" && npm run electron"

pause