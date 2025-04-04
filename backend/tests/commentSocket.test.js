const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../backend/models/User');
const Article = require('../backend/models/Article');
const Category = require('../backend/models/Category');
const Comment = require('../backend/models/Comment');

let server, io, clientSocket, user, token, articleId;

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portalberita_socket_test';
  await mongoose.connect(uri);
  await User.deleteMany({});
  await Article.deleteMany({});
  await Category.deleteMany({});
  await Comment.deleteMany({});

  user = await User.create({
    username: 'socketuser',
    email: 'socket@example.com',
    password: 'hashedpassword',
    role: 'user'
  });
  token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

  const category = await Category.create({ name: 'Tech', description: 'Tech' });

  const article = await Article.create({
    title: 'Real-time Testing',
    content: 'Test content',
    category: category._id,
    author: user._id
  });

  articleId = article._id;

  server = createServer(app);
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });
  require('../backend/sockets/commentSocket')(io);

  await new Promise((resolve) => server.listen(4000, resolve));

  clientSocket = new Client('http://localhost:4000');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  io.close();
  server.close();
  clientSocket.close();
});

describe('Socket.IO Real-time Comments', () => {
  it('should receive newComment event on new comment creation', (done) => {
    clientSocket.on('connect', () => {
      clientSocket.emit('ping');
    });

    clientSocket.on('pong', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ article: articleId, comment: 'This is a real-time test comment' });

      expect(res.statusCode).toBe(201);
    });

    clientSocket.on('newComment', (payload) => {
      expect(payload).toHaveProperty('comment');
      expect(payload.comment).toContain('real-time test');
      expect(payload.articleId.toString()).toEqual(articleId.toString());
      done();
    });
  });
});
