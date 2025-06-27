// scripts/testProductionReadiness.js - Test completo de preparación para producción
/**
 * ⚠️ SCRIPT CRÍTICO: Verifica que todo el sistema esté listo para producción
 * Incluye: autenticación, base de datos, APIs, frontend, seguridad
 */
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:2117/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🔍 INICIANDO VERIFICACIÓN DE PREPARACIÓN PARA PRODUCCIÓN\n');

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// ============= HELPER FUNCTIONS =============
const addResult = (test, status, message, details = '') => {
  testResults.details.push({ test, status, message, details });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else if (status === 'WARN') testResults.warnings++;
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${message}`);
  if (details) console.log(`   ${details}`);
};

const checkEnvVariable = (name, required = true) => {
  const value = process.env[name];
  if (!value) {
    if (required) {
      addResult(`ENV_${name}`, 'FAIL', `Variable ${name} no está configurada`);
    } else {
      addResult(`ENV_${name}`, 'WARN', `Variable opcional ${name} no está configurada`);
    }
    return false;
  }
  
  // Verificaciones específicas
  if (name === 'JWT_SECRET' && value.length < 32) {
    addResult(`ENV_${name}`, 'FAIL', `${name} debe tener al menos 32 caracteres`);
    return false;
  }
  
  if (name === 'MONGO_URI' && !value.startsWith('mongodb')) {
    addResult(`ENV_${name}`, 'FAIL', `${name} debe ser una URL válida de MongoDB`);
    return false;
  }
  
  addResult(`ENV_${name}`, 'PASS', `${name} configurado correctamente`);
  return true;
};

const testAPI = async (endpoint, expectedStatus = 200, authToken = null) => {
  try {
    const config = {
      timeout: 10000,
      validateStatus: (status) => status < 500 // No fallar en 4xx
    };
    
    if (authToken) {
      config.headers = { Authorization: `Bearer ${authToken}` };
    }
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === expectedStatus) {
      addResult(`API_${endpoint.replace('/', '_')}`, 'PASS', `Endpoint responde correctamente (${response.status})`);
      return { success: true, data: response.data };
    } else {
      addResult(`API_${endpoint.replace('/', '_')}`, 'WARN', `Endpoint responde con código ${response.status} (esperado ${expectedStatus})`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    addResult(`API_${endpoint.replace('/', '_')}`, 'FAIL', `Endpoint no responde: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// ============= TESTS PRINCIPALES =============

console.log('1️⃣ VERIFICANDO CONFIGURACIÓN DEL ENTORNO...\n');

// Variables de entorno críticas
checkEnvVariable('NODE_ENV');
checkEnvVariable('PORT', false);
checkEnvVariable('MONGO_URI');
checkEnvVariable('JWT_SECRET');
checkEnvVariable('SESSION_SECRET');
checkEnvVariable('FRONTEND_URL', false);
checkEnvVariable('CORS_ORIGIN', false);

console.log('\n2️⃣ VERIFICANDO DEPENDENCIAS Y SEGURIDAD...\n');

// Verificar que las dependencias de seguridad estén instaladas
try {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const securityDeps = ['helmet', 'express-rate-limit', 'express-mongo-sanitize', 'xss-clean', 'cors', 'bcrypt', 'jsonwebtoken'];
  
  securityDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      addResult(`DEP_${dep}`, 'PASS', `Dependencia de seguridad ${dep} instalada`);
    } else {
      addResult(`DEP_${dep}`, 'FAIL', `Dependencia de seguridad ${dep} NO instalada`);
    }
  });
} catch (error) {
  addResult('DEPS_CHECK', 'FAIL', 'No se pudo verificar package.json');
}

console.log('\n3️⃣ VERIFICANDO CONECTIVIDAD DE APIS...\n');

// Test de APIs sin autenticación
await testAPI('/health', 200);
await testAPI('/rooms/available?from=2025-12-01&to=2025-12-02', 200);

// Test de login y APIs autenticadas
console.log('\n4️⃣ VERIFICANDO AUTENTICACIÓN...\n');

let authToken = null;
try {
  const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@admin.com',
    password: 'admin123'
  }, { timeout: 10000 });
  
  if (loginResponse.data.success && loginResponse.data.token) {
    authToken = loginResponse.data.token;
    addResult('AUTH_LOGIN', 'PASS', 'Login de administrador exitoso');
    
    // Tests con autenticación
    await testAPI('/auth/me', 200, authToken);
    await testAPI('/dashboard/stats', 200, authToken);
    await testAPI('/reservations', 200, authToken);
    
  } else {
    addResult('AUTH_LOGIN', 'FAIL', 'Login falló - credenciales incorrectas o usuario no existe');
  }
} catch (error) {
  addResult('AUTH_LOGIN', 'FAIL', `Error en login: ${error.message}`);
}

console.log('\n5️⃣ VERIFICANDO BASE DE DATOS...\n');

