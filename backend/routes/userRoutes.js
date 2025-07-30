const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  updateUserProfile,
  refreshToken
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, validateRequest, registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginValidation, validateRequest, loginUser);
router.get('/me', authMiddleware, getUserProfile);
router.put('/me', authMiddleware, updateUserProfile);
router.post('/refresh-token', refreshToken);

module.exports = router;