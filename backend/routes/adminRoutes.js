const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/adminController');

router.get('/analytics', authMiddleware, isAdmin, getAnalytics);

module.exports = router;
