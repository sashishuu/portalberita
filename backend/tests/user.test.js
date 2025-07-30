const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const { setupTestEnv, teardownTestEnv } = require('../utils/testDb');

describe('User Authentication', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully. Please check your email for verification.');
      expect(response.body.userId).toBeDefined();

      const user = await User.findById(response.body.userId);
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.isVerified).toBe(false);
    });

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Create user first
      await request(app)
        .post('/api/users/register')
        .send(userData);

      // Try to register again
      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User'
          // Missing email and password
        })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toHaveLength(2);
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.errors[0].message).toBe('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/users/login', () => {
    let user;

    beforeEach(async () => {
      // Create and verify a user
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: true
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login unverified user', async () => {
      // Create unverified user
      const unverifiedUser = new User({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: 'password123',
        isVerified: false
      });
      await unverifiedUser.save();

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'unverified@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.message).toBe('Email not verified');
    });
  });

  describe('GET /api/users/me', () => {
    let user;
    let token;

    beforeEach(async () => {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: true
      });
      await user.save();

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = response.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
      expect(response.body.password).toBeUndefined();
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.message).toBe('Token is not valid');
    });
  });
});