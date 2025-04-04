const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { validateCategory } = require('../validators/categoryValidator');
const validateRequest = require('../middleware/validateRequest');

router.get('/', getAllCategories);

router.post(
  '/',
  authMiddleware,
  isAdmin,
  validateCategory,
  validateRequest,
  createCategory
);

router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  validateCategory,
  validateRequest,
  updateCategory
);

router.delete('/:id', authMiddleware, isAdmin, deleteCategory);

module.exports = router;
