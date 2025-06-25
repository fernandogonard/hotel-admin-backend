#!/bin/bash
echo "🔄 Reiniciando backend con datos reales..."
echo "========================================"
echo ""

# Matar procesos node
echo "🔍 Buscando procesos de Node.js..."
if pgrep -f node > /dev/null; then
    echo "⚠️  Deteniendo procesos de Node.js anteriores..."
    pkill -f node
    sleep 3
    echo "✅ Procesos anteriores detenidos"
else
    echo "ℹ️  No se encontraron procesos de Node.js ejecutándose"
fi

# Ir al directorio
echo ""
echo "📂 Cambiando al directorio del backend..."
cd /c/Users/user/matydev/agustin/hotel-admin-backend

echo "📍 Directorio actual: $(pwd)"

# Verificar archivos de fallback
echo ""
echo "🔍 Verificando archivos de fallback..."
if [ -f "controllers/roomControllerWithFallback.js" ]; then
    echo "✅ roomControllerWithFallback.js"
else
    echo "❌ roomControllerWithFallback.js - FALTA"
fi

if [ -f "controllers/reportControllerWithFallback.js" ]; then
    echo "✅ reportControllerWithFallback.js"
else
    echo "❌ reportControllerWithFallback.js - FALTA"
fi

# Verificar puerto libre
echo ""
echo "🔍 Verificando puerto 2117..."
if netstat -ano | grep -q :2117; then
    echo "⚠️  Puerto 2117 en uso, liberando..."
    # En Windows con bash, usar netstat de Windows
    for pid in $(netstat -ano | grep :2117 | awk '{print $5}' | sort -u); do
        if [ "$pid" != "0" ]; then
            taskkill /F /PID $pid 2>/dev/null || true
        fi
    done
    sleep 2
fi

# Iniciar servidor
echo ""
echo "🚀 Iniciando servidor backend con datos reales..."
echo "   Puerto: 2117"
echo "   Fallback: MongoDB → Datos Mock Realistas"
echo ""

npm start

echo ""
echo "✅ Para verificar que funciona:"
echo "   1. Ve a http://localhost:2117/api/rooms"
echo "   2. Ve a http://localhost:2117/api/reports/general"
echo "   3. Ve a http://localhost:5174 (Frontend)"
echo ""
echo "📊 Deberías ver 20 habitaciones y estadísticas reales"
