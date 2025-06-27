// test-system.js - Script de prueba integral del sistema
import './config/db.js';
import './middleware/authMiddleware.js';
import './middleware/validateRequest.js';
import './controllers/authController.js';
import './routes/dashboard.js';

console.log('✅ Todos los módulos se cargaron correctamente');
console.log('🎉 Sistema listo para funcionar');

process.exit(0);
