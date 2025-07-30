const { body, query } = require('express-validator');

// Category creation validation
const validateCategoryCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, and hyphens')
    .custom((value) => {
      // Check for reserved names
      const reservedNames = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'test'];
      if (reservedNames.includes(value.toLowerCase())) {
        throw new Error('Category name is reserved');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]*$/)
    .withMessage('Description contains invalid characters')
];

// Category update validation
const validateCategoryUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, and hyphens')
    .custom((value) => {
      const reservedNames = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'test'];
      if (reservedNames.includes(value.toLowerCase())) {
        throw new Error('Category name is reserved');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]*$/)
    .withMessage('Description contains invalid characters')
];

// Category query validation
const validateCategoryQuery = [
  query('includeCount')
    .optional()
    .isBoolean()
    .withMessage('includeCount must be a boolean value'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

module.exports = {
  validateCategoryCreation,
  validateCategoryUpdate,
  validateCategoryQuery
};