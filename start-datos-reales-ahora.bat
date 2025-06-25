@echo off
echo "🔥 ARRANQUE FORZADO BACKEND - DATOS REALES"
echo "==========================================="

cd /d "c:\Users\user\matydev\agustin\hotel-admin-backend"

echo "🧹 Limpiando procesos Node.js..."
taskkill /F /IM node.exe >nul 2>&1

echo "⏳ Esperando 2 segundos..."
timeout /t 2 /nobreak >nul

echo "🔧 Configurando variables de entorno..."
set NODE_ENV=development
set PORT=2117
set USE_REAL_DATA=true
set DB_FALLBACK_TIMEOUT=3000
set MONGODB_URI=mongodb://localhost:27017/hotel_db

echo "📊 Variables configuradas:"
echo "  NODE_ENV = %NODE_ENV%"
echo "  PORT = %PORT%"
echo "  USE_REAL_DATA = %USE_REAL_DATA%"
echo "  DB_FALLBACK_TIMEOUT = %DB_FALLBACK_TIMEOUT%"
echo "  MONGODB_URI = %MONGODB_URI%"

echo ""
echo "🚀 Iniciando servidor con fallback automático..."
echo "   (Usará datos mock si MongoDB no responde en 3 segundos)"
echo ""

node server.js
