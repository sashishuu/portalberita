import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  UserIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

import {
  fetchCommentsByArticle,
  createComment,
  updateComment,
  deleteComment,
  clearComments,
} from '../../store/slices/commentSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import socketService from '../../services/socketService';

// Validation schema for comments
const commentSchema = yup.object({
  content: yup
    .string()
    .min(10, 'Komentar minimal 10 karakter')
    .max(500, 'Komentar maksimal 500 karakter')
    .required('Komentar wajib diisi'),
});

const CommentItem = ({ comment, currentUser, onEdit, onDelete, onReport, level = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      await onEdit(comment._id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  const canEditOrDelete = currentUser && (
    currentUser.id === comment.author._id || 
    currentUser.role === 'admin'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex space-x-3 ${level > 0 ? 'ml-12 pt-4' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.author?.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary-600" />
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-secondary-50 rounded-lg px-4 py-3">
          {/* Author & Date */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-secondary-900 text-sm">
                {comment.author?.name}
              </h4>
              {comment.author?.role === 'admin' && (
                <span className="badge-primary text-xs px-2 py-0.5">
                  Admin
                </span>
              )}
              <span className="text-xs text-secondary-500">
                {formatDate(comment.createdAt)}
              </span>
              {comment.createdAt !== comment.updatedAt && (
                <span className="text-xs text-secondary-400">(diedit)</span>
              )}
            </div>

            {/* Menu */}
            {(canEditOrDelete || currentUser) && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-secondary-400 hover:text-secondary-600 rounded transition-colors"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-32 bg-white border border-secondary-200 rounded-lg shadow-lg py-1 z-10"
                    >
                      {canEditOrDelete && (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              onDelete(comment._id);
                              setShowMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-accent-600 hover:bg-accent-50 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                            <span>Hapus</span>
                          </button>
                        </>
                      )}
                      {currentUser && currentUser.id !== comment.author._id && (
                        <button
                          onClick={() => {
                            onReport(comment._id);
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                          <FlagIcon className="w-4 h-4" />
                          <span>Laporkan</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="3"
                maxLength="500"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary-500">
                  {editContent.length}/500
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-secondary-600 hover:text-secondary-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!editContent.trim() || editContent === comment.content}
                    className="text-xs btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-secondary-700 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CommentSection = ({ articleId, articleSlug, commentsCount = 0 }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { 
    comments, 
    loading, 
    error,
    totalComments,
  } = useSelector((state) => state.comment);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const watchedContent = watch('content');

  // Load comments on mount
  useEffect(() => {
    if (articleId) {
      dispatch(fetchCommentsByArticle({ articleId, page: 1 }));
    }

    return () => {
      dispatch(clearComments());
    };
  }, [articleId, dispatch]);

  // Socket listeners for real-time updates
  useEffect(() => {
    const handleNewComment = (data) => {
      if (data.article === articleId) {
        // Refresh comments or add new comment to state
        dispatch(fetchCommentsByArticle({ articleId, page: 1 }));
      }
    };

    const handleCommentUpdated = (data) => {
      if (data.article === articleId) {
        dispatch(fetchCommentsByArticle({ articleId, page: 1 }));
      }
    };

    const handleCommentDeleted = (data) => {
      if (data.article === articleId) {
        dispatch(fetchCommentsByArticle({ articleId, page: 1 }));
      }
    };

    const handleUserTyping = (data) => {
      if (data.articleId === articleId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          const exists = prev.find(u => u.userId === data.userId);
          if (!exists) {
            return [...prev, data];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.articleId === articleId) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    };

    window.addEventListener('newComment', handleNewComment);
    window.addEventListener('commentUpdated', handleCommentUpdated);
    window.addEventListener('commentDeleted', handleCommentDeleted);
    window.addEventListener('userTyping', handleUserTyping);
    window.addEventListener('userStoppedTyping', handleUserStoppedTyping);

    return () => {
      window.removeEventListener('newComment', handleNewComment);
      window.removeEventListener('commentUpdated', handleCommentUpdated);
      window.removeEventListener('commentDeleted', handleCommentDeleted);
      window.removeEventListener('userTyping', handleUserTyping);
      window.removeEventListener('userStoppedTyping', handleUserStoppedTyping);
    };
  }, [articleId, dispatch, user?.id]);

  // Handle typing indicators
  useEffect(() => {
    if (watchedContent && isAuthenticated && user) {
      // Send typing start
      socketService.startTyping(articleId, user.id, user.name);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(articleId, user.id);
      }, 1000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [watchedContent, articleId, isAuthenticated, user]);

  const onSubmit = async (data) => {
    try {
      await dispatch(createComment({
        content: data.content,
        article: articleId,
      })).unwrap();
      reset();
    } catch (error) {
      console.error('Comment creation error:', error);
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      await dispatch(updateComment({ commentId, content })).unwrap();
    } catch (error) {
      console.error('Comment update error:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
      try {
        await dispatch(deleteComment(commentId)).unwrap();
      } catch (error) {
        console.error('Comment deletion error:', error);
      }
    }
  };

  const handleReportComment = (commentId) => {
    // TODO: Implement comment reporting
    console.log('Report comment:', commentId);
  };

  const loadMoreComments = () => {
    const nextPage = page + 1;
    dispatch(fetchCommentsByArticle({ articleId, page: nextPage }));
    setPage(nextPage);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <ChatBubbleLeftIcon className="w-6 h-6 text-secondary-600" />
        <h2 className="text-xl font-bold text-secondary-900">
          Komentar ({totalComments || commentsCount})
        </h2>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary-50 rounded-lg p-4"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  {...register('content')}
                  rows="3"
                  className="w-full form-textarea resize-none"
                  placeholder="Tulis komentar Anda..."
                  maxLength="500"
                />
                {errors.content && (
                  <p className="form-error">{errors.content.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-secondary-500">
                  {watchedContent?.length || 0}/500
                </span>
                {typingUsers.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-secondary-500">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <span>
                      {typingUsers.length === 1
                        ? `${typingUsers[0].userName} sedang mengetik...`
                        : `${typingUsers.length} orang sedang mengetik...`
                      }
                    </span>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !watchedContent?.trim()}
                className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                    Kirim
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="bg-secondary-50 rounded-lg p-4 text-center">
          <p className="text-secondary-600 mb-3">
            Masuk untuk bergabung dalam diskusi
          </p>
          <Link
            to="/login"
            className="btn-primary btn-sm"
          >
            Masuk Sekarang
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={user}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReport={handleReportComment}
            />
          ))}
        </AnimatePresence>

       {/* Loading Comments */}
       {loading && comments.length === 0 && (
         <div className="flex justify-center py-8">
           <LoadingSpinner text="Memuat komentar..." />
         </div>
       )}

       {/* Empty State */}
       {!loading && comments.length === 0 && (
         <div className="text-center py-8">
           <ChatBubbleLeftIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
           <p className="text-secondary-500">
             Belum ada komentar. Jadilah yang pertama berkomentar!
           </p>
         </div>
       )}

       {/* Load More Button */}
       {hasMore && comments.length > 0 && (
         <div className="text-center">
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={loadMoreComments}
             disabled={loading}
             className="btn-outline"
           >
             {loading ? (
               <LoadingSpinner size="small" />
             ) : (
               'Muat Lebih Banyak'
             )}
           </motion.button>
         </div>
       )}

       {/* Error State */}
       {error && (
         <div className="text-center py-4">
           <p className="text-accent-600 text-sm">{error}</p>
         </div>
       )}
     </div>
   </section>
 );
};

export default CommentSection;