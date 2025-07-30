const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const { setupTestEnv, teardownTestEnv } = require('../utils/testDb');

describe('Admin Analytics API', () => {
  let user;
  let admin;
  let category;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    // Clean collections
    await User.deleteMany({});
    await Article.deleteMany({});
    await Category.deleteMany({});
    await Comment.deleteMany({});

    // Create test users
    user = new User({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      isVerified: true,
      role: 'user'
    });
    await user.save();

    admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isVerified: true,
      role: 'admin'
    });
    await admin.save();

    // Create test category
    category = new Category({
      name: 'Technology',
      description: 'Technology news and articles'
    });
    await category.save();

    // Create test data
    const article = new Article({
      title: 'Test Article',
      content: 'This is test content for analytics with more than 100 characters to meet minimum requirements.',
      author: user._id,
      category: category._id,
      status: 'published',
      views: 100
    });
    await article.save();

    const comment = new Comment({
      content: 'This is a test comment for analytics.',
      author: user._id,
      article: article._id
    });
    await comment.save();

    // Get tokens
    const userLogin = await request(app)
      .post('/api/users/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });
    userToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    adminToken = adminLogin.body.token;
  });

  describe('GET /api/admin/analytics', () => {
    it('should get analytics data as admin', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.overview).toBeDefined();
      expect(response.body.overview.totalUsers).toBe(2);
      expect(response.body.overview.totalArticles).toBe(1);
      expect(response.body.overview.totalComments).toBe(1);
      expect(response.body.overview.totalCategories).toBe(1);

      expect(response.body.articlesByCategory).toBeDefined();
      expect(response.body.mostViewedArticles).toBeDefined();
      expect(response.body.recentActivity).toBeDefined();
    });

    it('should not get analytics as regular user', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin role required.');
    });

    it('should not get analytics without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalUsers).toBe(2);
    });

    it('should support user search', async () => {
      const response = await request(app)
        .get('/api/admin/users?search=Test User')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].name).toBe('Test User');
    });

    it('should support role filtering', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].role).toBe('admin');
    });

    it('should not get users as regular user', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin role required.');
    });
  });

  describe('PUT /api/admin/users/:id/role', () => {
   it('should update user role as admin', async () => {
     const response = await request(app)
       .put(`/api/admin/users/${user._id}/role`)
       .set('Authorization', `Bearer ${adminToken}`)
       .send({ role: 'admin' })
       .expect(200);

     expect(response.body.message).toBe('User role updated to admin');
     expect(response.body.user.role).toBe('admin');

     // Verify in database
     const updatedUser = await User.findById(user._id);
     expect(updatedUser.role).toBe('admin');
   });

   it('should not update own role', async () => {
     const response = await request(app)
       .put(`/api/admin/users/${admin._id}/role`)
       .set('Authorization', `Bearer ${adminToken}`)
       .send({ role: 'user' })
       .expect(400);

     expect(response.body.message).toBe('Cannot change your own role');
   });

   it('should validate role value', async () => {
     const response = await request(app)
       .put(`/api/admin/users/${user._id}/role`)
       .set('Authorization', `Bearer ${adminToken}`)
       .send({ role: 'invalid' })
       .expect(400);

     expect(response.body.errors.some(error => 
       error.message.includes('Role must be either "user" or "admin"')
     )).toBe(true);
   });

   it('should not update role as regular user', async () => {
     const response = await request(app)
       .put(`/api/admin/users/${user._id}/role`)
       .set('Authorization', `Bearer ${userToken}`)
       .send({ role: 'admin' })
       .expect(403);

     expect(response.body.message).toBe('Access denied. Admin role required.');
   });
 });

 describe('DELETE /api/admin/users/:id', () => {
   it('should delete user as admin', async () => {
     const response = await request(app)
       .delete(`/api/admin/users/${user._id}`)
       .set('Authorization', `Bearer ${adminToken}`)
       .expect(200);

     expect(response.body.message).toBe('User and associated content deleted successfully');

     // Verify user is deleted
     const deletedUser = await User.findById(user._id);
     expect(deletedUser).toBeNull();

     // Verify associated content is deleted
     const userArticles = await Article.find({ author: user._id });
     expect(userArticles).toHaveLength(0);

     const userComments = await Comment.find({ author: user._id });
     expect(userComments).toHaveLength(0);
   });

   it('should not delete own account', async () => {
     const response = await request(app)
       .delete(`/api/admin/users/${admin._id}`)
       .set('Authorization', `Bearer ${adminToken}`)
       .expect(400);

     expect(response.body.message).toBe('Cannot delete your own account');
   });

   it('should not delete user as regular user', async () => {
     const response = await request(app)
       .delete(`/api/admin/users/${user._id}`)
       .set('Authorization', `Bearer ${userToken}`)
       .expect(403);

     expect(response.body.message).toBe('Access denied. Admin role required.');
   });
 });

 describe('GET /api/admin/system-stats', () => {
   it('should get system statistics as admin', async () => {
     const response = await request(app)
       .get('/api/admin/system-stats')
       .set('Authorization', `Bearer ${adminToken}`)
       .expect(200);

     expect(response.body.database).toBeDefined();
     expect(response.body.database.collections).toBeDefined();
     expect(response.body.server).toBeDefined();
     expect(response.body.server.nodeVersion).toBeDefined();
     expect(response.body.server.platform).toBeDefined();
     expect(response.body.server.uptime).toBeDefined();
     expect(response.body.server.memoryUsage).toBeDefined();
   });

   it('should not get system stats as regular user', async () => {
     const response = await request(app)
       .get('/api/admin/system-stats')
       .set('Authorization', `Bearer ${userToken}`)
       .expect(403);

     expect(response.body.message).toBe('Access denied. Admin role required.');
   });
 });
});