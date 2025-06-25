import request from 'supertest';
import app from '../app.js';

describe('POST /api/auth/login', () => {
  it('debe rechazar login con credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake@user.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
  // Agrega aquí más tests con credenciales válidas si tienes usuarios de prueba
});
