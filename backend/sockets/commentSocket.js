const { getIO } = require('../utils/socket');

// Handle comment-related socket events
const handleCommentEvents = (socket) => {
  // Join article room for real-time comments
  socket.on('join-article', (articleId) => {
    socket.join(`article-${articleId}`);
    console.log(`Socket ${socket.id} joined article room: ${articleId}`);
  });
  
  // Leave article room
  socket.on('leave-article', (articleId) => {
    socket.leave(`article-${articleId}`);
    console.log(`Socket ${socket.id} left article room: ${articleId}`);
  });
  
  // Handle typing indicator
  socket.on('typing-start', (data) => {
    socket.to(`article-${data.articleId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      articleId: data.articleId
    });
  });
  
  socket.on('typing-stop', (data) => {
    socket.to(`article-${data.articleId}`).emit('user-stopped-typing', {
      userId: data.userId,
      articleId: data.articleId
    });
  });
  
  // Handle comment reactions (like/dislike)
  socket.on('comment-reaction', (data) => {
    socket.to(`article-${data.articleId}`).emit('comment-reaction-update', {
      commentId: data.commentId,
      reaction: data.reaction,
      userId: data.userId,
      count: data.count
    });
  });
};

// Emit new comment to article room
const emitNewCommentToRoom = (articleId, commentData) => {
  const io = getIO();
  io.to(`article-${articleId}`).emit('new-comment', commentData);
};

// Emit comment update to article room
const emitCommentUpdateToRoom = (articleId, commentData) => {
  const io = getIO();
  io.to(`article-${articleId}`).emit('comment-updated', commentData);
};

// Emit comment deletion to article room
const emitCommentDeletionToRoom = (articleId, commentId) => {
  const io = getIO();
  io.to(`article-${articleId}`).emit('comment-deleted', { commentId });
};

// Broadcast online users count for an article
const broadcastOnlineUsersCount = (articleId) => {
  const io = getIO();
  const room = io.sockets.adapter.rooms.get(`article-${articleId}`);
  const count = room ? room.size : 0;
  
  io.to(`article-${articleId}`).emit('online-users-count', { count });
};

module.exports = {
  handleCommentEvents,
  emitNewCommentToRoom,
  emitCommentUpdateToRoom,
  emitCommentDeletionToRoom,
  broadcastOnlineUsersCount
};