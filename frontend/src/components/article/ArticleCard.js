import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  BookmarkIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

const ArticleCard = ({ 
  article, 
  showAuthor = true, 
  showCategory = true, 
  showStats = true,
  showBookmark = false,
  size = 'medium',
  layout = 'vertical' 
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
    hover: {
      y: -4,
      transition: { duration: 0.2 }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  const truncateText = (text, limit) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder-article.jpg';
    return image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL}/${image}`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'max-w-sm',
          image: 'h-32',
          title: 'text-sm font-semibold',
          excerpt: 'text-xs',
          meta: 'text-xs',
        };
      case 'large':
        return {
          container: 'max-w-2xl',
          image: 'h-80',
          title: 'text-xl font-bold',
          excerpt: 'text-base',
          meta: 'text-sm',
        };
      default:
        return {
          container: 'max-w-md',
          image: 'h-48',
          title: 'text-base font-semibold',
          excerpt: 'text-sm',
          meta: 'text-xs',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (layout === 'horizontal') {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`${sizeClasses.container} card hover-lift overflow-hidden`}
      >
        <div className="flex">
          {/* Image */}
          <div className="flex-shrink-0 w-32 h-24 relative overflow-hidden">
            <motion.img
              variants={imageVariants}
              src={getImageUrl(article.image)}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {showCategory && article.category && (
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
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <Link to={`/article/${article.slug}`}>
                <h3 className={`${sizeClasses.title} text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2`}>
                  {article.title}
                </h3>
              </Link>

              {article.excerpt && (
                <p className={`${sizeClasses.excerpt} text-secondary-600 line-clamp-2`}>
                  {truncateText(article.excerpt, 100)}
                </p>
              )}

              {/* Meta */}
              <div className={`${sizeClasses.meta} text-secondary-500 space-y-1`}>
                {showAuthor && article.author && (
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-3 h-3" />
                    <span>{article.author.name}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{formatDate(article.createdAt)}</span>
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
      className={`${sizeClasses.container} card hover-lift overflow-hidden`}
    >
      {/* Image */}
      <div className={`${sizeClasses.image} relative overflow-hidden`}>
        <motion.img
          variants={imageVariants}
          src={getImageUrl(article.image)}
          alt={article.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {showCategory && article.category && (
          <div className="absolute top-3 left-3">
            <Link
              to={`/category/${article.category.slug}`}
              className="badge-primary text-xs px-2 py-1"
            >
              {article.category.name}
            </Link>
          </div>
        )}

        {showBookmark && (
          <div className="absolute top-3 right-3">
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
              {article.bookmarked ? (
                <BookmarkIconSolid className="w-4 h-4 text-primary-600" />
              ) : (
                <BookmarkIcon className="w-4 h-4 text-secondary-600" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-body space-y-3">
        <Link to={`/article/${article.slug}`}>
          <h3 className={`${sizeClasses.title} text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2`}>
            {article.title}
          </h3>
        </Link>

        {article.excerpt && (
          <p className={`${sizeClasses.excerpt} text-secondary-600 line-clamp-3`}>
            {truncateText(article.excerpt, size === 'large' ? 200 : 120)}
          </p>
        )}

        {/* Meta and Stats */}
        <div className="space-y-2">
          {showAuthor && article.author && (
            <div className={`${sizeClasses.meta} flex items-center space-x-2 text-secondary-500`}>
              {article.author.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
              <span>{article.author.name}</span>
              <span>•</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
          )}

          {showStats && (
            <div className={`${sizeClasses.meta} flex items-center justify-between`}>
              <div className="flex items-center space-x-4 text-secondary-500">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{article.views || 0}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{article.commentsCount || 0}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {article.liked ? (
                    <HeartIconSolid className="w-4 h-4 text-accent-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                  <span>{article.likes || 0}</span>
                </div>
              </div>

              {article.readTime && (
                <span className="text-secondary-500 text-xs">
                  {article.readTime} min baca
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;