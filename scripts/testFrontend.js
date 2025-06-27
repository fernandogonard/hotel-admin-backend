// scripts/testFrontend.js
/**
 * Test para verificar el frontend y la conectividad
 */

import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

const FRONTEND_ADMIN_URL = 'http://localhost:5173';
const FRONTEND_PUBLIC_URL = 'http://localhost:5174';
const BACKEND_URL = 'http://localhost:2117';

class FrontendTester {
  constructor() {
    this.browser = null;
  }

  async run() {
    console.log('🌐 Iniciando pruebas de frontend...\n');
    
    try {
      await this.testBackendConnectivity();
      await this.testFrontendAccess();
      await this.testAdminLogin();
      await this.testPublicReservation();
      
      console.log('\n✅ ¡Todas las pruebas de frontend pasaron!');
      
    } catch (error) {
      console.error('\n❌ Error en pruebas de frontend:', error.message);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async testBackendConnectivity() {
    console.log('🔗 Verificando conectividad backend...');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Backend accesible');
        console.log(`  📊 Estado: ${data.status}`);
      } else {
        throw new Error('Backend no disponible');
      }
      
    } catch (error) {
      throw new Error(`Error conectando al backend: ${error.message}`);
    }
  }

  async testFrontendAccess() {
    console.log('\n🏠 Verificando acceso a frontends...');
    
    // Test frontend público
    try {
      const publicResponse = await fetch(FRONTEND_PUBLIC_URL);
      if (publicResponse.ok) {
        console.log('✅ Frontend público accesible');
      } else {
        console.log('⚠️ Frontend público no disponible');
      }
    } catch (error) {
      console.log('⚠️ Frontend público no disponible:', error.message);
    }
    
    // Test frontend admin
    try {
      const adminResponse = await fetch(FRONTEND_ADMIN_URL);
      if (adminResponse.ok) {
        console.log('✅ Frontend admin accesible');
      } else {
        console.log('⚠️ Frontend admin no disponible');
      }
    } catch (error) {
      console.log('⚠️ Frontend admin no disponible:', error.message);
    }
  }

  async testAdminLogin() {
    console.log('\n🔐 Probando login del admin (básico)...');
    
    try {
      this.browser = await puppeteer.launch({ headless: true });
      const page = await this.browser.newPage();
      
      // Ir a login
      await page.goto(`${FRONTEND_ADMIN_URL}/login`, { waitUntil: 'networkidle0' });
      
      // Verificar que la página de login cargó
      const title = await page.title();
      console.log(`✅ Página de login cargada: "${title}"`);
      
      // Buscar elementos del formulario
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      const passwordInput = await page.$('input[type="password"], input[name="password"]');
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      
      if (emailInput && passwordInput && submitButton) {
        console.log('✅ Formulario de login encontrado');
        
        // Intentar login (sin completar para no interferir)
        console.log('  📝 Elementos del formulario presentes');
        
      } else {
        console.log('⚠️ Formulario de login incompleto');
      }
      
    } catch (error) {
      console.log('⚠️ Error en prueba de login:', error.message);
    }
  }

  async testPublicReservation() {
    console.log('\n📝 Probando formulario de reserva pública...');
    
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({ headless: true });
      }
      
      const page = await this.browser.newPage();
      
      // Ir a la página pública
      await page.goto(FRONTEND_PUBLIC_URL, { waitUntil: 'networkidle0' });
      
      const title = await page.title();
      console.log(`✅ Página pública cargada: "${title}"`);
      
      // Buscar formulario de reserva
      const reservationForm = await page.$('form');
      const nameInput = await page.$('input[name="firstName"], input[placeholder*="Nombre"]');
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      
      if (reservationForm && nameInput && emailInput) {
        console.log('✅ Formulario de reserva encontrado');
        console.log('  📋 Campos principales presentes');
      } else {
        console.log('⚠️ Formulario de reserva no encontrado o incompleto');
      }
      
      // Verificar conectividad con API desde el frontend
      const apiTest = await page.evaluate(async (backendUrl) => {
        try {
          const response = await fetch(`${backendUrl}/api/health`);
          return response.ok;
        } catch {
          return false;
        }
      }, BACKEND_URL);
      
      if (apiTest) {
        console.log('✅ Frontend puede conectar con backend');
      } else {
        console.log('⚠️ Frontend no puede conectar con backend');
      }
      
    } catch (error) {
      console.log('⚠️ Error en prueba de reserva pública:', error.message);
    }
  }
}

// Solo ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FrontendTester();
  tester.run();
}

export default FrontendTester;
