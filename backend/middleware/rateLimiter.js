const rateLimit = require('express-rate-limit');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Comment rate limiter
const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 comments per 5 minutes
  message: {
    error: 'Too many comments posted, please slow down.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? req.user.id : req.ip;
  }
});

// Article creation rate limiter
const articleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each user to 5 articles per hour
  message: {
    error: 'Too many articles created, please wait before creating more.',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  commentLimiter,
  articleLimiter,
  passwordResetLimiter
};