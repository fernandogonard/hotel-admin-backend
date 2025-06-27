// scripts/checkSyntaxOnly.js
/**
 * Script de verificación de sintaxis únicamente
 * No carga módulos para evitar errores de dependencias
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Verificando sintaxis de archivos JavaScript...\n');

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

let totalErrors = 0;

const checkSyntax = (filePath) => {
  return new Promise((resolve) => {
    const nodeProcess = spawn('node', ['-c', filePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';
    
    nodeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    nodeProcess.on('close', (code) => {
      resolve({ code, stderr });
    });
  });
};

const verifyFiles = async () => {
  for (const file of criticalFiles) {
    const filePath = path.join(projectRoot, file);
    
    if (fs.existsSync(filePath)) {
      process.stdout.write(`Verificando ${file}... `);
      
      const { code, stderr } = await checkSyntax(filePath);
      
      if (code === 0) {
        console.log('✅ OK');
      } else {
        console.log('❌ ERROR');
        console.error(`   ${stderr.trim()}`);
        totalErrors++;
      }
    } else {
      console.log(`⚠️  ${file} - No existe`);
    }
  }

  console.log('\n📊 RESUMEN');
  console.log('===================');
  
  if (totalErrors === 0) {
    console.log('🎉 Todos los archivos tienen sintaxis válida');
  } else {
    console.error(`❌ Se encontraron ${totalErrors} errores de sintaxis`);
  }
  
  return totalErrors === 0;
};

verifyFiles().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Error durante la verificación:', error);
  process.exit(1);
});
