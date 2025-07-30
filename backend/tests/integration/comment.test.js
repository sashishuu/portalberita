const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const { setupTestEnv, teardownTestEnv } = require('../utils/testDb');

describe('Comment API', () => {
  let user;
  let admin;
  let category;
  let article;
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

    // Create test article
    article = new Article({
      title: 'Test Article',
      content: 'This is test content for the article with more than 100 characters to meet the minimum requirement.',
      author: user._id,
      category: category._id,
      status: 'published'
    });
    await article.save();

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

  describe('GET /api/comments/article/:articleId', () => {
    beforeEach(async () => {
      // Create test comments
      const comments = [
        {
          content: 'This is the first comment on the article.',
          author: user._id,
          article: article._id
        },
        {
          content: 'This is the second comment on the article.',
          author: admin._id,
          article: article._id
        }
      ];

      await Comment.insertMany(comments);
    });

    it('should get comments for an article', async () => {
      const response = await request(app)
        .get(`/api/comments/article/${article._id}`)
        .expect(200);

      expect(response.body.comments).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalComments).toBe(2);
    });

    it('should support pagination for comments', async () => {
      const response = await request(app)
        .get(`/api/comments/article/${article._id}?page=1&limit=1`)
        .expect(200);

      expect(response.body.comments).toHaveLength(1);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should return 404 for non-existent article', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/comments/article/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Article not found');
    });
  });

  describe('POST /api/comments', () => {
    it('should create comment with valid data', async () => {
      const commentData = {
        content: 'This is a test comment with enough characters to meet minimum requirements.',
        article: article._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.message).toBe('Comment created successfully');
      expect(response.body.comment.content).toBe(commentData.content);
      expect(response.body.comment.author._id).toBe(user._id.toString());
    });

    it('should not create comment without authentication', async () => {
      const commentData = {
        content: 'This is a test comment.',
        article: article._id
      };

      const response = await request(app)
        .post('/api/comments')
        .send(commentData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should validate minimum comment length', async () => {
      const commentData = {
        content: 'Short',
        article: article._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(commentData)
        .expect(400);

      expect(response.body.errors.some(error => 
        error.message.includes('Comment must be between 10 and 500 characters')
      )).toBe(true);
    });

    it('should validate maximum comment length', async () => {
      const longContent = 'a'.repeat(501);
      const commentData = {
        content: longContent,
        article: article._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(commentData)
        .expect(400);

      expect(response.body.errors.some(error => 
        error.message.includes('Comment must be between 10 and 500 characters')
      )).toBe(true);
    });

    it('should detect spam content', async () => {
      const spamData = {
        content: 'Click here to win free money! Visit our casino now!',
        article: article._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(spamData)
        .expect(400);

      expect(response.body.message).toBe('Comment appears to be spam and has been rejected');
    });
  });

  describe('PUT /api/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      comment = new Comment({
        content: 'Original comment content with enough characters.',
        author: user._id,
        article: article._id
      });
      await comment.save();
    });

    it('should update own comment', async () => {
      const updateData = {
        content: 'Updated comment content with enough characters to meet requirements.'
      };

      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Comment updated successfully');
      expect(response.body.comment.content).toBe(updateData.content);
    });

    it('should not update other user\'s comment', async () => {
      const otherComment = new Comment({
        content: 'Another user comment with enough characters.',
        author: admin._id,
        article: article._id
      });
      await otherComment.save();

      const response = await request(app)
        .put(`/api/comments/${otherComment._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Trying to update other user comment.'
        })
        .expect(403);

      expect(response.body.message).toBe('Not authorized to update this comment');
    });

    it('should allow admin to update any comment', async () => {
      const updateData = {
        content: 'Admin updated this comment with sufficient character count.'
      };

      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.comment.content).toBe(updateData.content);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      comment = new Comment({
        content: 'Comment to be deleted with enough characters.',
        author: user._id,
        article: article._id
      });
      await comment.save();
    });

    it('should delete own comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Comment deleted successfully');

      const deletedComment = await Comment.findById(comment._id);
      expect(deletedComment).toBeNull();
    });

    it('should not delete other user\'s comment', async () => {
      const otherComment = new Comment({
        content: 'Another user comment that should not be deletable.',
        author: admin._id,
        article: article._id
      });
      await otherComment.save();

      const response = await request(app)
        .delete(`/api/comments/${otherComment._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Not authorized to delete this comment');
    });

    it('should allow admin to delete any comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Comment deleted successfully');
    });
  });
});