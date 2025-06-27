import request from 'supertest';
import app from '../server.js';

const admin = {
  email: 'admin@hotel.com',
  password: 'Admin1234!'
};

const habitacionValida = {
  number: 888,
  type: 'standard',
  price: 100,
  floor: 1,
  capacity: 2
};

describe('HABITACIONES protegidas', () => {
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

  it('debe rechazar crear habitación sin token', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send(habitacionValida);
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
  });

  it('debe permitir crear habitación con token admin', async () => {
    const req = request(app).post('/api/rooms');
    if (token.startsWith('token=')) {
      req.set('Cookie', token);
    } else {
      req.set('Authorization', `Bearer ${token}`);
    }
    const res = await req.send(habitacionValida);
    expect([200, 201, 409]).toContain(res.statusCode); // 409 si ya existe
  });
});
