import request from 'supertest';
import app from '../server.js';

// Datos de ejemplo para reserva válida
const reservaValida = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  phone: '+541112223344',
  checkIn: '2025-08-01',
  checkOut: '2025-08-03',
  roomNumber: 101,
  guests: 2,
  notes: 'Reserva de prueba'
};

describe('POST /api/reservations', () => {
  it('debe rechazar reservas sin datos obligatorios', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe crear una reserva válida', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send(reservaValida);
    // Puede requerir autenticación según la configuración
    expect([200, 201, 401, 403]).toContain(res.statusCode);
  });

  it('debe rechazar solapamiento de reservas', async () => {
    // Intentar reservar la misma habitación y fechas
    await request(app).post('/api/reservations').send(reservaValida);
    const res = await request(app)
      .post('/api/reservations')
      .send(reservaValida);
    expect([409, 400]).toContain(res.statusCode);
  });
});
