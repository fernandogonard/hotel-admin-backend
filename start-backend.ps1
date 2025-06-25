# Script PowerShell para arrancar backend con datos reales
# Guardar como start-backend.ps1 y ejecutar con: powershell -ExecutionPolicy Bypass .\start-backend.ps1

Write-Host "🚀 ARRANQUE BACKEND HOTEL - DATOS REALES" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Cambiar al directorio del backend
Set-Location "c:\Users\user\matydev\agustin\hotel-admin-backend"

Write-Host "🧹 Limpiando procesos Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "⏳ Esperando 2 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Cyan
$env:NODE_ENV = "development"
$env:PORT = "2117"
$env:USE_REAL_DATA = "true"
$env:DB_FALLBACK_TIMEOUT = "3000"
$env:MONGODB_URI = "mongodb://localhost:27017/hotel_db"

Write-Host "📊 Variables configuradas:" -ForegroundColor Cyan
Write-Host "  NODE_ENV = $env:NODE_ENV"
Write-Host "  PORT = $env:PORT"
Write-Host "  USE_REAL_DATA = $env:USE_REAL_DATA"
Write-Host "  DB_FALLBACK_TIMEOUT = $env:DB_FALLBACK_TIMEOUT"
Write-Host "  MONGODB_URI = $env:MONGODB_URI"

Write-Host ""
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
Write-Host "   (Usará datos mock si MongoDB no responde)" -ForegroundColor Gray
Write-Host ""

# Ejecutar el servidor
node server.js
