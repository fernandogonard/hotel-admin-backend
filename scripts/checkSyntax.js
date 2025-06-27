// scripts/checkSyntax.js - Verificación rápida de sintaxis
/**
 * ⚠️ SCRIPT DE VERIFICACIÓN: Verifica que no hay errores de sintaxis antes de iniciar
 */
import { spawn } from 'child_process';

console.log('🔍 VERIFICANDO SINTAXIS DEL PROYECTO...\n');

const checkFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const process = spawn('node', ['--check', filePath], { 
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true 
    });
    
    let stderr = '';
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${filePath} - Sintaxis correcta`);
        resolve();
      } else {
        console.log(`❌ ${filePath} - Error de sintaxis:`);
        console.log(stderr);
        reject(new Error(`Error en ${filePath}`));
      }
    });
  });
};

const filesToCheck = [
  'server.js',
  'middleware/validators-unified.js',
  'middleware/authMiddleware.js',
  'routes/users.js',
  'routes/authRoutes.js',
  'controllers/authController.js',
  'models/User.js',
  'models/Room.js',
  'models/Reservation.js'
];

async function checkAll() {
  try {
    console.log('Verificando archivos principales...\n');
    
    for (const file of filesToCheck) {
      await checkFile(file);
    }
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA - Todo parece estar en orden');
    console.log('🚀 Puedes intentar iniciar el servidor con: npm start');
    
  } catch (error) {
    console.log('\n❌ SE ENCONTRARON ERRORES - Revisar y corregir antes de continuar');
    process.exit(1);
  }
}

checkAll();
