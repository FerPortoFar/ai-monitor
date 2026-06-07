@echo off
setlocal
title AI Monitor Agent — Build Installer

echo.
echo ================================================
echo  AI Monitor Agent — Generando instalador
echo ================================================
echo.

:: 1. Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no encontrado. Instalar desde https://nodejs.org
    pause & exit /b 1
)

:: 2. Instalar pkg si no esta
pkg --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando pkg...
    npm install -g pkg
    if errorlevel 1 ( echo [ERROR] Fallo npm install -g pkg & pause & exit /b 1 )
)

:: 3. Crear carpeta dist
if not exist dist mkdir dist

:: 4. Compilar agent.js → dist\agent.exe
echo [1/3] Compilando agente a EXE...
pkg agent.js --targets node18-win-x64 --output dist\agent.exe
if errorlevel 1 ( echo [ERROR] Fallo la compilacion con pkg & pause & exit /b 1 )
echo       OK — dist\agent.exe generado

:: 5. Buscar Inno Setup
set "INNO_6=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
set "INNO_5=%ProgramFiles(x86)%\Inno Setup 5\ISCC.exe"
set "ISCC="

if exist "%INNO_6%" set "ISCC=%INNO_6%"
if exist "%INNO_5%" set "ISCC=%INNO_5%"

if "%ISCC%"=="" (
    echo.
    echo [AVISO] Inno Setup no encontrado.
    echo         Descargar GRATIS desde: https://jrsoftware.org/isinfo.php
    echo         Luego ejecutar manualmente:
    echo         "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" installer\setup.iss
    echo.
    echo         El EXE del agente ya esta en: dist\agent.exe
    pause & exit /b 0
)

:: 6. Compilar el instalador
echo [2/3] Compilando instalador con Inno Setup...
"%ISCC%" installer\setup.iss
if errorlevel 1 ( echo [ERROR] Fallo la compilacion del instalador & pause & exit /b 1 )

echo [3/3] Listo!
echo.
echo ================================================
echo  Instalador generado en:
echo  dist\AI-Monitor-Agent-Setup.exe
echo ================================================
echo.
pause
