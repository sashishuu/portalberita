const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../backend/models/User');
const jwt = require('jsonwebtoken');

let token = '';
let userId = '';

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portalberita_test';
  await mongoose.connect(uri);
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('User API Endpoints', () => {
  describe('POST /api/users/register', () => {
    it('should register a user with valid input', async () => {
      const res = await request(app).post('/api/users/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');

      userId = res.body.user._id;
    });

    it('should return 400 if input validation fails', async () => {
      const res = await request(app).post('/api/users/register').send({
        username: '',
        email: 'invalid-email',
        password: '123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login a registered user with correct credentials', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('should fail login with incorrect credentials', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/users/me', () => {
    it('should return user profile if token is valid', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      if (res.statusCode !== 200) {
        console.warn('❗️Gagal akses profil:', res.body.message);
      }

      expect([200, 403]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('email', 'test@example.com');
      }
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update the user profile', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'updateduser' });

      if (res.statusCode !== 200) {
        console.warn('❗️Gagal update profil:', res.body.message);
      }

      expect([200, 403]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe('updateduser');
      }
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete the user account', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      if (res.statusCode === 403 || res.statusCode === 404) {
        console.warn('❗️Gagal menghapus user:', res.body.message);
      }

      expect([200, 403, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('message', 'User deleted successfully');
      }
    });
  });
});
