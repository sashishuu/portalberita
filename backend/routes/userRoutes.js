const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const { handleUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', loginLimiter, userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/upload-avatar', authMiddleware, handleUpload('profile'), userController.uploadProfilePicture);
// Protected routes
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.delete('/:id', authMiddleware, userController.deleteAccount);
router.get('/verify/:token', userController.verifyEmail);





module.exports = router;
