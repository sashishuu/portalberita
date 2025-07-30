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

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/users/refresh-token`, {
            refreshToken
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {localStorage.setItem('token', response.data.token);
     if (response.data.refreshToken) {
       localStorage.setItem('refreshToken', response.data.refreshToken);
     }
   }
   return response;
 },

 // Register
 register: async (userData) => {
   const response = await api.post('/users/register', userData);
   return response;
 },

 // Logout
 logout: async () => {
   try {
     await api.post('/users/logout');
   } catch (error) {
     // Even if server logout fails, clear local storage
     console.error('Server logout failed:', error);
   } finally {
     localStorage.removeItem('token');
     localStorage.removeItem('refreshToken');
   }
 },

 // Get current user
 getCurrentUser: async () => {
   const response = await api.get('/users/me');
   return response;
 },

 // Forgot password
 forgotPassword: async (email) => {
   const response = await api.post('/users/forgot-password', { email });
   return response;
 },

 // Reset password
 resetPassword: async (token, password) => {
   const response = await api.post('/users/reset-password', { token, password });
   return response;
 },

 // Verify email
 verifyEmail: async (token) => {
   const response = await api.post('/users/verify-email', { token });
   if (response.data.token) {
     localStorage.setItem('token', response.data.token);
   }
   return response;
 },

 // Refresh token
 refreshToken: async () => {
   const refreshToken = localStorage.getItem('refreshToken');
   const response = await api.post('/users/refresh-token', { refreshToken });
   if (response.data.token) {
     localStorage.setItem('token', response.data.token);
   }
   return response;
 },

 // Change password
 changePassword: async (passwordData) => {
   const response = await api.put('/users/change-password', passwordData);
   return response;
 },

 // Update profile
 updateProfile: async (profileData) => {
   const response = await api.put('/users/profile', profileData);
   return response;
 },

 // Upload avatar
 uploadAvatar: async (formData) => {
   const response = await api.post('/users/upload-avatar', formData, {
     headers: {
       'Content-Type': 'multipart/form-data',
     },
   });
   return response;
 },

 // Resend verification email
 resendVerification: async () => {
   const response = await api.post('/users/resend-verification');
   return response;
 },
};

export default authService;