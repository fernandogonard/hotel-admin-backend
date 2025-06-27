// scripts/verifySystemIntegrity.js
/**
 * Script de verificación de integridad del sistema
 * Verifica que todos los módulos se puedan cargar correctamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Iniciando verificación de integridad del sistema...\n');

// Lista de archivos críticos a verificar
const criticalFiles = [
  'server.js',
  'config/db.js',
  'config/security.js',
  'middleware/authMiddleware.js',
  'middleware/validateRequest.js',
  'middleware/validators-unified.js',
  'controllers/authController.js',
  'controllers/dashboardController.js',
  'routes/authRoutes.js',
  'routes/dashboard.js',
  'services/dashboardService.js',
  'models/User.js',
  'models/Room.js',
  'models/Reservation.js'
];

let errors = 0;
let warnings = 0;

console.log('📋 Verificando archivos críticos...');

for (const file of criticalFiles) {
  const filePath = path.join(projectRoot, file);
  
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - Existe`);
      
      // Verificar sintaxis básica
      try {
        await import(`file://${filePath}`);
        console.log(`✅ ${file} - Sintaxis válida`);
      } catch (syntaxError) {
        console.error(`❌ ${file} - Error de sintaxis:`, syntaxError.message);
        errors++;
      }
    } else {
      console.error(`❌ ${file} - No existe`);
      errors++;
    }
  } catch (error) {
    console.error(`❌ ${file} - Error al verificar:`, error.message);
    errors++;
  }
}

console.log('\n📦 Verificando package.json...');

try {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Verificar dependencias críticas
  const requiredDeps = [
    'express', 'mongoose', 'jsonwebtoken', 'bcrypt', 
    'cors', 'helmet', 'express-rate-limit', 'joi'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length === 0) {
    console.log('✅ Todas las dependencias críticas están presentes');
  } else {
    console.error('❌ Dependencias faltantes:', missingDeps);
    errors++;
  }
  
} catch (error) {
  console.error('❌ Error al verificar package.json:', error.message);
  errors++;
}

console.log('\n🔧 Verificando variables de entorno...');

try {
  const envExamplePath = path.join(projectRoot, '.env.example');
  const envPath = path.join(projectRoot, '.env');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('✅ .env.example existe');
  } else {
    console.warn('⚠️  .env.example no existe');
    warnings++;
  }
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env existe');
  } else {
    console.warn('⚠️  .env no existe - crear basado en .env.example');
    warnings++;
  }
  
} catch (error) {
  console.error('❌ Error al verificar archivos de entorno:', error.message);
  errors++;
}

// Resumen final
console.log('\n📊 RESUMEN DE VERIFICACIÓN');
console.log('=====================================');

if (errors === 0 && warnings === 0) {
  console.log('🎉 ¡SISTEMA ÍNTEGRO! Todos los componentes están funcionando correctamente.');
} else {
  if (errors > 0) {
    console.error(`❌ Errores críticos encontrados: ${errors}`);
  }
  if (warnings > 0) {
    console.warn(`⚠️  Advertencias encontradas: ${warnings}`);
  }
}

console.log('\n✨ Verificación completada');

// Salir con código de error si hay problemas críticos
if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
