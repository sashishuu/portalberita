const express = require('express');
const {
  getCommentsByArticle,
  createComment,
  updateComment,
  deleteComment,
  getUserComments
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/sanitizeMiddleware');
const { 
  validateCommentCreation, 
  validateCommentUpdate, 
  checkValidationResult,
  detectSpam 
} = require('../middleware/validateComment');
const { validateObjectId, validatePagination } = require('../middleware/validateRequest');
const { commentLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.get('/article/:articleId', 
  validateObjectId('articleId'),
  validatePagination,
  getCommentsByArticle
);

// Protected routes
router.use(authMiddleware); // All routes below require authentication

router.get('/user/my-comments', validatePagination, getUserComments);

router.post('/',
  commentLimiter,
  sanitizeInput,
  detectSpam,
  validateCommentCreation,
  checkValidationResult,
  createComment
);

router.put('/:id',
  validateObjectId('id'),
  sanitizeInput,
  detectSpam,
  validateCommentUpdate,
  checkValidationResult,
  updateComment
);

router.delete('/:id',
  validateObjectId('id'),
  deleteComment
);

module.exports = router;