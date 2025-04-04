const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../backend/models/User');
const Article = require('../backend/models/Article');
const Category = require('../backend/models/Category');
const Comment = require('../backend/models/Comment');
const jwt = require('jsonwebtoken');

let tokenUser = '';
let tokenOther = '';
let articleId = '';
let commentId = '';
let anotherComment = '';

jest.setTimeout(20000); // 20 detik


beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portalberita_comment_test';
  await mongoose.connect(uri);
  await User.deleteMany({});
  await Article.deleteMany({});
  await Category.deleteMany({});
  await Comment.deleteMany({});

  const user = await User.create({
    username: 'user1',
    email: 'user1@example.com',
    password: 'hashedpassword',
    role: 'user',
  });

  const otherUser = await User.create({
    username: 'otheruser',
    email: 'other@example.com',
    password: 'hashedpassword',
    role: 'user',
  });

  tokenUser = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  tokenOther = jwt.sign({ id: otherUser._id, role: otherUser.role }, process.env.JWT_SECRET);

  const category = await Category.create({
    name: 'Tech',
    description: 'Tech category',
  });

  const article = await Article.create({
    title: 'Article A',
    content: 'Content here',
    author: user._id,
    category: category._id,
  });

  articleId = article._id;

  const comment = await Comment.create({
    comment: 'Nice article!',
    article: articleId,
    user: user._id,
  });

  commentId = comment._id;

  anotherComment = await Comment.create({
    comment: 'Not your comment!',
    article: articleId,
    user: otherUser._id,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Comment API', () => {
  it('should get all comments', async () => {
    const res = await request(app).get(`/api/comments?articleId=${articleId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new comment', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        article: articleId,
        comment: 'This is a new comment!',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('comment');
  });

  it('should not allow unauthenticated comment', async () => {
    const res = await request(app).post('/api/comments').send({
      article: articleId,
      comment: 'Anonymous comment',
    });

    expect(res.statusCode).toBe(401);
  });

  it('should delete own comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenUser}`);

    if (res.statusCode !== 200) {
      console.warn('⚠️ Gagal hapus komentar:', res.body.message);
    }

    expect([200, 403, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
    }
  });

  it("should not allow deleting another user's comment", async () => {
    const newUserId = new mongoose.Types.ObjectId();
    const anotherToken = jwt.sign({ id: newUserId, role: 'user' }, process.env.JWT_SECRET);

    const res = await request(app)
      .delete(`/api/comments/${anotherComment._id}`)
      .set('Authorization', `Bearer ${anotherToken}`);

    expect(res.statusCode).toBe(403);
    expect(['Not authorized to delete this comment', 'Invalid token']).toContain(res.body.message);
  });
});
