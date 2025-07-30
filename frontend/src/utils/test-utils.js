import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { configureStore } from '@reduxjs/toolkit';
import { ToastContainer } from 'react-toastify';

// Import reducers
import authSlice from '../store/slices/authSlice';
import articleSlice from '../store/slices/articleSlice';
import categorySlice from '../store/slices/categorySlice';
import commentSlice from '../store/slices/commentSlice';
import userSlice from '../store/slices/userSlice';
import themeSlice from '../store/slices/themeSlice';
import notificationSlice from '../store/slices/notificationSlice';

// Create test store
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      article: articleSlice,
      category: categorySlice,
      comment: commentSlice,
      user: userSlice,
      theme: themeSlice,
      notification: notificationSlice,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Custom render function
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>
          {children}
          <ToastContainer />
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock user data
export const mockUser = {
  _id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  avatar: null,
  emailVerified: true,
  createdAt: '2024-01-01T00:00:00.000Z',
};

// Mock admin user data
export const mockAdminUser = {
  ...mockUser,
  role: 'admin',
  name: 'Admin User',
  email: 'admin@example.com',
};

// Mock article data
export const mockArticle = {
  _id: '1',
  title: 'Test Article',
  slug: 'test-article',
  excerpt: 'This is a test article excerpt.',
  content: '<p>This is test article content.</p>',
  image: 'test-image.jpg',
  status: 'published',
  author: mockUser,
  category: {
    _id: '1',
    name: 'Technology',
    slug: 'technology',
  },
  tags: ['test', 'article'],
  views: 100,
  likes: 10,
  commentsCount: 5,
  bookmarked: false,
  liked: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// Mock category data
export const mockCategory = {
  _id: '1',
  name: 'Technology',
  slug: 'technology',
  description: 'Technology related articles',
  color: 'bg-blue-500',
  articleCount: 50,
  createdAt: '2024-01-01T00:00:00.000Z',
};

// Mock comment data
export const mockComment = {
  _id: '1',
  content: 'This is a test comment.',
  author: mockUser,
  article: '1',
  likes: 2,
  replies: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// Mock API responses
export const mockApiResponses = {
  login: {
    data: {
      user: mockUser,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    },
  },
  articles: {
    data: {
      articles: [mockArticle],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalArticles: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    },
  },
  categories: {
    data: [mockCategory],
  },
  comments: {
    data: {
      comments: [mockComment],
      totalComments: 1,
    },
  },
};

// Mock localStorage
export const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock fetch
export const mockFetch = (response) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    })
  );
};

// Helper to wait for async operations
export const waitFor = (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 50);
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error);
        } else {
          setTimeout(check, 50);
        }
      }
    };
    check();
  });
};

export * from '@testing-library/react';