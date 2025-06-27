import request from 'supertest';
import app from '../server.js';

describe('USUARIOS - API', () => {
  it('debe rechazar creación de usuario sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe rechazar creación de usuario con email inválido', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'noemail', password: 'Test1234!', role: 'admin' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  // Test de éxito requiere autenticación admin, se recomienda mockear o usar token válido en entorno real
});