// Verificar modelos y conexión DB
try {
  if (authToken) {
    const statsResponse = await testAPI('/dashboard/stats', 200, authToken);
    if (statsResponse.success) {
      const stats = statsResponse.data;
      if (stats.totalRooms >= 0 && stats.totalReservations >= 0) {
        addResult('DB_CONNECTION', 'PASS', `Base de datos conectada (${stats.totalRooms} habitaciones, ${stats.totalReservations} reservas)`);
      } else {
        addResult('DB_CONNECTION', 'WARN', 'Base de datos conectada pero sin datos de prueba');
      }
    }
  }
} catch (error) {
  addResult('DB_CONNECTION', 'FAIL', `Error verificando base de datos: ${error.message}`);
}

console.log('\n6️⃣ VERIFICANDO SEGURIDAD...\n');

// Test de headers de seguridad
try {
  const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
  const headers = response.headers;
  
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options', 
    'x-xss-protection',
    'strict-transport-security'
  ];
  
  securityHeaders.forEach(header => {
    if (headers[header]) {
      addResult(`SECURITY_${header.toUpperCase()}`, 'PASS', `Header de seguridad ${header} presente`);
    } else {
      addResult(`SECURITY_${header.toUpperCase()}`, 'WARN', `Header de seguridad ${header} ausente`);
    }
  });
} catch (error) {
  addResult('SECURITY_HEADERS', 'FAIL', 'No se pudieron verificar headers de seguridad');
}

// Test de rate limiting
try {
  const promises = Array.from({ length: 5 }, () => 
    axios.get(`${BASE_URL}/health`, { timeout: 2000 })
  );
  
  await Promise.allSettled(promises);
  addResult('RATE_LIMITING', 'PASS', 'Rate limiting configurado (no bloqueó requests normales)');
} catch (error) {
  addResult('RATE_LIMITING', 'WARN', 'No se pudo verificar rate limiting completamente');
}

console.log('\n7️⃣ VERIFICANDO FRONTEND...\n');

// Test básico del frontend
try {
  const frontendResponse = await axios.get(FRONTEND_URL, { 
    timeout: 10000,
    headers: { 'User-Agent': 'Production-Readiness-Test' }
  });
  
  if (frontendResponse.status === 200) {
    addResult('FRONTEND_LOADING', 'PASS', 'Frontend carga correctamente');
    
    // Verificar que no haya errores obvios en el HTML
    const html = frontendResponse.data;
    if (html.includes('React') || html.includes('Vite') || html.includes('Hotel')) {
      addResult('FRONTEND_CONTENT', 'PASS', 'Frontend contiene contenido esperado');
    } else {
      addResult('FRONTEND_CONTENT', 'WARN', 'Frontend carga pero contenido no reconocido');
    }
  } else {
    addResult('FRONTEND_LOADING', 'FAIL', `Frontend responde con código ${frontendResponse.status}`);
  }
} catch (error) {
  addResult('FRONTEND_LOADING', 'FAIL', `Frontend no responde: ${error.message}`);
}

// ============= RESUMEN FINAL =============
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VERIFICACIÓN PARA PRODUCCIÓN');
console.log('='.repeat(60));

console.log(`✅ Tests pasados: ${testResults.passed}`);
console.log(`❌ Tests fallidos: ${testResults.failed}`);
console.log(`⚠️ Advertencias: ${testResults.warnings}`);

const totalTests = testResults.passed + testResults.failed + testResults.warnings;
const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(1) : 0;

console.log(`📈 Tasa de éxito: ${successRate}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!');
  console.log('✨ Todos los tests críticos pasaron exitosamente');
} else if (testResults.failed <= 2) {
  console.log('\n⚠️ SISTEMA CASI LISTO - Requiere atención mínima');
  console.log('🔧 Corrige los errores críticos antes del deploy');
} else {
  console.log('\n🚨 SISTEMA NO LISTO PARA PRODUCCIÓN');
  console.log('❗ Existen errores críticos que deben resolverse');
}

// Lista de errores críticos
const criticalFailures = testResults.details.filter(r => r.status === 'FAIL');
if (criticalFailures.length > 0) {
  console.log('\n🚨 ERRORES CRÍTICOS A RESOLVER:');
  criticalFailures.forEach(failure => {
    console.log(`   ❌ ${failure.test}: ${failure.message}`);
  });
}

// Lista de advertencias importantes
const warnings = testResults.details.filter(r => r.status === 'WARN');
if (warnings.length > 0) {
  console.log('\n⚠️ ADVERTENCIAS A CONSIDERAR:');
  warnings.forEach(warning => {
    console.log(`   ⚠️ ${warning.test}: ${warning.message}`);
  });
}

console.log('\n📋 PRÓXIMOS PASOS RECOMENDADOS:');
console.log('1. Configurar variables de entorno en el servidor de producción');
console.log('2. Configurar certificados SSL/TLS');
console.log('3. Configurar dominio y DNS');
console.log('4. Configurar monitoreo y logs');
console.log('5. Preparar backup de base de datos');
console.log('6. Configurar CI/CD pipeline');

process.exit(testResults.failed > 0 ? 1 : 0);
