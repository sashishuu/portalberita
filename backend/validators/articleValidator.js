const { body, query } = require('express-validator');

// Article creation validation
const validateArticleCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]+$/)
    .withMessage('Title contains invalid characters'),
  
  body('content')
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage('Content must be between 100 and 10,000 characters'),
  
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either "draft" or "published"'),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        
        // Check maximum number of tags
        if (tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        
        // Check each tag length
        for (const tag of tags) {
          if (tag.length < 2 || tag.length > 20) {
            throw new Error('Each tag must be between 2 and 20 characters');
          }
          
          if (!/^[a-zA-Z0-9\s-]+$/.test(tag)) {
            throw new Error('Tags can only contain letters, numbers, spaces, and hyphens');
          }
        }
      }
      return true;
    })
];

// Article update validation
const validateArticleUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]+$/)
    .withMessage('Title contains invalid characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage('Content must be between 100 and 10,000 characters'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either "draft" or "published"'),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        
        if (tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        
        for (const tag of tags) {
          if (tag.length < 2 || tag.length > 20) {
            throw new Error('Each tag must be between 2 and 20 characters');
          }
          
          if (!/^[a-zA-Z0-9\s-]+$/.test(tag)) {
            throw new Error('Tags can only contain letters, numbers, spaces, and hyphens');
          }
        }
      }
      return true;
    })
];

// Article query validation
const validateArticleQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'title'])
    .withMessage('Sort must be one of: newest, oldest, popular, title'),
  
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]+$/)
    .withMessage('Search query contains invalid characters'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo'),
  
  query('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either "draft" or "published"')
];

module.exports = {
  validateArticleCreation,
  validateArticleUpdate,
  validateArticleQuery
};