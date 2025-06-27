import request from 'supertest';
import app from '../server.js';

const admin = {
  email: 'admin@hotel.com',
  password: 'Admin1234!'
};

const reservaValida = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  phone: '+541112223344',
  checkIn: '2025-08-10',
  checkOut: '2025-08-12',
  roomNumber: 102,
  guests: 2,
  notes: 'Reserva protegida'
};

describe('RESERVAS protegidas', () => {
  let token = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(admin);
    if (res.headers['set-cookie']) {
      token = res.headers['set-cookie'].find(c => c.includes('token'));
    }
    if (res.body.token) {
      token = res.body.token;
    }
  });

  it('debe rechazar crear reserva sin token', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send(reservaValida);
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
  });

  it('debe permitir crear reserva con token', async () => {
    const req = request(app).post('/api/reservations');
    if (token.startsWith('token=')) {
      req.set('Cookie', token);
    } else {
      req.set('Authorization', `Bearer ${token}`);
    }
    const res = await req.send(reservaValida);
    expect([200, 201, 409]).toContain(res.statusCode); // 409 si ya existe
  });
});
