const express = require('express');
const { body } = require('express-validator');
const {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemStats
} = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { validateRequest, validateObjectId, validatePagination } = require('../middleware/validateRequest');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, isAdmin);

// Analytics and statistics
router.get('/analytics', getAnalytics);
router.get('/system-stats', getSystemStats);

// User management
router.get('/users', validatePagination, getAllUsers);

router.put('/users/:id/role',
  validateObjectId('id'),
  [
    body('role')
      .isIn(['user', 'admin'])
      .withMessage('Role must be either "user" or "admin"')
  ],
  validateRequest,
  updateUserRole
);

router.delete('/users/:id',
  validateObjectId('id'),
  deleteUser
);

module.exports = router;