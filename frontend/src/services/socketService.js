import io from 'socket.io-client';
import { toast } from 'react-toastify';

class SocketService {
  socket = null;
  
  // Initialize socket connection
  connect() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Listen for real-time notifications
    this.socket.on('notification', (data) => {
      toast.info(data.message);
    });

    // Listen for new comments
    this.socket.on('new-comment', (data) => {
      // Handle new comment notification
      if (window.location.pathname.includes('/article/')) {
        // Refresh comments if on article page
        window.dispatchEvent(new CustomEvent('newComment', { detail: data }));
      }
    });

    // Listen for comment updates
    this.socket.on('comment-updated', (data) => {
      window.dispatchEvent(new CustomEvent('commentUpdated', { detail: data }));
    });

    // Listen for comment deletions
    this.socket.on('comment-deleted', (data) => {
      window.dispatchEvent(new CustomEvent('commentDeleted', { detail: data }));
    });

    // Listen for typing indicators
    this.socket.on('user-typing', (data) => {
      window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
    });

    this.socket.on('user-stopped-typing', (data) => {
      window.dispatchEvent(new CustomEvent('userStoppedTyping', { detail: data }));
    });

    // Listen for online users count
    this.socket.on('online-users-count', (data) => {
      window.dispatchEvent(new CustomEvent('onlineUsersCount', { detail: data }));
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join article room for real-time updates
  joinArticle(articleId) {
    if (this.socket) {
      this.socket.emit('join-article', articleId);
    }
  }

  // Leave article room
  leaveArticle(articleId) {
    if (this.socket) {
      this.socket.emit('leave-article', articleId);
    }
  }

  // Send typing indicator
  startTyping(articleId, userId, userName) {
    if (this.socket) {
      this.socket.emit('typing-start', { articleId, userId, userName });
    }
  }

  // Stop typing indicator
  stopTyping(articleId, userId) {
    if (this.socket) {
      this.socket.emit('typing-stop', { articleId, userId });
    }
  }

  // Send comment reaction
  sendCommentReaction(commentId, articleId, reaction, userId, count) {
    if (this.socket) {
      this.socket.emit('comment-reaction', {
        commentId,
        articleId,
        reaction,
        userId,
        count
      });
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

// Initialize socket connection
export const initializeSocket = () => {
  return socketService.connect();
};

// Disconnect socket
export const disconnectSocket = () => {
  socketService.disconnect();
};

export default socketService;