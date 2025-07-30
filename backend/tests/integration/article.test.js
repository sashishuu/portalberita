const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const { setupTestEnv, teardownTestEnv } = require('../utils/testDb');

describe('Article API', () => {
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

  describe('GET /api/articles', () => {
    beforeEach(async () => {
      // Create test articles
      const articles = [
        {
          title: 'Test Article 1',
          content: 'This is test content for article 1. It has more than 100 characters to meet the minimum requirement.',
          author: user._id,
          category: category._id,
          status: 'published'
        },
        {
          title: 'Test Article 2',
          content: 'This is test content for article 2. It has more than 100 characters to meet the minimum requirement.',
          author: admin._id,
          category: category._id,
          status: 'published'
        }
      ];

      await Article.insertMany(articles);
    });

    it('should get all published articles', async () => {
      const response = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(response.body.articles).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalArticles).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/articles?page=1&limit=1')
        .expect(200);

      expect(response.body.articles).toHaveLength(1);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
     expect(response.body.pagination.hasNextPage).toBe(true);
   });

   it('should support search functionality', async () => {
     const response = await request(app)
       .get('/api/articles?search=article 1')
       .expect(200);

     expect(response.body.articles).toHaveLength(1);
     expect(response.body.articles[0].title).toBe('Test Article 1');
   });

   it('should support category filtering', async () => {
     const response = await request(app)
       .get(`/api/articles?category=${category._id}`)
       .expect(200);

     expect(response.body.articles).toHaveLength(2);
     response.body.articles.forEach(article => {
       expect(article.category._id).toBe(category._id.toString());
     });
   });

   it('should support sorting', async () => {
     const response = await request(app)
       .get('/api/articles?sort=title')
       .expect(200);

     expect(response.body.articles[0].title).toBe('Test Article 1');
     expect(response.body.articles[1].title).toBe('Test Article 2');
   });
 });

 describe('POST /api/articles', () => {
   it('should create article with valid data', async () => {
     const articleData = {
       title: 'New Test Article',
       content: 'This is a new test article with enough content to meet the minimum requirement of 100 characters.',
       category: category._id,
       tags: 'test,article,news',
       status: 'published'
     };

     const response = await request(app)
       .post('/api/articles')
       .set('Authorization', `Bearer ${userToken}`)
       .send(articleData)
       .expect(201);

     expect(response.body.message).toBe('Article created successfully');
     expect(response.body.article.title).toBe(articleData.title);
     expect(response.body.article.author._id).toBe(user._id.toString());
   });

   it('should not create article without authentication', async () => {
     const articleData = {
       title: 'New Test Article',
       content: 'This is a new test article with enough content.',
       category: category._id
     };

     const response = await request(app)
       .post('/api/articles')
       .send(articleData)
       .expect(401);

     expect(response.body.message).toBe('No token, authorization denied');
   });

   it('should validate required fields', async () => {
     const response = await request(app)
       .post('/api/articles')
       .set('Authorization', `Bearer ${userToken}`)
       .send({
         title: 'Test'
         // Missing content and category
       })
       .expect(400);

     expect(response.body.message).toBe('Validation failed');
     expect(response.body.errors.length).toBeGreaterThan(0);
   });

   it('should validate minimum content length', async () => {
     const response = await request(app)
       .post('/api/articles')
       .set('Authorization', `Bearer ${userToken}`)
       .send({
         title: 'Test Article',
         content: 'Too short',
         category: category._id
       })
       .expect(400);

     expect(response.body.errors.some(error => 
       error.message.includes('Content must be at least 100 characters')
     )).toBe(true);
   });
 });

 describe('PUT /api/articles/:id', () => {
   let article;

   beforeEach(async () => {
     article = new Article({
       title: 'Original Article',
       content: 'This is the original content with more than 100 characters to meet the minimum requirement.',
       author: user._id,
       category: category._id,
       status: 'published'
     });
     await article.save();
   });

   it('should update own article', async () => {
     const updateData = {
       title: 'Updated Article',
       content: 'This is the updated content with more than 100 characters to meet the minimum requirement.'
     };

     const response = await request(app)
       .put(`/api/articles/${article._id}`)
       .set('Authorization', `Bearer ${userToken}`)
       .send(updateData)
       .expect(200);

     expect(response.body.message).toBe('Article updated successfully');
     expect(response.body.article.title).toBe(updateData.title);
   });

   it('should not update other user\'s article', async () => {
     const otherUserArticle = new Article({
       title: 'Other User Article',
       content: 'This is content from another user with more than 100 characters to meet the minimum requirement.',
       author: admin._id,
       category: category._id,
       status: 'published'
     });
     await otherUserArticle.save();

     const response = await request(app)
       .put(`/api/articles/${otherUserArticle._id}`)
       .set('Authorization', `Bearer ${userToken}`)
       .send({
         title: 'Trying to update'
       })
       .expect(403);

     expect(response.body.message).toBe('Not authorized to update this article');
   });

   it('should allow admin to update any article', async () => {
     const updateData = {
       title: 'Admin Updated Article'
     };

     const response = await request(app)
       .put(`/api/articles/${article._id}`)
       .set('Authorization', `Bearer ${adminToken}`)
       .send(updateData)
       .expect(200);

     expect(response.body.article.title).toBe(updateData.title);
   });
 });

 describe('DELETE /api/articles/:id', () => {
   let article;

   beforeEach(async () => {
     article = new Article({
       title: 'Article to Delete',
       content: 'This article will be deleted. It has more than 100 characters to meet the minimum requirement.',
       author: user._id,
       category: category._id,
       status: 'published'
     });
     await article.save();
   });

   it('should delete own article', async () => {
     const response = await request(app)
       .delete(`/api/articles/${article._id}`)
       .set('Authorization', `Bearer ${userToken}`)
       .expect(200);

     expect(response.body.message).toBe('Article deleted successfully');

     const deletedArticle = await Article.findById(article._id);
     expect(deletedArticle).toBeNull();
   });

   it('should not delete other user\'s article', async () => {
     const otherUserArticle = new Article({
       title: 'Other User Article',
       content: 'This article belongs to another user with more than 100 characters minimum requirement.',
       author: admin._id,
       category: category._id,
       status: 'published'
     });
     await otherUserArticle.save();

     const response = await request(app)
       .delete(`/api/articles/${otherUserArticle._id}`)
       .set('Authorization', `Bearer ${userToken}`)
       .expect(403);

     expect(response.body.message).toBe('Not authorized to delete this article');
   });

   it('should allow admin to delete any article', async () => {
     const response = await request(app)
       .delete(`/api/articles/${article._id}`)
       .set('Authorization', `Bearer ${adminToken}`)
       .expect(200);

     expect(response.body.message).toBe('Article deleted successfully');
   });
 });
});