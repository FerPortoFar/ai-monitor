@echo off
echo Iniciando AI Monitor...
start "AI Monitor - Server" cmd /k "cd /d %~dp0server && node index.js"
timeout /t 2 /nobreak >nul
start "AI Monitor - Client" cmd /k "cd /d %~dp0client && npm run dev"
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause
