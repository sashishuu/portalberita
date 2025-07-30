import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FireIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

import { fetchArticles, fetchFeaturedArticles } from '../store/slices/articleSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ArticleCard from '../components/article/ArticleCard';
import FeaturedArticleCard from '../components/article/FeaturedArticleCard';
import CategoryCard from '../components/category/CategoryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import NewsletterSignup from '../components/common/NewsletterSignup';

const HomePage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('latest');

  const {
    articles,
    featuredArticles,
    loading,
    error
  } = useSelector((state) => state.article);

  const {
    categories,
    loading: categoriesLoading
  } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchFeaturedArticles());
    dispatch(fetchCategories());
    dispatch(fetchArticles({ sort: 'newest', limit: 12 }));
  }, [dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const sortParam = tab === 'latest' ? 'newest' : 'popular';
    dispatch(fetchArticles({ sort: sortParam, limit: 12 }));
  };

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
      transition: {
        duration: 0.6,
      },
    },
  };

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Portal Berita - Berita Terkini dan Terpercaya</title>
        <meta name="description" content="Baca berita terkini dan terpercaya dari berbagai kategori. Portal berita Indonesia yang menyajikan informasi akurat dan berimbang." />
        <meta name="keywords" content="berita terkini, berita indonesia, portal berita, news, breaking news" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container-custom py-8 space-y-12"
        >
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900">
                Berita Utama
              </h2>
              <Link
                to="/featured"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span className="text-sm font-medium">Lihat Semua</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FeaturedArticleCard
                    article={featuredArticles[0]}
                    size="large"
                    showExcerpt={true}
                  />
                </div>

                <div className="space-y-4">
                  {featuredArticles.slice(1, 3).map((article) => (
                    <FeaturedArticleCard
                      key={article._id}
                      article={article}
                      size="small"
                      layout="horizontal"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-96 bg-secondary-100 rounded-xl flex items-center justify-center">
                <p className="text-secondary-500">Belum ada berita utama</p>
              </div>
            )}
          </motion.section>

          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900">
                Kategori Berita
              </h2>
              <Link
                to="/categories"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span className="text-sm font-medium">Lihat Semua</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-24 bg-secondary-100 rounded-lg skeleton" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((category) => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            )}
          </motion.section>

          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => handleTabChange('latest')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'latest'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <ClockIcon className="w-4 h-4" />
                  <span>Terbaru</span>
                </button>
                <button
                  onClick={() => handleTabChange('popular')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'popular'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <FireIcon className="w-4 h-4" />
                  <span>Populer</span>
                </button>
              </div>

              <Link
                to={activeTab === 'latest' ? '/latest' : '/popular'}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span className="text-sm font-medium">Lihat Semua</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="h-48 bg-secondary-100 rounded-lg skeleton" />
                    <div className="space-y-2">
                      <div className="h-4 bg-secondary-100 rounded skeleton" />
                      <div className="h-4 bg-secondary-100 rounded skeleton w-3/4" />
                      <div className="h-3 bg-secondary-100 rounded skeleton w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            )}

            {articles.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-secondary-500">Belum ada artikel tersedia</p>
              </div>
            )}
          </motion.section>

          <motion.section variants={itemVariants} className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3 mx-auto">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold mb-1">1000+</div>
                <div className="text-primary-100 text-sm">Artikel Terbaru</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3 mx-auto">
                  <EyeIcon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold mb-1">50K+</div>
                <div className="text-primary-100 text-sm">Pembaca Harian</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3 mx-auto">
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold mb-1">5K+</div>
                <div className="text-primary-100 text-sm">Diskusi Aktif</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3 mx-auto">
                  <FireIcon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold mb-1">20+</div>
                <div className="text-primary-100 text-sm">Kategori Berita</div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <NewsletterSignup />
          </motion.section>
        </motion.div>
      </div>
    </>
  );
};

export default HomePage;