// scripts/generateDeployGuide.js - Genera guía de deploy automática
/**
 * ⚠️ SCRIPT DE DEPLOY: Genera documentación automática para deploy en producción
 * Incluye configuraciones para Render, Railway, Netlify, Vercel
 */
import { writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('📖 GENERANDO GUÍA DE DEPLOY PARA PRODUCCIÓN...\n');

// Detectar información del proyecto
let packageInfo = {};
try {
  packageInfo = JSON.parse(readFileSync('./package.json', 'utf8'));
} catch (error) {
  console.warn('⚠️ No se pudo leer package.json');
}

const projectName = packageInfo.name || 'hotel-admin-backend';
const nodeVersion = process.version;

// Generar configuración .env para producción
const envProductionTemplate = `# .env.production - Configuración para producción
# ⚠️ IMPORTANTE: Cambia todos los valores por los reales de tu entorno

# === SERVIDOR ===
NODE_ENV=production
PORT=2117

# === BASE DE DATOS ===
# MongoDB Atlas o instancia propia
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/hotel-production?retryWrites=true&w=majority

# === SEGURIDAD ===
# Genera un nuevo JWT_SECRET fuerte: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=CAMBIAR_POR_SECRET_FUERTE_DE_64_CARACTERES_O_MAS
SESSION_SECRET=CAMBIAR_POR_SESSION_SECRET_FUERTE_DE_64_CARACTERES_O_MAS

# === COOKIES ===
COOKIE_DOMAIN=tu-dominio.com
COOKIE_SECURE=true

# === CORS ===
FRONTEND_URL=https://tu-frontend.netlify.app
FRONTEND_ADMIN_URL=https://tu-admin.netlify.app
CORS_ORIGIN=https://tu-frontend.netlify.app,https://tu-admin.netlify.app

# === RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# === OPCIONAL: SERVICIOS EXTERNOS ===
# EMAIL_SERVICE_API_KEY=tu-api-key-email
# CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# SENTRY_DSN=https://tu-sentry-dsn
`;

// Generar Dockerfile
const dockerfile = `# Dockerfile para backend de hotel
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="tu-email@ejemplo.com"
LABEL description="Backend del sistema de gestión hotelera"

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar ownership de archivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 2117

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node scripts/healthCheck.js || exit 1

# Comando de inicio
CMD ["npm", "start"]
`;

// Generar docker-compose.yml
const dockerCompose = `version: '3.8'

services:
  # Backend de gestión hotelera
  hotel-backend:
    build: .
    ports:
      - "2117:2117"
    environment:
      - NODE_ENV=production
      - PORT=2117
    env_file:
      - .env.production
    restart: unless-stopped
    depends_on:
      - mongodb
    networks:
      - hotel-network

  # Base de datos MongoDB (opcional si usas Atlas)
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password123
      - MONGO_INITDB_DATABASE=hotel-production
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped
    networks:
      - hotel-network

  # Nginx proxy (opcional)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - hotel-backend
    restart: unless-stopped
    networks:
      - hotel-network

volumes:
  mongodb_data:

networks:
  hotel-network:
    driver: bridge
`;

// Generar configuración para Render
const renderYaml = `# render.yaml - Configuración para Render.com
services:
  - type: web
    name: ${projectName}
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 2117
      - key: MONGO_URI
        fromDatabase:
          name: hotel-mongodb
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: SESSION_SECRET
        generateValue: true
      - key: COOKIE_SECURE
        value: true
    healthCheckPath: /api/health

databases:
  - name: hotel-mongodb
    plan: starter
`;

// Generar script de deploy
const deployScript = `#!/bin/bash
# deploy.sh - Script de deploy automático

set -e  # Salir si cualquier comando falla

echo "🚀 INICIANDO DEPLOY EN PRODUCCIÓN..."

# 1. Verificar que estamos en la rama correcta
echo "📋 Verificando rama git..."
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "production" ]; then
  echo "⚠️ No estás en rama main/production. Rama actual: $BRANCH"
  read -p "¿Continuar? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 2. Ejecutar tests antes del deploy
echo "🧪 Ejecutando tests de producción..."
npm run test:production || {
  echo "❌ Tests fallaron. Deploy cancelado."
  exit 1
}

# 3. Build del proyecto
echo "🏗️ Building proyecto..."
npm run build || {
  echo "❌ Build falló. Deploy cancelado."
  exit 1
}

# 4. Deploy según plataforma
echo "🌐 Selecciona plataforma de deploy:"
echo "1) Render"
echo "2) Railway"
echo "3) Docker"
echo "4) Manual"
read -p "Opción (1-4): " PLATFORM

case $PLATFORM in
  1)
    echo "🚀 Deploying a Render..."
    git push origin main
    echo "✅ Push a Render completado. Verifica en dashboard."
    ;;
  2)
    echo "🚀 Deploying a Railway..."
    railway up
    echo "✅ Deploy a Railway completado."
    ;;
  3)
    echo "🐳 Building Docker image..."
    docker build -t ${projectName}:latest .
    echo "✅ Docker image creada. Para deploy: docker run -p 2117:2117 ${projectName}:latest"
    ;;
  4)
    echo "📦 Deploy manual preparado. Archivos listos en ./dist/"
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

echo "✅ Deploy completado!"
echo "🔗 No olvides configurar:"
echo "   - Variables de entorno"
echo "   - Dominio personalizado" 
echo "   - Certificados SSL"
echo "   - Monitoreo"
`;

// Generar guía README para deploy
const deployReadme = `# 🚀 GUÍA DE DEPLOY PARA PRODUCCIÓN

## 📋 PRE-REQUISITOS

### 1. Verificación del Sistema
\`\`\`bash
npm run test:production
\`\`\`

### 2. Variables de Entorno
Copia \`.env.production.template\` a \`.env.production\` y configura:
- ✅ MONGO_URI (MongoDB Atlas recomendado)
- ✅ JWT_SECRET (64+ caracteres)
- ✅ SESSION_SECRET (64+ caracteres)  
- ✅ FRONTEND_URL (dominio del frontend)
- ✅ CORS_ORIGIN (dominios permitidos)

## 🌐 OPCIONES DE DEPLOY

### 🔥 Opción 1: Render (RECOMENDADO)

1. **Crear cuenta en [Render.com](https://render.com)**
2. **Conectar repositorio GitHub**
3. **Crear Web Service:**
   - Build Command: \`npm install\`
   - Start Command: \`npm start\`
   - Port: \`2117\`
4. **Configurar variables de entorno** en el dashboard
5. **Configurar base de datos MongoDB:**
   - Usar MongoDB Atlas (externo) ⭐ RECOMENDADO
   - O crear PostgreSQL en Render y migrar

**⚡ Auto-deploy:** Push a main = deploy automático

### 🚄 Opción 2: Railway

1. **Instalar Railway CLI:**
   \`\`\`bash
   npm install -g @railway/cli
   railway login
   \`\`\`
2. **Deploy:**
   \`\`\`bash
   railway up
   \`\`\`
3. **Configurar variables** en dashboard Railway

### 🐳 Opción 3: Docker

1. **Build image:**
   \`\`\`bash
   docker build -t hotel-backend .
   \`\`\`
2. **Correr localmente:**
   \`\`\`bash
   docker run -p 2117:2117 --env-file .env.production hotel-backend
   \`\`\`
3. **Deploy a registry:**
   \`\`\`bash
   docker tag hotel-backend tu-registry/hotel-backend
   docker push tu-registry/hotel-backend
   \`\`\`

### ☁️ Opción 4: VPS Manual

1. **Subir archivos al servidor**
2. **Instalar Node.js ${nodeVersion}+**
3. **Instalar PM2:**
   \`\`\`bash
   npm install -g pm2
   pm2 start server.js --name hotel-backend
   pm2 startup
   pm2 save
   \`\`\`

## 🛡️ CONFIGURACIÓN DE SEGURIDAD

### SSL/TLS
- ✅ Certificado SSL (Let's Encrypt gratis)
- ✅ HTTPS obligatorio (\`COOKIE_SECURE=true\`)
- ✅ HSTS headers activados

### Base de Datos
- ✅ MongoDB Atlas con autenticación
- ✅ IP whitelisting configurado
- ✅ Backup automático activado

### Monitoreo
- ✅ Health check: \`GET /api/health\`
- ✅ Logs centralizados
- ✅ Alertas de error

## 🎯 DEPLOY DE FRONTEND

### Frontend Admin (\`hotel-admin-frontend\`)
1. **Build:**
   \`\`\`bash
   cd ../hotel-admin-frontend
   npm run build
   \`\`\`
2. **Deploy a Netlify/Vercel:**
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`
   - Environment: \`VITE_API_URL=https://tu-backend.render.com/api\`

### Frontend Público (\`diva-web\`)
1. **Build:**
   \`\`\`bash
   cd ../diva-web  
   npm run build
   \`\`\`
2. **Deploy a Netlify/Vercel:**
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`
   - Environment: \`VITE_API_URL=https://tu-backend.render.com/api\`

## ✅ CHECKLIST POST-DEPLOY

- [ ] ✅ Backend responde en /api/health
- [ ] ✅ Login de admin funciona
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ Frontend se conecta al backend
- [ ] ✅ Base de datos tiene datos de prueba
- [ ] ✅ Certificado SSL válido
- [ ] ✅ Dominio personalizado configurado
- [ ] ✅ Backups configurados
- [ ] ✅ Monitoreo activo

## 🚨 SOLUCIÓN DE PROBLEMAS

### Backend no inicia
\`\`\`bash
# Verificar logs
npm run logs

# Verificar variables de entorno
npm run env:check

# Test de conexión a DB
npm run test:db
\`\`\`

### Error de CORS
- Verificar \`CORS_ORIGIN\` incluye URL del frontend
- Verificar \`FRONTEND_URL\` es correcto

### Error de autenticación
- Verificar \`JWT_SECRET\` configurado
- Verificar cookies \`httpOnly\` habilitadas

## 📞 SOPORTE

- 📧 Email: tu-email@ejemplo.com
- 📚 Documentación: \`/docs\`
- 🐛 Issues: GitHub Issues
- 💬 Chat: Crear issue en GitHub

---
⚡ **Deploy automatizado con:** \`npm run deploy\`
`;

// Escribir todos los archivos
try {
  writeFileSync('.env.production.template', envProductionTemplate);
  writeFileSync('Dockerfile', dockerfile);
  writeFileSync('docker-compose.yml', dockerCompose);
  writeFileSync('render.yaml', renderYaml);
  writeFileSync('deploy.sh', deployScript);
  writeFileSync('DEPLOY_GUIDE.md', deployReadme);
  
  // Hacer deploy.sh ejecutable
  try {
    execSync('chmod +x deploy.sh');
  } catch (error) {
    console.warn('⚠️ No se pudo hacer deploy.sh ejecutable (normal en Windows)');
  }
  
  console.log('✅ Archivos de deploy generados:');
  console.log('   📄 .env.production.template - Template de variables de entorno');
  console.log('   🐳 Dockerfile - Configuración Docker');
  console.log('   🐳 docker-compose.yml - Stack completo Docker');
  console.log('   🎯 render.yaml - Configuración Render');
  console.log('   🚀 deploy.sh - Script de deploy automático');
  console.log('   📖 DEPLOY_GUIDE.md - Guía completa de deploy');
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Configurar .env.production con valores reales');
  console.log('2. Elegir plataforma de deploy (Render recomendado)');
  console.log('3. Ejecutar: npm run test:production');
  console.log('4. Ejecutar: ./deploy.sh');
  console.log('5. Configurar dominio y SSL');
  
} catch (error) {
  console.error('❌ Error generando archivos de deploy:', error.message);
  process.exit(1);
}

console.log('\n🎉 ¡GUÍA DE DEPLOY GENERADA EXITOSAMENTE!');
