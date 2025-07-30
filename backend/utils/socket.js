let io;

const initializeSocket = (socketIo) => {
  io = socketIo;
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const emitNewComment = (comment) => {
  if (io) {
    io.emit('new-comment', comment);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitNewComment
};