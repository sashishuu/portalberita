const express = require('express');
const { body } = require('express-validator');
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByAuthor
} = require('../controllers/articleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadArticleImage, handleUploadError } = require('../middleware/uploadMiddleware');
const { sanitizeInput, sanitizeHTML } = require('../middleware/sanitizeMiddleware');
const { validateRequest, validateObjectId, validatePagination } = require('../middleware/validateRequest');
const { articleLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules for article creation
const articleValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        if (tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
      }
      return true;
    })
];

// Public routes
router.get('/', validatePagination, getArticles);
router.get('/:id', validateObjectId('id'), getArticleById);

// Protected routes
router.use(authMiddleware); // All routes below require authentication

router.get('/user/my-articles', validatePagination, getArticlesByAuthor);

router.post('/', 
  articleLimiter,
  uploadArticleImage,
  handleUploadError,
  sanitizeInput,
  sanitizeHTML,
  articleValidation,
  validateRequest,
  createArticle
);

router.put('/:id',
  validateObjectId('id'),
  uploadArticleImage,
  handleUploadError,
  sanitizeInput,
  sanitizeHTML,
  articleValidation,
  validateRequest,
  updateArticle
);

router.delete('/:id',
  validateObjectId('id'),
  deleteArticle
);

module.exports = router;