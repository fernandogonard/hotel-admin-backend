// scripts/testConnection.js
import fetch from 'node-fetch';

console.log('🔍 Verificando conectividad Backend-Frontend...\n');

// Test 1: Verificar endpoint de test
async function testBackendHealth() {
  try {
    console.log('1️⃣ Testeando endpoint de salud...');
    const response = await fetch('http://localhost:2117/api/test');
    const data = await response.json();
    console.log('✅ Backend respondiendo:', data);
    return true;
  } catch (error) {
    console.log('❌ Backend no disponible:', error.message);
    return false;
  }
}

// Test 2: Verificar endpoint de rooms
async function testRoomsEndpoint() {
  try {
    console.log('\n2️⃣ Testeando endpoint de habitaciones...');
    const response = await fetch('http://localhost:2117/api/rooms');
    const data = await response.json();
    console.log('✅ Habitaciones disponibles:', data.length || 'N/A');
    return true;
  } catch (error) {
    console.log('❌ Error en endpoint de habitaciones:', error.message);
    return false;
  }
}

// Test 3: Verificar endpoint de reservas
async function testReservationsEndpoint() {
  try {
    console.log('\n3️⃣ Testeando endpoint de reservas...');
    const response = await fetch('http://localhost:2117/api/reservations');
    const data = await response.json();
    console.log('✅ Reservas disponibles:', data.length || 'N/A');
    return true;
  } catch (error) {
    console.log('❌ Error en endpoint de reservas:', error.message);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE CONECTIVIDAD\n');
  
  const test1 = await testBackendHealth();
  const test2 = await testRoomsEndpoint();
  const test3 = await testReservationsEndpoint();
  
  console.log('\n📊 RESUMEN:');
  console.log(`Health check: ${test1 ? '✅' : '❌'}`);
  console.log(`Rooms endpoint: ${test2 ? '✅' : '❌'}`);
  console.log(`Reservations endpoint: ${test3 ? '✅' : '❌'}`);
  
  if (test1 && test2 && test3) {
    console.log('\n🎉 ¡Todos los endpoints funcionando correctamente!');
    console.log('El problema puede estar en:');
    console.log('- Frontend no iniciado en puerto 5174');
    console.log('- Archivo .env del frontend no cargado');
    console.log('- Autenticación requerida en endpoints');
  } else {
    console.log('\n⚠️  Hay problemas con el backend:');
    console.log('- Verificar que el servidor esté iniciado: npm start');
    console.log('- Verificar MongoDB esté corriendo');
    console.log('- Revisar logs de errores en backend');
  }
}

runAllTests();
