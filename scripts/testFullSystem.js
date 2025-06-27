// scripts/testFullSystem.js
/**
 * Test completo del sistema hotelero
 * Verifica: Base de datos, APIs, autenticación, reservas
 */

import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 2117}/api`;
const ADMIN_EMAIL = 'admin@hotel.com';
const ADMIN_PASSWORD = 'admin123';

class SystemTester {
  constructor() {
    this.token = null;
    this.cookies = null;
  }

  async run() {
    console.log('🧪 Iniciando pruebas completas del sistema hotelero...\n');
    
    try {
      await this.testDatabase();
      await this.testHealthCheck();
      await this.testAuthentication();
      await this.testDashboardAPI();
      await this.testRoomsAPI();
      await this.testReservationsAPI();
      await this.testPublicReservation();
      
      console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
      console.log('🎉 El sistema está listo para producción');
      
    } catch (error) {
      console.error('\n❌ Error en las pruebas:', error.message);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
    }
  }

  async testDatabase() {
    console.log('📊 Probando conexión a base de datos...');
    
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Base de datos conectada correctamente');
      
      // Verificar colecciones principales
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      const requiredCollections = ['users', 'rooms', 'reservations'];
      for (const collection of requiredCollections) {
        if (collectionNames.includes(collection)) {
          console.log(`  ✅ Colección '${collection}' existe`);
        } else {
          console.log(`  ⚠️ Colección '${collection}' no encontrada`);
        }
      }
      
    } catch (error) {
      throw new Error(`Error de base de datos: ${error.message}`);
    }
  }

  async testHealthCheck() {
    console.log('\n🏥 Probando health check...');
    
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        console.log('✅ Health check pasó');
        console.log(`  📍 Servidor: ${data.server}`);
        console.log(`  🐙 Base de datos: ${data.database}`);
      } else {
        throw new Error('Health check falló');
      }
      
    } catch (error) {
      throw new Error(`Error en health check: ${error.message}`);
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Probando autenticación...');
    
    try {
      // Login
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.success) {
        console.log('✅ Login exitoso');
        
        // Extraer cookies para pruebas posteriores
        this.cookies = loginResponse.headers.get('set-cookie');
        this.token = loginData.token; // Backup token
        
        // Verificar /auth/me
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Cookie': this.cookies || '',
            'Authorization': `Bearer ${this.token || ''}`
          }
        });
        
        const meData = await meResponse.json();
        if (meResponse.ok && meData.success) {
          console.log(`✅ Usuario autenticado: ${meData.user.email}`);
        } else {
          throw new Error('Verificación de usuario falló');
        }
        
      } else {
        throw new Error(`Login falló: ${loginData.message}`);
      }
      
    } catch (error) {
      throw new Error(`Error de autenticación: ${error.message}`);
    }
  }

  async testDashboardAPI() {
    console.log('\n📊 Probando APIs del dashboard...');
    
    const endpoints = [
      '/dashboard/summary',
      '/dashboard/metrics',
      '/dashboard/stats',
      '/reports/general'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            'Cookie': this.cookies || '',
            'Authorization': `Bearer ${this.token || ''}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint} - OK (${Object.keys(data).length} campos)`);
        } else {
          console.log(`⚠️ ${endpoint} - ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }
  }

  async testRoomsAPI() {
    console.log('\n🏨 Probando API de habitaciones...');
    
    try {
      // Obtener habitaciones
      const roomsResponse = await fetch(`${API_URL}/rooms`, {
        headers: {
          'Cookie': this.cookies || '',
          'Authorization': `Bearer ${this.token || ''}`
        }
      });
      
      if (roomsResponse.ok) {
        const rooms = await roomsResponse.json();
        console.log(`✅ Habitaciones obtenidas: ${rooms.length} habitaciones`);
        
        // Verificar disponibilidad
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        
        const availableResponse = await fetch(
          `${API_URL}/rooms/available?checkIn=${today}&checkOut=${tomorrow}`
        );
        
        if (availableResponse.ok) {
          const available = await availableResponse.json();
          console.log(`✅ Habitaciones disponibles: ${available.length} habitaciones`);
        }
        
      } else {
        throw new Error('Error obteniendo habitaciones');
      }
      
    } catch (error) {
      throw new Error(`Error en API de habitaciones: ${error.message}`);
    }
  }

  async testReservationsAPI() {
    console.log('\n📅 Probando API de reservas...');
    
    try {
      // Obtener reservas
      const reservationsResponse = await fetch(`${API_URL}/reservations`, {
        headers: {
          'Cookie': this.cookies || '',
          'Authorization': `Bearer ${this.token || ''}`
        }
      });
      
      if (reservationsResponse.ok) {
        const reservations = await reservationsResponse.json();
        console.log(`✅ Reservas obtenidas: ${reservations.length} reservas`);
        
        // Verificar estados
        const states = reservations.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log('  📊 Estados de reservas:', states);
        
      } else {
        throw new Error('Error obteniendo reservas');
      }
      
    } catch (error) {
      throw new Error(`Error en API de reservas: ${error.message}`);
    }
  }

  async testPublicReservation() {
    console.log('\n🌐 Probando reserva pública...');
    
    try {
      const testReservation = {
        firstName: 'Test',
        lastName: 'Usuario',
        email: 'test@test.com',
        phone: '+1234567890',
        checkIn: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        guests: 2,
        notes: 'Reserva de prueba del sistema'
      };
      
      const response = await fetch(`${API_URL}/reservations/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testReservation)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Reserva pública creada exitosamente');
        console.log(`  📧 ID: ${data.reservation?._id || 'N/A'}`);
        
        // Limpiar la reserva de prueba
        if (data.reservation?._id) {
          await fetch(`${API_URL}/reservations/${data.reservation._id}`, {
            method: 'DELETE',
            headers: {
              'Cookie': this.cookies || '',
              'Authorization': `Bearer ${this.token || ''}`
            }
          });
          console.log('  🗑️ Reserva de prueba eliminada');
        }
        
      } else {
        throw new Error(`Error creando reserva pública: ${data.message}`);
      }
      
    } catch (error) {
      throw new Error(`Error en reserva pública: ${error.message}`);
    }
  }
}

// Ejecutar pruebas
const tester = new SystemTester();
tester.run();
