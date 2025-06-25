@echo off
echo 🚀 Iniciando backend con datos reales...
echo.
echo 📂 Directorio: %CD%
echo 🔧 Controladores: Con fallback automatico (3 seg timeout)
echo 📊 Datos: 20 habitaciones mock realistas
echo.

set NODE_ENV=development
set PORT=2117

echo ✅ Variables configuradas:
echo    NODE_ENV=%NODE_ENV%
echo    PORT=%PORT%
echo.

echo 🌟 INICIANDO SERVIDOR...
npm start

pause
