@echo off
echo "🧪 ARRANQUE SERVIDOR DE PRUEBA - DATOS MOCK"
echo "=========================================="

cd /d "c:\Users\user\matydev\agustin\hotel-admin-backend"

echo "🧹 Limpiando procesos Node.js..."
taskkill /F /IM node.exe >nul 2>&1

echo "⏳ Esperando 2 segundos..."
timeout /t 2 /nobreak >nul

echo "🚀 Iniciando servidor de prueba (sin MongoDB)..."
echo "   Puerto: 2117"
echo "   Datos: Mock/Simulados"
echo ""

node test-server.js
