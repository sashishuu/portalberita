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

const articleService = {
  // Get all articles with filters
  getArticles: async (params = {}) => {
    const response = await api.get('/articles', { params });
    return response;
  },

  // Get article by ID or slug
  getArticleById: async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response;
  },

  // Get article by slug
  getArticleBySlug: async (slug) => {
    const response = await api.get(`/articles/slug/${slug}`);
    return response;
  },

  // Get featured articles
  getFeaturedArticles: async () => {
    const response = await api.get('/articles?featured=true&limit=6');
    return response;
  },

  // Get latest articles
  getLatestArticles: async (limit = 10) => {
    const response = await api.get(`/articles?sort=newest&limit=${limit}`);
    return response;
  },

  // Get popular articles
  getPopularArticles: async (limit = 10) => {
    const response = await api.get(`/articles?sort=popular&limit=${limit}`);
    return response;
  },

  // Get related articles
  getRelatedArticles: async (articleId, categoryId) => {
    const response = await api.get(`/articles/related/${articleId}?category=${categoryId}`);
    return response;
  },

  // Search articles
  searchArticles: async (searchParams) => {
    const response = await api.get('/articles/search', { params: searchParams });
    return response;
  },

  // Get articles by category
  getArticlesByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/articles?category=${categoryId}`, { params });
    return response;
  },

  // Create article
  createArticle: async (articleData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(articleData).forEach(key => {
      if (key !== 'image' && articleData[key] !== null && articleData[key] !== undefined) {
        if (Array.isArray(articleData[key])) {
          formData.append(key, JSON.stringify(articleData[key]));
        } else {
          formData.append(key, articleData[key]);
        }
      }
    });
    
    // Add image if exists
    if (articleData.image) {
      formData.append('image', articleData.image);
    }

    const response = await api.post('/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Update article
  updateArticle: async (id, articleData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(articleData).forEach(key => {
      if (key !== 'image' && articleData[key] !== null && articleData[key] !== undefined) {
        if (Array.isArray(articleData[key])) {
          formData.append(key, JSON.stringify(articleData[key]));
        } else {
          formData.append(key, articleData[key]);
        }
      }
    });
    
    // Add image if exists
    if (articleData.image) {
      formData.append('image', articleData.image);
    }

    const response = await api.put(`/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Delete article
  deleteArticle: async (id) => {
    const response = await api.delete(`/articles/${id}`);
    return response;
  },

  // Get user articles
  getUserArticles: async (params = {}) => {
    const response = await api.get('/articles/user/my-articles', { params });
    return response;
  },

  // Like article
  likeArticle: async (articleId) => {
    const response = await api.post(`/articles/${articleId}/like`);
    return response;
  },

  // Unlike article
  unlikeArticle: async (articleId) => {
    const response = await api.delete(`/articles/${articleId}/like`);
    return response;
  },

  // Bookmark article
  bookmarkArticle: async (articleId) => {
    const response = await api.post(`/articles/${articleId}/bookmark`);
    return response;
  },

  // Remove bookmark
  removeBookmark: async (articleId) => {
    const response = await api.delete(`/articles/${articleId}/bookmark`);
    return response;
  },

  // Toggle bookmark
  toggleBookmark: async (articleId) => {
    const response = await api.post(`/articles/${articleId}/toggle-bookmark`);
    return response;
  },

  // Get bookmarks
  getBookmarks: async (params = {}) => {
    const response = await api.get('/articles/bookmarks', { params });
    return response;
  },

  // Share article
  shareArticle: async (articleId, platform) => {
    const response = await api.post(`/articles/${articleId}/share`, { platform });
    return response;
  },

  // Report article
  reportArticle: async (articleId, reason) => {
    const response = await api.post(`/articles/${articleId}/report`, { reason });
    return response;
  },

  // Get article analytics (for author)
  getArticleAnalytics: async (articleId) => {
    const response = await api.get(`/articles/${articleId}/analytics`);
    return response;
  },
};

export default articleService;