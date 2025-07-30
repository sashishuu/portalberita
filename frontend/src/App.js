import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Redux actions
import { checkAuth } from './store/slices/authSlice';
import { fetchCategories } from './store/slices/categorySlice';

// Socket
import { initializeSocket } from './services/socketService';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ArticlePage = React.lazy(() => import('./pages/ArticlePage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/auth/VerifyEmailPage'));
const ProfilePage = React.lazy(() => import('./pages/user/ProfilePage'));
const DashboardPage = React.lazy(() => import('./pages/user/DashboardPage'));
const CreateArticlePage = React.lazy(() => import('./pages/user/CreateArticlePage'));
const EditArticlePage = React.lazy(() => import('./pages/user/EditArticlePage'));
const MyArticlesPage = React.lazy(() => import('./pages/user/MyArticlesPage'));
const BookmarksPage = React.lazy(() => import('./pages/user/BookmarksPage'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminArticlesPage = React.lazy(() => import('./pages/admin/AdminArticlesPage'));
const AdminCategoriesPage = React.lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminCommentsPage = React.lazy(() => import('./pages/admin/AdminCommentsPage'));
const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuth());
    
    // Fetch categories for navigation
    dispatch(fetchCategories());

    // Initialize socket connection if authenticated
    if (isAuthenticated) {
      initializeSocket();
    }
  }, [dispatch, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Portal Berita - Berita Terkini dan Terpercaya</title>
        <meta name="description" content="Portal berita terlengkap dengan berita terkini, akurat, dan terpercaya dari berbagai kategori. Baca berita Indonesia dan internasional di sini." />
        <meta name="keywords" content="berita, news, portal berita, berita terkini, berita indonesia, berita internasional" />
        <meta name="author" content="Portal Berita Team" />
        <meta property="og:title" content="Portal Berita - Berita Terkini dan Terpercaya" />
        <meta property="og:description" content="Portal berita terlengkap dengan berita terkini, akurat, dan terpercaya dari berbagai kategori." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:image" content={`${window.location.origin}/logo512.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Portal Berita - Berita Terkini dan Terpercaya" />
        <meta name="twitter:description" content="Portal berita terlengkap dengan berita terkini, akurat, dan terpercaya dari berbagai kategori." />
        <meta name="twitter:image" content={`${window.location.origin}/logo512.png`} />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

      <ScrollToTop />
      
      <Layout>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <motion.div
                    key="home"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <HomePage />
                  </motion.div>
                } 
              />
              
              <Route 
                path="/article/:slug" 
                element={
                  <motion.div
                    key="article"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <ArticlePage />
                  </motion.div>
                } 
              />
              
              <Route 
                path="/category/:slug" 
                element={
                  <motion.div
                    key="category"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <CategoryPage />
                  </motion.div>
                } 
              />
              
              <Route 
                path="/search" 
                element={
                  <motion.div
                    key="search"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <SearchPage />
                  </motion.div>
                } 
              />

              {/* Auth Routes - Redirect if already authenticated */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <motion.div
                      key="login"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <LoginPage />
                    </motion.div>
                  )
                } 
              />
              
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <motion.div
                      key="register"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <RegisterPage />
                    </motion.div>
                  )
                } 
              />
              
              <Route 
                path="/forgot-password" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <motion.div
                      key="forgot-password"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ForgotPasswordPage />
                    </motion.div>
                  )
                } 
              />
              
              <Route 
                path="/reset-password/:token" 
                element={
                  <motion.div
                    key="reset-password"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <ResetPasswordPage />
                  </motion.div>
                } 
              />
              
              <Route 
                path="/verify-email/:token" 
                element={
                  <motion.div
                    key="verify-email"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <VerifyEmailPage />
                  </motion.div>
                } 
              />

              {/* Protected User Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="dashboard"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <DashboardPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="profile"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ProfilePage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/create-article" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="create-article"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <CreateArticlePage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/edit-article/:id" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="edit-article"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <EditArticlePage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/my-articles" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="my-articles"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MyArticlesPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/bookmarks" 
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="bookmarks"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <BookmarksPage />
                    </motion.div>
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
               path="/admin" 
               element={
                 <AdminRoute>
                   <motion.div
                     key="admin-dashboard"
                     initial="initial"
                     animate="in"
                     exit="out"
                     variants={pageVariants}
                     transition={pageTransition}
                   >
                     <AdminDashboard />
                   </motion.div>
                 </AdminRoute>
               } 
             />
             
             <Route 
               path="/admin/users" 
               element={
                 <AdminRoute>
                   <motion.div
                     key="admin-users"
                     initial="initial"
                     animate="in"
                     exit="out"
                     variants={pageVariants}
                     transition={pageTransition}
                   >
                     <AdminUsersPage />
                   </motion.div>
                 </AdminRoute>
               } 
             />
             
             <Route 
               path="/admin/articles" 
               element={
                 <AdminRoute>
                   <motion.div
                     key="admin-articles"
                     initial="initial"
                     animate="in"
                     exit="out"
                     variants={pageVariants}
                     transition={pageTransition}
                   >
                     <AdminArticlesPage />
                   </motion.div>
                 </AdminRoute>
               } 
             />
             
             <Route 
               path="/admin/categories" 
               element={
                 <AdminRoute>
                   <motion.div
                     key="admin-categories"
                     initial="initial"
                     animate="in"
                     exit="out"
                     variants={pageVariants}
                     transition={pageTransition}
                   >
                     <AdminCategoriesPage />
                   </motion.div>
                 </AdminRoute>
               } 
             />
             
             <Route 
               path="/admin/comments" 
               element={
                 <AdminRoute>
                   <motion.div
                     key="admin-comments"
                     initial="initial"
                     animate="in"
                     exit="out"
                     variants={pageVariants}
                     transition={pageTransition}
                   >
                     <AdminCommentsPage />
                   </motion.div>
                 </AdminRoute>
               } 
             />
             
             <Route 
               path="/admin/analytics" 
               element={
                 <AdminRoute>
                   <motion.div
                     key="admin-analytics"
                     initial="initial"
                     animate="in"
                     exit="out"
                     variants={pageVariants}
                     transition={pageTransition}
                   >
                     <AdminAnalyticsPage />
                   </motion.div>
                 </AdminRoute>
               } 
             />

             {/* 404 Route */}
             <Route 
               path="*" 
               element={
                 <motion.div
                   key="not-found"
                   initial="initial"
                   animate="in"
                   exit="out"
                   variants={pageVariants}
                   transition={pageTransition}
                 >
                   <NotFoundPage />
                 </motion.div>
               } 
             />
           </Routes>
         </AnimatePresence>
       </Suspense>
     </Layout>
   </ErrorBoundary>
 );
}

export default App;