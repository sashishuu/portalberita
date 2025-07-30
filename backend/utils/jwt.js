const jwt = require('jsonwebtoken');

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'portal-berita',
    audience: 'portal-berita-users'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    issuer: 'portal-berita',
    audience: 'portal-berita-users'
  });
};

// Generate email verification token
const generateVerificationToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'portal-berita',
    audience: 'portal-berita-verification'
  });
};

// Generate password reset token
const generatePasswordResetToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'portal-berita',
    audience: 'portal-berita-password-reset'
  });
};

// Verify token
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'portal-berita'
    });
  } catch (error) {
    throw error;
  }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded ? decoded.exp : null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration
};