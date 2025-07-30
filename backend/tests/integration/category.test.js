const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Category = require('../models/Category');
const Article = require('../models/Article');
const { setupTestEnv, teardownTestEnv } = require('../utils/testDb');

describe('Category API', () => {
  let user;
  let admin;
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
    await Category.deleteMany({});
    await Article.deleteMany({});

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

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      const categories = [
        { name: 'Technology', description: 'Tech news and articles' },
        { name: 'Sports', description: 'Sports news and updates' },
        { name: 'Business', description: 'Business and finance news' }
      ];

      await Category.insertMany(categories);
    });

    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('Business'); // Sorted alphabetically
    });

    it('should include article count when requested', async () => {
      const category = await Category.findOne({ name: 'Technology' });
      
      // Create an article for this category
      await Article.create({
        title: 'Tech Article',
        content: 'This is a technology article with more than 100 characters to meet minimum requirements.',
        author: user._id,
        category: category._id,
        status: 'published'
      });

      const response = await request(app)
        .get('/api/categories?includeCount=true')
        .expect(200);

      const techCategory = response.body.find(cat => cat.name === 'Technology');
      expect(techCategory.articleCount).toBe(1);
    });
  });

  describe('POST /api/categories', () => {
    it('should create category as admin', async () => {
      const categoryData = {
        name: 'Entertainment',
        description: 'Entertainment news and reviews'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.message).toBe('Category created successfully');
      expect(response.body.category.name).toBe(categoryData.name);
    });

    it('should not create category as regular user', async () => {
      const categoryData = {
        name: 'Entertainment',
        description: 'Entertainment news and reviews'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin role required.');
    });

    it('should not create duplicate category', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Tech news'
      };

      // Create first category
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(400);

      expect(response.body.message).toBe('Category already exists');
    });

    it('should validate category name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A', // Too short
          description: 'Short name category'
        })
        .expect(400);

      expect(response.body.errors.some(error => 
        error.message.includes('Category name must be between 2 and 50 characters')
      )).toBe(true);
    });
  });

  describe('PUT /api/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = new Category({
        name: 'Original Category',
        description: 'Original description'
      });
      await category.save();
    });

    it('should update category as admin', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Category updated successfully');
      expect(response.body.category.name).toBe(updateData.name);
    });

    it('should not update category as regular user', async () => {
      const response = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Category'
        })
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin role required.');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = new Category({
        name: 'Category to Delete',
        description: 'This category will be deleted'
      });
      await category.save();
    });

    it('should delete category without articles as admin', async () => {
      const response = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Category deleted successfully');

      const deletedCategory = await Category.findById(category._id);
      expect(deletedCategory).toBeNull();
    });

    it('should not delete category with articles', async () => {
      // Create an article for this category
      await Article.create({
        title: 'Article in Category',
        content: 'This article belongs to a category that should not be deletable with more than 100 characters.',
        author: user._id,
        category: category._id,
        status: 'published'
      });

      const response = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.message).toContain('Cannot delete category. It has 1 associated articles.');
    });

    it('should not delete category as regular user', async () => {
      const response = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin role required.');
    });
  });
});