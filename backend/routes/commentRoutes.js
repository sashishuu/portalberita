const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { commentLimiter } = require('../middleware/rateLimiter');
const { validateCommentInput } = require('../middleware/validateComment');

module.exports = (io) => {
  const router = express.Router();
  const commentController = require('../controllers/commentController'); // inject io ke controller

  // Public: mendapatkan komentar (bisa pakai query ?articleId=...)
  router.get('/', commentController.getAllComments);

  // Protected: membuat komentar
  router.post(
    '/',
    authMiddleware,
    commentLimiter,
    validateCommentInput,
    commentController.createComment
  );

  // Protected: menghapus komentar
  router.delete('/:id', authMiddleware, commentController.deleteComment);

  return router;
};
