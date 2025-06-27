import request from 'supertest';
import app from '../server.js';

describe('GET /api/rooms/available', () => {
  it('debe devolver habitaciones disponibles para un rango de fechas', async () => {
    const res = await request(app)
      .get('/api/rooms/available')
      .query({ from: '2025-07-01', to: '2025-07-05' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/reservations', () => {
  it('debe rechazar reservas sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
  // Agrega aquí un test con datos válidos si tienes un usuario autenticado de prueba
});
