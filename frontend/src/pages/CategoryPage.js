import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  TagIcon,
  FunnelIcon,
  ArrowLeftIcon,
  CalendarIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';

import { fetchArticlesByCategory } from '../store/slices/articleSlice';
import { fetchCategoryBySlug, fetchCategories } from '../store/slices/categorySlice';
import ArticleCard from '../components/article/ArticleCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  
  const { articles, loading, error, totalPages, currentPage } = useSelector(state => state.article);
  const { currentCategory, categories, loading: categoryLoading } = useSelector(state => state.category);

  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(fetchCategoryBySlug(slug));
      dispatch(fetchCategories());
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (currentCategory) {
      dispatch(fetchArticlesByCategory({
        categoryId: currentCategory._id,
        sort: sortBy,
        page,
        limit: 12,
      }));
    }
  }, [currentCategory, sortBy, page, dispatch]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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

  if (categoryLoading || (!currentCategory && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat kategori..." />
      </div>
    );
  }

  if (error && !currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="Kategori tidak ditemukan" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentCategory?.name || 'Kategori'} - Portal Berita</title>
        <meta 
          name="description" 
          content={`Baca artikel terbaru dalam kategori ${currentCategory?.name} di Portal Berita`} 
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="container-custom py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center space-x-4 mb-6">
                <Link
                  to="/"
                  className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-secondary-900 flex items-center space-x-3">
                    <div className={`w-10 h-10 ${currentCategory?.color || 'bg-primary-600'} rounded-lg flex items-center justify-center`}>
                      <TagIcon className="w-6 h-6 text-white" />
                    </div>
                    <span>{currentCategory?.name}</span>
                  </h1>
                  {currentCategory?.description && (
                    <p className="text-secondary-600 mt-2 max-w-2xl">
                      {currentCategory.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-600">Total Artikel</p>
                      <p className="text-2xl font-bold text-primary-900 mt-1">
                        {currentCategory?.articleCount || 0}
                      </p>
                    </div>
                    <TagIcon className="w-8 h-8 text-primary-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Artikel Bulan Ini</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {currentCategory?.monthlyCount || 0}
                      </p>
                    </div>
                    <CalendarIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Trending</p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">
                        #{currentCategory?.trendingRank || '-'}
                      </p>
                    </div>
                    <TrendingUpIcon className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filter & Sort */}
            <motion.div variants={itemVariants} className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
              <div className="flex items-center space-x-4">
                <FunnelIcon className="w-5 h-5 text-secondary-600" />
                <span className="font-medium text-secondary-900">Urutkan:</span>
                <div className="flex space-x-2">
                  {[
                    { value: 'newest', label: 'Terbaru' },
                    { value: 'popular', label: 'Populer' },
                    { value: 'oldest', label: 'Terlama' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === option.value
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-secondary-600 hover:bg-secondary-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm text-secondary-600">
                {articles.length} artikel
              </div>
            </motion.div>

            {/* Articles Grid */}
            <motion.div variants={itemVariants}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
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
              ) : error ? (
                <ErrorMessage 
                  message={error} 
                  onRetry={() => dispatch(fetchArticlesByCategory({
                    categoryId: currentCategory._id,
                    sort: sortBy,
                    page,
                    limit: 12,
                  }))}
                />
              ) : articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article._id}
                      article={article}
                      showAuthor={true}
                      showCategory={false}
                      showStats={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`w-20 h-20 ${currentCategory?.color || 'bg-primary-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <TagIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    Belum Ada Artikel
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Belum ada artikel dalam kategori {currentCategory?.name}
                  </p>
                  <Link
                    to="/categories"
                    className="btn-outline"
                  >
                    Lihat Kategori Lain
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-2 text-sm text-secondary-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm rounded ${
                            page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'text-secondary-600 hover:bg-secondary-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-2 text-sm text-secondary-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* Related Categories */}
            {categories.length > 1 && (
              <motion.div variants={itemVariants} className="bg-secondary-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Kategori Lainnya
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categories
                    .filter(cat => cat._id !== currentCategory?._id)
                    .slice(0, 6)
                    .map((category) => (
                      <Link
                        key={category._id}
                        to={`/category/${category.slug}`}
                        className="flex items-center space-x-2 p-3 bg-white rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        <div className={`w-6 h-6 ${category.color || 'bg-secondary-400'} rounded`} />
                        <span className="font-medium text-sm">{category.name}</span>
                      </Link>
                    ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;