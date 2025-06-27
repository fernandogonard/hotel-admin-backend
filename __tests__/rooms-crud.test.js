import request from 'supertest';
import app from '../server.js';

describe('HABITACIONES - API', () => {
  it('debe rechazar creación de habitación sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe rechazar creación de habitación con tipo inválido', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ number: 999, type: 'invalido', price: 100, floor: 1, capacity: 2 });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  // Test de éxito requiere autenticación admin, se recomienda mockear o usar token válido en entorno real
});
