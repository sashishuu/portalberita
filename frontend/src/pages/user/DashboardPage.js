import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  BookmarkIcon,
  UserIcon,
  CalendarIcon,
  TrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { fetchUserArticles } from '../../store/slices/articleSlice';
import { fetchBookmarks } from '../../store/slices/articleSlice';
import { fetchUserComments } from '../../store/slices/commentSlice';
import ArticleCard from '../../components/article/ArticleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const StatCard = ({ icon: Icon, title, value, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userArticles, bookmarks, loading } = useSelector((state) => state.article);
  const { userComments } = useSelector((state) => state.comment);

  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    // Fetch user data
    dispatch(fetchUserArticles({ limit: 5 }));
    dispatch(fetchBookmarks({ limit: 5 }));
    dispatch(fetchUserComments({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    // Calculate stats from user articles
    if (userArticles.length > 0) {
      const totalViews = userArticles.reduce((sum, article) => sum + (article.views || 0), 0);
      const totalLikes = userArticles.reduce((sum, article) => sum + (article.likes || 0), 0);
      const totalComments = userArticles.reduce((sum, article) => sum + (article.commentsCount || 0), 0);

      setStats({
        totalArticles: userArticles.length,
        totalViews,
        totalLikes,
        totalComments,
      });
    }
  }, [userArticles]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Portal Berita</title>
        <meta name="description" content={`Dashboard ${user?.name} di Portal Berita`} />
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="container-custom py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">
                  Selamat datang, {user?.name}!
                </h1>
                <p className="text-secondary-600 mt-1">
                  Kelola artikel dan pantau aktivitas Anda di sini
                </p>
              </div>
              <Link
                to="/create-article"
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Tulis Artikel</span>
              </Link>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                icon={DocumentTextIcon}
                title="Total Artikel"
                value={stats.totalArticles}
                color="primary"
              />
              <StatCard
                icon={EyeIcon}
                title="Total Views"
                value={stats.totalViews.toLocaleString()}
                color="green"
              />
              <StatCard
                icon={HeartIcon}
                title="Total Likes"
                value={stats.totalLikes}
                color="accent"
              />
              <StatCard
                icon={ChatBubbleLeftIcon}
                title="Total Komentar"
                value={stats.totalComments}
                color="secondary"
              />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Articles */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-secondary-900">
                    Artikel Terbaru Anda
                  </h2>
                  <Link
                    to="/my-articles"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Lihat Semua
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="card p-4">
                        <div className="flex space-x-4">
                          <div className="w-20 h-16 bg-secondary-200 rounded skeleton" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-secondary-200 rounded skeleton" />
                            <div className="h-3 bg-secondary-200 rounded skeleton w-3/4" />
                            <div className="h-3 bg-secondary-200 rounded skeleton w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userArticles.length > 0 ? (
                  <div className="space-y-4">
                    {userArticles.slice(0, 5).map((article) => (
                      <motion.div
                        key={article._id}
                        whileHover={{ x: 4 }}
                        className="card p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          {article.image && (
                            <img
                              src={article.image.startsWith('http') 
                                ? article.image 
                                : `${process.env.REACT_APP_API_URL}/${article.image}`
                              }
                              alt={article.title}
                              className="w-20 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/article/${article.slug}`}
                              className="block"
                            >
                              <h3 className="font-medium text-secondary-900 hover:text-primary-600 transition-colors line-clamp-1">
                                {article.title}
                              </h3>
                            </Link>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                              <div className="flex items-center space-x-1">
                                <EyeIcon className="w-4 h-4" />
                                <span>{article.views || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <HeartIcon className="w-4 h-4" />
                                <span>{article.likes || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ChatBubbleLeftIcon className="w-4 h-4" />
                                <span>{article.commentsCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{formatDate(article.createdAt)}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className={`badge ${
                                article.status === 'published' 
                                  ? 'badge-success' 
                                  : 'badge-warning'
                              }`}>
                                {article.status === 'published' ? 'Dipublikasi' : 'Draft'}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/edit-article/${article._id}`}
                              className="btn-ghost btn-sm"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center">
                    <DocumentTextIcon className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                      Belum Ada Artikel
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      Mulai menulis artikel pertama Anda dan bagikan dengan dunia
                    </p>
                    <Link
                      to="/create-article"
                      className="btn-primary"
                    >
                      Tulis Artikel Pertama
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Sidebar */}
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Profile Card */}
                <div className="card p-6">
                  <div className="text-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-10 h-10 text-primary-600" />
                      </div>
                    )}
                    <h3 className="font-bold text-secondary-900">{user?.name}</h3>
                    <p className="text-secondary-600 text-sm mb-4">{user?.email}</p>
                    <div className="flex items-center justify-center space-x-1 text-sm text-secondary-500 mb-4">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Bergabung {formatDate(user?.createdAt)}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="btn-outline btn-sm w-full"
                    >
                      Edit Profil
                    </Link>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card p-6">
                  <h3 className="font-bold text-secondary-900 mb-4">Aksi Cepat</h3>
                  <div className="space-y-2">
                    <Link
                      to="/create-article"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5 text-primary-600" />
                      <span className="text-secondary-700">Tulis Artikel Baru</span>
                    </Link>
                    <Link
                      to="/my-articles"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <DocumentTextIcon className="w-5 h-5 text-secondary-600" />
                      <span className="text-secondary-700">Kelola Artikel</span>
                    </Link>
                    <Link
                      to="/bookmarks"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <BookmarkIcon className="w-5 h-5 text-secondary-600" />
                      <span className="text-secondary-700">Artikel Tersimpan</span>
                    </Link>
                  </div>
                </div>

                {/* Recent Bookmarks */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-secondary-900">Bookmark Terbaru</h3>
                    <Link
                      to="/bookmarks"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                  
                  {bookmarks.length > 0 ? (
                    <div className="space-y-3">
                      {bookmarks.slice(0, 3).map((article) => (
                        <Link
                          key={article._id}
                          to={`/article/${article.slug}`}
                          className="block p-3 rounded-lg hover:bg-secondary-50 transition-colors"
                        >
                          <h4 className="font-medium text-secondary-900 text-sm line-clamp-2 mb-1">
                            {article.title}
                          </h4>
                          <p className="text-xs text-secondary-500">
                            {formatDate(article.createdAt)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-500 text-sm text-center py-4">
                      Belum ada artikel yang disimpan
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;