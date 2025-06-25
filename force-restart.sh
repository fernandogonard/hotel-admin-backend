#!/bin/bash

echo "🚨 FORZAR REINICIO COMPLETO DEL BACKEND"
echo "======================================"
echo ""

# 1. Matar TODOS los procesos de Node.js de forma agresiva
echo "🔥 Matando todos los procesos de Node.js..."
pkill -9 -f node 2>/dev/null || true
pkill -9 -f npm 2>/dev/null || true

# 2. Esperar para asegurar que se liberan todos los recursos
echo "⏳ Esperando 5 segundos para liberar recursos..."
sleep 5

# 3. Verificar que el puerto 2117 esté libre
echo "🔍 Verificando puerto 2117..."
if netstat -ano | grep -q ":2117"; then
    echo "⚠️  Puerto 2117 aún ocupado, forzando liberación..."
    # Buscar PID específico y matarlo
    PID=$(netstat -ano | grep ":2117" | awk '{print $5}' | head -1)
    if [ "$PID" != "0" ] && [ -n "$PID" ]; then
        echo "🔥 Matando proceso PID: $PID"
        taskkill //F //PID $PID 2>/dev/null || true
    fi
    sleep 3
fi

# 4. Ir al directorio del backend
echo "📂 Cambiando al directorio del backend..."
cd /c/Users/user/matydev/agustin/hotel-admin-backend || {
    echo "❌ Error: No se pudo acceder al directorio del backend"
    exit 1
}

echo "📍 Directorio actual: $(pwd)"

# 5. Verificar archivos críticos
echo ""
echo "🔍 Verificando archivos críticos..."
FILES_OK=true

if [ ! -f "controllers/roomControllerWithFallback.js" ]; then
    echo "❌ FALTA: roomControllerWithFallback.js"
    FILES_OK=false
else
    echo "✅ roomControllerWithFallback.js"
fi

if [ ! -f "controllers/reportControllerWithFallback.js" ]; then
    echo "❌ FALTA: reportControllerWithFallback.js"
    FILES_OK=false
else
    echo "✅ reportControllerWithFallback.js"
fi

if [ ! -f "routes/rooms.js" ]; then
    echo "❌ FALTA: routes/rooms.js"
    FILES_OK=false
else
    echo "✅ routes/rooms.js"
    # Verificar que usa el controlador correcto
    if grep -q "roomControllerWithFallback" routes/rooms.js; then
        echo "   ✅ Configurado para usar fallback"
    else
        echo "   ❌ NO configurado para usar fallback"
        FILES_OK=false
    fi
fi

if [ ! -f "routes/reports.js" ]; then
    echo "❌ FALTA: routes/reports.js"
    FILES_OK=false
else
    echo "✅ routes/reports.js"
    # Verificar que usa el controlador correcto
    if grep -q "reportControllerWithFallback" routes/reports.js; then
        echo "   ✅ Configurado para usar fallback"
    else
        echo "   ❌ NO configurado para usar fallback"
        FILES_OK=false
    fi
fi

if [ "$FILES_OK" = false ]; then
    echo ""
    echo "❌ PROBLEMA: Archivos faltantes o mal configurados"
    echo "   Revisa que los archivos de fallback existan y las rutas estén actualizadas"
    exit 1
fi

# 6. Limpiar cache de npm (por si acaso)
echo ""
echo "🧹 Limpiando cache de npm..."
npm cache clean --force 2>/dev/null || true

# 7. Verificar package.json
echo ""
echo "📦 Verificando package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json no encontrado"
    exit 1
fi

# 8. Iniciar el servidor con logging extendido
echo ""
echo "🚀 INICIANDO SERVIDOR CON DATOS REALES..."
echo "   Puerto: 2117"
echo "   Controladores: Con fallback automático"
echo "   MongoDB: No requerido (usará datos mock)"
echo ""
echo "📊 Esperado:"
echo "   • 20 habitaciones reales"
echo "   • Respuesta en máximo 3 segundos"
echo "   • Estadísticas coherentes"
echo ""

# Iniciar con variables de entorno explícitas
NODE_ENV=development PORT=2117 npm start

echo ""
echo "🔍 Para verificar que funciona:"
echo "   1. Abre: http://localhost:2117/api/rooms"
echo "   2. Abre: http://localhost:2117/api/reports/general"
echo "   3. Refresca: http://localhost:5174"
