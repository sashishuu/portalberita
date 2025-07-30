const { handleCommentEvents } = require('../sockets/commentSocket');

let io;

const initializeSocket = (socketIo) => {
  io = socketIo;
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle comment-related events
    handleCommentEvents(socket);
    
    // Handle user authentication for socket
    socket.on('authenticate', (token) => {
      // Verify JWT token and associate with socket
      // Implementation depends on your auth requirements
    });
    
    // Handle general events
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });
    
    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToRoom,
  emitToAll
};