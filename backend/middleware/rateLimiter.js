const rateLimit = require('express-rate-limit');

// 🔐 Rate limiter untuk login: max 10 percobaan tiap 15 menit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // max 10 request per IP per window
  standardHeaders: true, // return rate limit info di headers
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  }
});

// 💬 Rate limiter untuk komentar: max 20 komentar tiap 5 menit
const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 20, // max 20 request per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many comment requests from this IP, please try again after 5 minutes.'
  }
});

module.exports = { loginLimiter, commentLimiter };
