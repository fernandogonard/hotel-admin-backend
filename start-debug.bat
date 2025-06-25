@echo off
echo "🚀 Iniciando backend en modo debug..."
cd /d "c:\Users\user\matydev\agustin\hotel-admin-backend"
set NODE_ENV=development
set PORT=2117
set USE_REAL_DATA=true
set DB_FALLBACK_TIMEOUT=3000
echo "Variables configuradas:"
echo "NODE_ENV=%NODE_ENV%"
echo "PORT=%PORT%"
echo "USE_REAL_DATA=%USE_REAL_DATA%"
echo "DB_FALLBACK_TIMEOUT=%DB_FALLBACK_TIMEOUT%"
echo "Iniciando servidor..."
node server.js
pause
