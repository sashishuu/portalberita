import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const FeaturedArticleCard = ({ 
  article, 
  size = 'large', 
  layout = 'vertical',
  showExcerpt = false 
}) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    hover: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.3 }
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder-article.jpg';
    return image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL}/${image}`;
  };

  const truncateText = (text, limit) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  if (size === 'small' || layout === 'horizontal') {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="card overflow-hidden hover-lift"
      >
        <div className="flex h-32">
          {/* Image */}
          <div className="flex-shrink-0 w-40 relative overflow-hidden">
            <img
              src={getImageUrl(article.image)}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {article.category && (
              <div className="absolute top-2 left-2">
                <Link
                  to={`/category/${article.category.slug}`}
                  className="badge-primary text-xs px-2 py-1"
                >
                  {article.category.name}
                </Link>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <Link to={`/article/${article.slug}`}>
                <h3 className="text-sm font-semibold text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
              </Link>
            </div>

            <div className="space-y-2">
              {/* Author & Date */}
              <div className="flex items-center space-x-2 text-xs text-secondary-500">
                {article.author?.avatar ? (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-3 h-3" />
                )}
                <span>{article.author?.name}</span>
                <span>•</span>
                <span>{formatDate(article.createdAt)}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-3 text-xs text-secondary-500">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>{article.views || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-3 h-3" />
                  <span>{article.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden group cursor-pointer"
    >
      <Link to={`/article/${article.slug}`}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(article.image)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Overlay */}
        <motion.div
          variants={overlayVariants}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90"
        />

        {/* Content */}
        <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end text-white">
          {/* Category */}
          {article.category && (
            <div className="mb-4">
              <Link
                to={`/category/${article.category.slug}`}
                className="inline-block bg-primary-600 text-white text-sm px-3 py-1 rounded-full hover:bg-primary-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {article.category.name}
              </Link>
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-primary-200 transition-colors">
            {article.title}
          </h2>

          {/* Excerpt */}
          {showExcerpt && article.excerpt && (
            <p className="text-gray-200 text-sm lg:text-base mb-4 line-clamp-2">
              {truncateText(article.excerpt, 150)}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Author */}
              {article.author && (
                <div className="flex items-center space-x-2">
                  {article.author.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{article.author.name}</span>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center space-x-1 text-sm text-gray-300">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <EyeIcon className="w-4 h-4" />
                <span>{article.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{article.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default FeaturedArticleCard;