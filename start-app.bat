@echo off
setlocal enabledelayedexpansion
title Aura Motors Launcher

set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

cd /d "%APP_DIR%"

echo ===================================================
echo             INICIANDO AURA MOTORS
echo ===================================================
echo.

:: Verifica se a porta 3000 ja esta aberta
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Servidor Aura Motors ja esta ativo na porta 3000!
    goto open_chrome
)

echo [INFO] Iniciando o servidor Aura Motors (npm run dev)...
start "Aura Motors Server" /d "%APP_DIR%" cmd.exe /k "npm run dev"

echo [INFO] Aguardando o servidor inicializar...

:: Loop de espera inteligente ate a porta 3000 responder (max 15s)
set "MAX_TRIES=15"
set "TRIES=0"

:wait_loop
set /a TRIES+=1
ping 127.0.0.1 -n 2 >nul
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Servidor pronto!
    goto open_chrome
)

if %TRIES% geq %MAX_TRIES% (
    echo [AVISO] Tentando abrir o navegador...
    goto open_chrome
)

goto wait_loop

:open_chrome
echo [INFO] Abrindo o Aura Motors no Google Chrome...

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
    goto finish
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
    goto finish
)

if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
    goto finish
)

start chrome "http://localhost:3000" 2>nul
if %errorlevel% neq 0 (
    start http://localhost:3000
)

:finish
echo.
echo ===================================================
echo   Pronto! Aura Motors aberto com sucesso.
echo ===================================================
ping 127.0.0.1 -n 2 >nul
exit
