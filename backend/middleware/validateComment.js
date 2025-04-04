const { body, validationResult } = require('express-validator');

exports.validateCommentInput = [
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 10 }).withMessage('Comment must be at least 10 characters long'),

  body('article')
    .notEmpty().withMessage('Article ID is required')
    .isMongoId().withMessage('Invalid article ID'),

  // Middleware handler to catch validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
