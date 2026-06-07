@echo off
echo Compilando frontend...
cd /d %~dp0client
call npm run build
echo.
echo Listo. Para iniciar en produccion: start-prod.bat
