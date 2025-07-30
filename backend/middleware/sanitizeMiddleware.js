const validator = require('validator');

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Sanitize string fields in req.body
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      // Trim whitespace
      req.body[key] = req.body[key].trim();
      
      // Escape HTML to prevent XSS
      req.body[key] = validator.escape(req.body[key]);
      
      // Remove any potential script tags
      req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  }
  
  // Sanitize query parameters
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].trim();
      req.query[key] = validator.escape(req.query[key]);
    }
  }
  
  next();
};

// Sanitize HTML content (for article content)
const sanitizeHTML = (req, res, next) => {
  if (req.body.content) {
    // Allow some HTML tags but sanitize dangerous ones
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img'
    ];
    
    // Remove dangerous attributes
    req.body.content = req.body.content.replace(/on\w+="[^"]*"/g, ''); // Remove event handlers
    req.body.content = req.body.content.replace(/javascript:/g, ''); // Remove javascript: URLs
    req.body.content = req.body.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags
  }
  
  next();
};

// Validate and sanitize email
const sanitizeEmail = (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
    
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    req.body.email = validator.normalizeEmail(req.body.email);
  }
  
  next();
};

// Remove empty fields
const removeEmptyFields = (req, res, next) => {
  for (const key in req.body) {
    if (req.body[key] === '' || req.body[key] === null || req.body[key] === undefined) {
      delete req.body[key];
    }
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  sanitizeHTML,
  sanitizeEmail,
  removeEmptyFields
};