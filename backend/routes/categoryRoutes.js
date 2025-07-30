const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getArticlesByCategory
} = require('../controllers/categoryController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/sanitizeMiddleware');
const { validateRequest, validateObjectId, validatePagination } = require('../middleware/validateRequest');

const router = express.Router();

// Validation rules for category
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

// Public routes
router.get('/', getCategories);
router.get('/:id', validateObjectId('id'), getCategoryById);
router.get('/:id/articles', 
  validateObjectId('id'), 
  validatePagination, 
  getArticlesByCategory
);

// Admin only routes
router.use(authMiddleware, isAdmin); // All routes below require admin authentication

router.post('/',
  sanitizeInput,
  categoryValidation,
  validateRequest,
  createCategory
);

router.put('/:id',
  validateObjectId('id'),
  sanitizeInput,
  categoryValidation,
  validateRequest,
  updateCategory
);

router.delete('/:id',
  validateObjectId('id'),
  deleteCategory
);

module.exports = router;