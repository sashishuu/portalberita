const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../backend/models/User');
const Category = require('../backend/models/Category');
const { connectTestDB, disconnectTestDB } = require('../utils/testDb');

let tokenAdmin, tokenUser;

beforeAll(async () => {
  await connectTestDB('mongodb://127.0.0.1:27017/portalberita_test');

  await User.deleteMany();
  await Category.deleteMany();

  const admin = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: await bcrypt.hash('adminpass', 10),
    role: 'admin',
  });

  const user = await User.create({
    username: 'user',
    email: 'user@example.com',
    password: await bcrypt.hash('userpass', 10),
    role: 'user',
  });

  tokenAdmin = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  tokenUser = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('Category API', () => {
  it('should return all categories (empty)', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('should prevent non-admin from creating category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ name: 'Tech' });
    expect(res.statusCode).toEqual(403);
  });

  it('should allow admin to create category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'Technology' });
    expect(res.statusCode).toEqual(201);
  });

  it('should update category as admin', async () => {
    const category = await Category.findOne({ name: 'Technology' });
    const res = await request(app)
      .put(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'Updated Tech' });
    expect(res.statusCode).toEqual(200);
  });

  it('should delete category as admin', async () => {
    const category = await Category.findOne({ name: 'Updated Tech' });
    const res = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toEqual(200);
  });
});
