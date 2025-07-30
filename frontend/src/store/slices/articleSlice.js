import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import articleService from '../../services/articleService';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  articles: [],
  currentArticle: null,
  featuredArticles: [],
  relatedArticles: [],
  userArticles: [],
  bookmarks: [],
  totalPages: 0,
  currentPage: 1,
  totalArticles: 0,
  loading: false,
  error: null,
  searchResults: [],
  searchLoading: false,
  filters: {
    category: '',
    sort: 'newest',
    search: '',
    dateFrom: '',
    dateTo: '',
  },
};

// Async thunks
export const fetchArticles = createAsyncThunk(
  'article/fetchArticles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await articleService.getArticles(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat artikel');
    }
  }
);

export const fetchArticleBySlug = createAsyncThunk(
  'article/fetchArticleBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await articleService.getArticleBySlug(slug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Artikel tidak ditemukan');
    }
  }
);

export const fetchFeaturedArticles = createAsyncThunk(
  'article/fetchFeaturedArticles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await articleService.getFeaturedArticles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat artikel unggulan');
    }
  }
);

export const fetchRelatedArticles = createAsyncThunk(
  'article/fetchRelatedArticles',
  async ({ articleId, categoryId }, { rejectWithValue }) => {
    try {
      const response = await articleService.getRelatedArticles(articleId, categoryId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat artikel terkait');
    }
  }
);

export const createArticle = createAsyncThunk(
  'article/createArticle',
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await articleService.createArticle(articleData);
      toast.success('Artikel berhasil dibuat!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal membuat artikel';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  'article/updateArticle',
  async ({ id, articleData }, { rejectWithValue }) => {
    try {
      const response = await articleService.updateArticle(id, articleData);
      toast.success('Artikel berhasil diperbarui!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal memperbarui artikel';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'article/deleteArticle',
  async (id, { rejectWithValue }) => {
    try {
      await articleService.deleteArticle(id);
      toast.success('Artikel berhasil dihapus!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus artikel';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchUserArticles = createAsyncThunk(
  'article/fetchUserArticles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await articleService.getUserArticles(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat artikel pengguna');
    }
  }
);

export const searchArticles = createAsyncThunk(
  'article/searchArticles',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await articleService.searchArticles(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mencari artikel');
    }
  }
);



export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const { auth: { user } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.put('/api/users/change-password', passwordData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  'article/toggleBookmark',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await articleService.toggleBookmark(articleId);
      toast.success(response.data.message);
      return { articleId, bookmarked: response.data.bookmarked };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal bookmark artikel';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchBookmarks = createAsyncThunk(
  'article/fetchBookmarks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await articleService.getBookmarks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat bookmark');
    }
  }
);

export const likeArticle = createAsyncThunk(
  'article/likeArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await articleService.likeArticle(articleId);
      return { articleId, likes: response.data.likes, liked: response.data.liked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menyukai artikel');
    }
  }
);

// Article slice
const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
      state.relatedArticles = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchLoading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateArticleInList: (state, action) => {
      const { id, updates } = action.payload;
      
      // Update in articles array
      const articleIndex = state.articles.findIndex(article => article._id === id);
      if (articleIndex !== -1) {
        state.articles[articleIndex] = { ...state.articles[articleIndex], ...updates };
      }
      
      // Update in userArticles array
      const userArticleIndex = state.userArticles.findIndex(article => article._id === id);
      if (userArticleIndex !== -1) {
        state.userArticles[userArticleIndex] = { ...state.userArticles[userArticleIndex], ...updates };
      }
      
      // Update current article if it matches
      if (state.currentArticle && state.currentArticle._id === id) {
        state.currentArticle = { ...state.currentArticle, ...updates };
      }
    },
    removeArticleFromList: (state, action) => {
      const id = action.payload;
      state.articles = state.articles.filter(article => article._id !== id);
      state.userArticles = state.userArticles.filter(article => article._id !== id);
      state.featuredArticles = state.featuredArticles.filter(article => article._id !== id);
    },
    incrementViews: (state, action) => {
      const articleId = action.payload;
      if (state.currentArticle && state.currentArticle._id === articleId) {
        state.currentArticle.views = (state.currentArticle.views || 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles;
        state.totalPages = action.payload.pagination?.totalPages || 0;
        state.currentPage = action.payload.pagination?.currentPage || 1;
        state.totalArticles = action.payload.pagination?.totalArticles || 0;
        state.error = null;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Article by Slug
      .addCase(fetchArticleBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticleBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload;
        state.error = null;
      })
      .addCase(fetchArticleBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentArticle = null;
      })
      
      // Fetch Featured Articles
      .addCase(fetchFeaturedArticles.fulfilled, (state, action) => {
        state.featuredArticles = action.payload;
      })
      
      // Fetch Related Articles
      .addCase(fetchRelatedArticles.fulfilled, (state, action) => {
        state.relatedArticles = action.payload;
      })
      
      // Create Article
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.userArticles.unshift(action.payload.article);
        state.error = null;
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Article
      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        const updatedArticle = action.payload.article;
        
        // Update in userArticles
        const index = state.userArticles.findIndex(article => article._id === updatedArticle._id);
        if (index !== -1) {
          state.userArticles[index] = updatedArticle;
        }
        
        // Update current article if it matches
        if (state.currentArticle && state.currentArticle._id === updatedArticle._id) {
          state.currentArticle = updatedArticle;
        }
        
        state.error = null;
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Article
      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.userArticles = state.userArticles.filter(article => article._id !== deletedId);
        state.articles = state.articles.filter(article => article._id !== deletedId);
        state.error = null;
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch User Articles
      .addCase(fetchUserArticles.fulfilled, (state, action) => {
        state.userArticles = action.payload.articles;
      })
      
      // Search Articles
      .addCase(searchArticles.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchArticles.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.articles;
      })
      .addCase(searchArticles.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // Toggle Bookmark
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const { articleId, bookmarked } = action.payload;
        
        // Update current article
        if (state.currentArticle && state.currentArticle._id === articleId) {
          state.currentArticle.bookmarked = bookmarked;
        }
        
        // Update in articles list
        const articleIndex = state.articles.findIndex(article => article._id === articleId);
        if (articleIndex !== -1) {
          state.articles[articleIndex].bookmarked = bookmarked;
        }
      })
      
      // Fetch Bookmarks
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.bookmarks = action.payload.articles;
      })
      
      // Like Article
      .addCase(likeArticle.fulfilled, (state, action) => {
        const { articleId, likes, liked } = action.payload;
        
        // Update current article
        if (state.currentArticle && state.currentArticle._id === articleId) {
          state.currentArticle.likes = likes;
          state.currentArticle.liked = liked;
        }
        
        // Update in articles list
        const articleIndex = state.articles.findIndex(article => article._id === articleId);
        if (articleIndex !== -1) {
          state.articles[articleIndex].likes = likes;
          state.articles[articleIndex].liked = liked;
        }
      });
  },
});

export const {
  clearError,
  clearCurrentArticle,
  clearSearchResults,
  setFilters,
  resetFilters,
  updateArticleInList,
  removeArticleFromList,
  incrementViews,
} = articleSlice.actions;

export default articleSlice.reducer;