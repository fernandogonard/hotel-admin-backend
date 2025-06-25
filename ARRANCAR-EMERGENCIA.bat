@echo off
title SERVIDOR EMERGENCIA HOTEL
color 0A
echo.
echo ========================================
echo    ARRANQUE SERVIDOR DE EMERGENCIA
echo ========================================
echo.

cd /d "c:\Users\user\matydev\agustin\hotel-admin-backend"

echo 🧹 Matando procesos Node.js previos...
taskkill /F /IM node.exe >nul 2>&1

echo ⏳ Esperando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Iniciando servidor en puerto 2117...
echo 📊 Usando datos MOCK (sin MongoDB)
echo.
echo ⚠️  NO CERRAR ESTA VENTANA
echo ⚠️  El servidor se ejecuta aquí
echo.

node servidor-emergencia.js

echo.
echo ❌ El servidor se detuvo
pause
