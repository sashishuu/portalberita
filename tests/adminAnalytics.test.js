const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../backend/models/User');
const Article = require('../backend/models/Article');
const Comment = require('../backend/models/Comment');
const Category = require('../backend/models/Category');
const jwt = require('jsonwebtoken');

let adminToken = '';

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portalberita_analytics_test';
  await mongoose.connect(uri);
  await User.deleteMany({});
  await Article.deleteMany({});
  await Comment.deleteMany({});
  await Category.deleteMany({});

  const admin = await User.create({
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'hashedpassword',
    role: 'admin',
  });

  adminToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);

  const category = await Category.create({ name: 'Tech', description: 'Tech stuff' });

  const article1 = await Article.create({
    title: 'A',
    content: 'aaa',
    category: category._id,
    author: admin._id,
  });

  const article2 = await Article.create({
    title: 'B',
    content: 'bbb',
    category: category._id,
    author: admin._id,
  });

  await Comment.create({ article: article1._id, user: admin._id, comment: 'aaa' });
  await Comment.create({ article: article2._id, user: admin._id, comment: 'bbb' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Admin Analytics API', () => {
  it('should return summary analytics if authorized as admin', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body).toHaveProperty('totalArticles');
    expect(res.body).toHaveProperty('totalComments');
    expect(res.body).toHaveProperty('articlesPerCategory');
    expect(Array.isArray(res.body.articlesPerCategory)).toBe(true);
  });

  it('should return 403 if not admin', async () => {
    const user = await User.create({
      username: 'normaluser',
      email: 'user@example.com',
      password: 'hashed',
      role: 'user',
    });

    const userToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);

    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Admins only');
  });

  it('should return 401 if no token', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });
});
