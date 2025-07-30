const { validationResult } = require('express-validator');

// General validation result checker
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Check if required fields are present
const checkRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields
      });
    }
    
    next();
  };
};

// Validate MongoDB ObjectId
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: `Invalid ${paramName} ID format`
      });
    }
    
    next();
  };
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (!Number.isInteger(+page) || +page < 1)) {
    return res.status(400).json({
      message: 'Page must be a positive integer'
    });
  }
  
  if (limit && (!Number.isInteger(+limit) || +limit < 1 || +limit > 100)) {
    return res.status(400).json({
      message: 'Limit must be a positive integer between 1 and 100'
    });
  }
  
  next();
};

module.exports = {
  validateRequest,
  checkRequiredFields,
  validateObjectId,
  validatePagination
};