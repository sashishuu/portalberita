const { body, validationResult } = require('express-validator');

// Validation rules for comment creation
const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]+$/)
    .withMessage('Comment contains invalid characters'),
  
  body('article')
    .isMongoId()
    .withMessage('Invalid article ID'),
];

// Validation rules for comment update
const validateCommentUpdate = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]+$/)
    .withMessage('Comment contains invalid characters'),
];

// Check validation results
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Spam detection middleware
const detectSpam = (req, res, next) => {
  const { content } = req.body;
  
  if (!content) {
    return next();
  }
  
  // Common spam patterns
  const spamPatterns = [
    /viagra/i,
    /casino/i,
    /lottery/i,
    /winner/i,
    /click here/i,
    /free money/i,
    /make money fast/i,
    /http[s]?:\/\/[^\s]+/g // URLs (basic detection)
  ];
  
  // Check for spam patterns
  const isSpam = spamPatterns.some(pattern => {
    if (pattern.global) {
      const matches = content.match(pattern);
      return matches && matches.length > 0;
    }
    return pattern.test(content);
  });
  
  if (isSpam) {
    return res.status(400).json({ 
      message: 'Comment appears to be spam and has been rejected' 
    });
  }
  
  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/);
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  const maxWordRepetition = Math.max(...Object.values(wordCount));
  if (maxWordRepetition > 5) {
    return res.status(400).json({ 
      message: 'Comment contains too much repetition' 
    });
  }
  
  next();
};

module.exports = {
  validateCommentCreation,
  validateCommentUpdate,
  checkValidationResult,
  detectSpam
};