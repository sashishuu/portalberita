const { body } = require('express-validator');

const validateArticle = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
];

module.exports = { validateArticle };
