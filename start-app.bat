@echo off
title Iniciar Aura Motors
cd /d "C:\Users\am_in\Downloads\aura-motors_loja\aura-motors (1)"
echo Iniciando o servidor de desenvolvimento (Aura Motors)...
start "Aura Motors Server" cmd /k "npm run dev"
echo Aguardando o servidor inicializar...
timeout /t 3 >nul
echo Abrindo o aplicativo no Google Chrome...
start chrome http://localhost:3000
exit
