@echo off
title Aura Motors Launcher
cd /d "%~dp0"

echo ===================================================
echo             INICIANDO AURA MOTORS
echo ===================================================
echo.

:: Verifica se a porta 3000 já está em uso
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] O servidor ja esta rodando na porta 3000!
) else (
    echo [INFO] Iniciando o servidor Aura Motors (npm run dev)...
    start "Aura Motors Server" cmd /k "npm run dev"
    echo [INFO] Aguardando o servidor inicializar...
    timeout /t 3 >nul
)

echo [INFO] Abrindo o aplicativo no navegador padrao...
start http://localhost:3000

echo.
echo ===================================================
echo   Pronto! Voce ja pode usar o Aura Motors.
echo ===================================================
timeout /t 2 >nul
exit
