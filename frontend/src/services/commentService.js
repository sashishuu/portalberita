import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const commentService = {
  // Get comments for an article
  getCommentsByArticle: async (articleId, params = {}) => {
    const response = await api.get(`/comments/article/${articleId}`, { params });
    return response;
  },

  // Create comment
  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response;
  },

  // Update comment
  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response;
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response;
  },

  // Like comment
  likeComment: async (commentId) => {
    const response = await api.post(`/comments/${commentId}/like`);
    return response;
  },

  // Unlike comment
  unlikeComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}/like`);
    return response;
  },

  // Reply to comment
  replyToComment: async (commentId, content) => {
    const response = await api.post(`/comments/${commentId}/reply`, { content });
    return response;
  },

  // Get user comments
  getUserComments: async (params = {}) => {
    const response = await api.get('/comments/user/my-comments', { params });
    return response;
  },

  // Report comment
  reportComment: async (commentId, reason) => {
    const response = await api.post(`/comments/${commentId}/report`, { reason });
    return response;
  },

  // Get comment by ID
  getCommentById: async (commentId) => {
    const response = await api.get(`/comments/${commentId}`);
    return response;
  },
};

export default commentService;