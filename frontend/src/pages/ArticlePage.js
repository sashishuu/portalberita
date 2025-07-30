import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';

import {
  fetchArticleBySlug,
  fetchRelatedArticles,
  likeArticle,
  toggleBookmark,
  incrementViews,
  clearCurrentArticle,
} from '../store/slices/articleSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ArticleCard from '../components/article/ArticleCard';
import CommentSection from '../components/comment/CommentSection';
import ShareModal from '../components/common/ShareModal';
import socketService from '../services/socketService';

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  
  const { 
    currentArticle: article, 
    relatedArticles, 
    loading, 
    error 
  } = useSelector((state) => state.article);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  useEffect(() => {
    if (slug) {
      dispatch(fetchArticleBySlug(slug));
    }
    
    return () => {
      dispatch(clearCurrentArticle());
      socketService.leaveArticle(article?._id);
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (article) {
      // Join article room for real-time updates
      socketService.joinArticle(article._id);
      
      // Fetch related articles
      dispatch(fetchRelatedArticles({
        articleId: article._id,
        categoryId: article.category?._id,
      }));

      // Increment view count after 30 seconds
      const viewTimer = setTimeout(() => {
        dispatch(incrementViews(article._id));
      }, 30000);

      // Calculate estimated read time
      const wordCount = article.content?.split(' ').length || 0;
      const readTime = Math.ceil(wordCount / 200); // 200 words per minute
      setEstimatedReadTime(readTime);

      return () => {
        clearTimeout(viewTimer);
      };
    }
  }, [article, dispatch]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = window.pageYOffset;
        const scrollHeight = element.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await dispatch(likeArticle(article._id)).unwrap();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await dispatch(toggleBookmark(article._id)).unwrap();
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: id });
  };

  const formatRelativeDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder-article.jpg';
    return image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL}/${image}`;
  };

  const sanitizeContent = (content) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat artikel..." />
      </div>
    );
  }

  if (error || !article) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <ErrorMessage 
         message={error || "Artikel tidak ditemukan"} 
         onRetry={() => dispatch(fetchArticleBySlug(slug))}
       />
     </div>
   );
 }

 return (
   <>
     <Helmet>
       <title>{article.title} - Portal Berita</title>
       <meta name="description" content={article.excerpt || article.title} />
       <meta name="keywords" content={article.tags?.join(', ') || ''} />
       <meta name="author" content={article.author?.name || ''} />
       <meta property="og:title" content={article.title} />
       <meta property="og:description" content={article.excerpt || article.title} />
       <meta property="og:image" content={getImageUrl(article.image)} />
       <meta property="og:type" content="article" />
       <meta property="article:published_time" content={article.createdAt} />
       <meta property="article:author" content={article.author?.name || ''} />
       <meta property="article:section" content={article.category?.name || ''} />
       <meta property="article:tag" content={article.tags?.join(', ') || ''} />
       <link rel="canonical" href={`${window.location.origin}/article/${article.slug}`} />
     </Helmet>

     {/* Reading Progress Bar */}
     <div className="fixed top-0 left-0 right-0 h-1 bg-secondary-200 z-50">
       <motion.div
         className="h-full bg-primary-600"
         style={{ width: `${readingProgress}%` }}
         initial={{ width: 0 }}
         animate={{ width: `${readingProgress}%` }}
         transition={{ duration: 0.1 }}
       />
     </div>

     <div className="min-h-screen bg-white">
       <div className="container-custom py-8">
         <div className="max-w-4xl mx-auto">
           {/* Back Button */}
           <motion.button
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             onClick={() => navigate(-1)}
             className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 mb-6 transition-colors"
           >
             <ArrowLeftIcon className="w-5 h-5" />
             <span>Kembali</span>
           </motion.button>

           <article ref={contentRef} className="space-y-8">
             {/* Article Header */}
             <motion.header
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="space-y-6"
             >
               {/* Category */}
               {article.category && (
                 <div>
                   <Link
                     to={`/category/${article.category.slug}`}
                     className="inline-block badge-primary hover:bg-primary-700 transition-colors"
                   >
                     {article.category.name}
                   </Link>
                 </div>
               )}

               {/* Title */}
               <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900 leading-tight">
                 {article.title}
               </h1>

               {/* Excerpt */}
               {article.excerpt && (
                 <p className="text-xl text-secondary-600 leading-relaxed">
                   {article.excerpt}
                 </p>
               )}

               {/* Meta Information */}
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 py-4 border-y border-secondary-200">
                 <div className="flex items-center space-x-4">
                   {/* Author */}
                   <div className="flex items-center space-x-3">
                     {article.author?.avatar ? (
                       <img
                         src={article.author.avatar}
                         alt={article.author.name}
                         className="w-10 h-10 rounded-full object-cover"
                       />
                     ) : (
                       <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                         <UserIcon className="w-6 h-6 text-primary-600" />
                       </div>
                     )}
                     <div>
                       <p className="font-medium text-secondary-900">
                         {article.author?.name}
                       </p>
                       <p className="text-sm text-secondary-500">
                         {article.author?.role === 'admin' ? 'Editor' : 'Penulis'}
                       </p>
                     </div>
                   </div>

                   {/* Date & Read Time */}
                   <div className="hidden sm:block w-px h-10 bg-secondary-200" />
                   <div className="space-y-1">
                     <div className="flex items-center space-x-2 text-sm text-secondary-500">
                       <CalendarIcon className="w-4 h-4" />
                       <span>{formatDate(article.createdAt)}</span>
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-secondary-500">
                       <ClockIcon className="w-4 h-4" />
                       <span>{estimatedReadTime} menit baca</span>
                     </div>
                   </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center space-x-4">
                   {/* Views */}
                   <div className="flex items-center space-x-1 text-secondary-500">
                     <EyeIcon className="w-5 h-5" />
                     <span className="text-sm">{article.views || 0}</span>
                   </div>

                   {/* Like Button */}
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={handleLike}
                     className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                       article.liked
                         ? 'bg-accent-50 text-accent-600'
                         : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'
                     }`}
                   >
                     {article.liked ? (
                       <HeartIconSolid className="w-5 h-5" />
                     ) : (
                       <HeartIcon className="w-5 h-5" />
                     )}
                     <span className="text-sm">{article.likes || 0}</span>
                   </motion.button>

                   {/* Bookmark Button */}
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={handleBookmark}
                     className={`p-2 rounded-lg transition-colors ${
                       article.bookmarked
                         ? 'bg-primary-50 text-primary-600'
                         : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'
                     }`}
                   >
                     {article.bookmarked ? (
                       <BookmarkIconSolid className="w-5 h-5" />
                     ) : (
                       <BookmarkIcon className="w-5 h-5" />
                     )}
                   </motion.button>

                   {/* Share Button */}
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={handleShare}
                     className="p-2 bg-secondary-50 text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors"
                   >
                     <ShareIcon className="w-5 h-5" />
                   </motion.button>
                 </div>
               </div>
             </motion.header>

             {/* Featured Image */}
             {article.image && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.2 }}
                 className="relative"
               >
                 <img
                   src={getImageUrl(article.image)}
                   alt={article.title}
                   className="w-full h-64 sm:h-96 object-cover rounded-xl shadow-sm"
                 />
               </motion.div>
             )}

             {/* Article Content */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               className="article-content"
               dangerouslySetInnerHTML={{
                 __html: sanitizeContent(article.content),
               }}
             />

             {/* Tags */}
             {article.tags && article.tags.length > 0 && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.6 }}
                 className="flex items-start space-x-2 pt-6 border-t border-secondary-200"
               >
                 <TagIcon className="w-5 h-5 text-secondary-400 mt-0.5 flex-shrink-0" />
                 <div className="flex flex-wrap gap-2">
                   {article.tags.map((tag, index) => (
                     <span
                       key={index}
                       className="badge-secondary text-xs hover:bg-secondary-200 transition-colors cursor-pointer"
                     >
                       {tag}
                     </span>
                   ))}
                 </div>
               </motion.div>
             )}

             {/* Article Footer */}
             <motion.footer
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.8 }}
               className="flex items-center justify-between py-6 border-t border-secondary-200"
             >
               <div className="text-sm text-secondary-500">
                 Dipublish {formatRelativeDate(article.createdAt)}
                 {article.updatedAt !== article.createdAt && (
                   <span> • Diperbarui {formatRelativeDate(article.updatedAt)}</span>
                 )}
               </div>

               <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-1 text-secondary-500">
                   <ChatBubbleLeftIcon className="w-4 h-4" />
                   <span className="text-sm">{article.commentsCount || 0} komentar</span>
                 </div>
               </div>
             </motion.footer>
           </article>

           {/* Comments Section */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 1.0 }}
             className="mt-12"
           >
             <CommentSection
               articleId={article._id}
               articleSlug={article.slug}
               commentsCount={article.commentsCount || 0}
             />
           </motion.div>

           {/* Related Articles */}
           {relatedArticles && relatedArticles.length > 0 && (
             <motion.section
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 1.2 }}
               className="mt-16"
             >
               <h2 className="text-2xl font-bold text-secondary-900 mb-8">
                 Artikel Terkait
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {relatedArticles.slice(0, 3).map((relatedArticle) => (
                   <ArticleCard
                     key={relatedArticle._id}
                     article={relatedArticle}
                     showAuthor={true}
                     showCategory={false}
                     size="small"
                   />
                 ))}
               </div>
             </motion.section>
           )}
         </div>
       </div>
     </div>

     {/* Share Modal */}
     <ShareModal
       isOpen={isShareModalOpen}
       onClose={() => setIsShareModalOpen(false)}
       article={article}
       url={`${window.location.origin}/article/${article.slug}`}
     />
   </>
 );
};

export default ArticlePage;