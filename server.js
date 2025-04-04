require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const connectDB = require(path.join(__dirname, 'backend', 'config', 'db'));
const commentController = require('./backend/controllers/commentController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ==============================
// DB Connection
// ==============================
connectDB();

// ==============================
// Middleware
// ==============================
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(express.json());
app.use(cookieParser());

// ==============================
// API Routes
// ==============================
app.use('/api/users', require('./backend/routes/userRoutes'));
app.use('/api/articles', require('./backend/routes/articleRoutes'));
app.use('/api/comments', require('./backend/routes/commentRoutes'));
app.use('/api/categories', require('./backend/routes/categoryRoutes'));
app.use('/api/admin', require('./backend/routes/adminRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==============================
// Default Route
// ==============================
app.get('/', (req, res) => {
  res.send('📚 Welcome to Portal Berita API');
});

// ==============================
// Socket.IO Events
// ==============================
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // Inject io ke comment controller
  commentController.setSocket(io);

  // Event sederhana buat testing
  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// ==============================
// Start Server
// ==============================
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;
