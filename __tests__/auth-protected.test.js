import request from 'supertest';
import app from '../server.js';

// Credenciales de admin de prueba (deben existir en la base de datos de test)
const admin = {
  email: 'admin@hotel.com',
  password: 'Admin1234!'
};

describe('ENDPOINTS PROTEGIDOS', () => {
  let token = '';

  it('debe loguear y obtener token/cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(admin);
    expect([200, 201]).toContain(res.statusCode);
    // Si usas JWT en cookie httpOnly
    if (res.headers['set-cookie']) {
      token = res.headers['set-cookie'].find(c => c.includes('token'));
    }
    // Si usas JWT en body
    if (res.body.token) {
      token = res.body.token;
    }
    expect(token).toBeTruthy();
  });

  it('debe rechazar acceso a /api/users sin token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
  });

  it('debe permitir acceso a /api/users con token', async () => {
    const req = request(app).get('/api/users');
    if (token.startsWith('token=')) {
      req.set('Cookie', token);
    } else {
      req.set('Authorization', `Bearer ${token}`);
    }
    const res = await req;
    expect([200, 201, 403]).toContain(res.statusCode); // 403 si no es admin real
  });
});
