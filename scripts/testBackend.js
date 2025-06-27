// scripts/testBackend.js - Script para probar las APIs del backend
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Solo usar fetch si está disponible
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (err) {
  console.log('⚠️ node-fetch no disponible, usando método alternativo');
}

const BASE_URL = 'http://localhost:2117';

// Función de delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test básico sin dependencias externas
async function testBasicConnection() {
  console.log('🔍 1. Probando conexión básica...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Backend corriendo:', data.status);
    return true;
  } catch (error) {
    console.log('❌ Backend no disponible:', error.message);
    return false;
  }
}

async function testDashboardEndpoints() {
  console.log('\n🔍 2. Probando endpoints del dashboard...');
  
  const endpoints = [
    '/api/dashboard/summary',
    '/api/dashboard/stats',
    '/api/dashboard/occupancy',
    '/api/dashboard/activity',
    '/api/dashboard/trend'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   📡 Probando ${endpoint}...`);
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (response.status === 401) {
        console.log('   🔐 Requiere autenticación (esperado)');
      } else if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint}: ${data.success ? 'OK' : 'Error'}`);
      } else {
        console.log(`   ⚠️ ${endpoint}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
    
    await delay(100); // Evitar rate limiting
  }
}

async function testAuthFlow() {
  console.log('\n🔍 3. Probando flujo de autenticación...');
  
  try {
    // Test login
    console.log('   📡 Probando login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@hotel.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Login exitoso:', loginData.success);
      
      // Extraer token o cookies
      const token = loginData.token;
      const cookies = loginResponse.headers.get('set-cookie');
      
      if (token || cookies) {
        console.log('   🍪 Autenticación disponible');
        
        // Test endpoint protegido
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        if (cookies) {
          headers['Cookie'] = cookies;
        }
        
        const protectedResponse = await fetch(`${BASE_URL}/api/dashboard/summary`, {
          headers
        });
        
        if (protectedResponse.ok) {
          const dashboardData = await protectedResponse.json();
          console.log('   ✅ Dashboard accesible:', dashboardData.success);
        } else {
          console.log('   ⚠️ Dashboard no accesible:', protectedResponse.status);
        }
      }
    } else {
      console.log('   ⚠️ Login falló:', loginResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Error en auth flow:', error.message);
  }
}

async function testDatabaseContent() {
  console.log('\n🔍 4. Probando contenido de la base de datos...');
  
  const publicEndpoints = [
    '/api/rooms',
    '/api/health'
  ];
  
  for (const endpoint of publicEndpoints) {
    try {
      console.log(`   📡 Probando ${endpoint}...`);
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint}: Datos disponibles`);
        
        if (Array.isArray(data)) {
          console.log(`   📊 Encontrados ${data.length} elementos`);
        } else if (data.data && Array.isArray(data.data)) {
          console.log(`   📊 Encontrados ${data.data.length} elementos`);
        }
      } else {
        console.log(`   ⚠️ ${endpoint}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
    
    await delay(100);
  }
}

// Función principal
async function runTests() {
  console.log('🧪 Iniciando pruebas del backend...\n');
  
  if (!fetch) {
    console.log('❌ No se puede ejecutar el test: fetch no disponible');
    console.log('💡 Para pruebas completas, instalar: npm install node-fetch');
    return;
  }
  
  const isConnected = await testBasicConnection();
  
  if (isConnected) {
    await testDashboardEndpoints();
    await testAuthFlow();
    await testDatabaseContent();
  } else {
    console.log('\n💡 Para iniciar el backend:');
    console.log('   cd hotel-admin-backend');
    console.log('   npm start');
    console.log('   o ejecutar: start-datos-reales-ahora.bat');
  }
  
  console.log('\n🏁 Pruebas completadas');
}

// Solo ejecutar si está disponible fetch
if (fetch) {
  runTests().catch(console.error);
} else {
  console.log('⚠️ Usando método básico de testing...');
  console.log('🔍 Verificando configuración del backend...');
  
  // Test básico sin fetch
  import('./checkDatabase.js').then(() => {
    console.log('✅ Base de datos verificada');
    console.log('💡 Para pruebas de API completas, instalar node-fetch');
  }).catch(err => {
    console.error('❌ Error verificando base de datos:', err.message);
  });
}
