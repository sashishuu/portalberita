import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import articleSlice from './slices/articleSlice';
import categorySlice from './slices/categorySlice';
import commentSlice from './slices/commentSlice';
import userSlice from './slices/userSlice';
import themeSlice from './slices/themeSlice';
import notificationSlice from './slices/notificationSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme'], // Only persist auth and theme
  blacklist: ['article', 'comment'], // Don't persist these for fresh data
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  article: articleSlice,
  category: categorySlice,
  comment: commentSlice,
  user: userSlice,
  theme: themeSlice,
  notification: notificationSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

export default store;