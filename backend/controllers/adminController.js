const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

// Get analytics data (Admin only)
const getAnalytics = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalCategories = await Category.countDocuments();
    
    // Published vs draft articles
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    
    // Articles by category
    const articlesByCategory = await Article.aggregate([
      { $match: { status: 'published' } },
      { 
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo._id',
          categoryName: { $first: '$categoryInfo.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Recent articles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentArticles = await Article.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: 'published'
    });
    
    // Recent comments (last 30 days)
    const recentComments = await Comment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // New users (last 30 days)
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Most viewed articles
    const mostViewedArticles = await Article.find({ status: 'published' })
      .select('title views author createdAt')
      .populate('author', 'name')
      .sort({ views: -1 })
      .limit(10);
    
    // Recent activity (latest articles and comments)
    const recentActivity = await Article.find()
      .select('title author createdAt status')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // User growth by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Article creation trend (last 12 months)
    const articleTrend = await Article.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    res.json({
      overview: {
        totalUsers,
        totalArticles,
        totalComments,
        totalCategories,
        publishedArticles,
        draftArticles
      },
      recentActivity: {
        recentArticles,
        recentComments,
        newUsers
      },
      articlesByCategory,
      mostViewedArticles,
      recentActivityList: recentActivity,
      trends: {
        userGrowth,
        articleTrend
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Verification status filter
    if (req.query.verified !== undefined) {
      query.isVerified = req.query.verified === 'true';
    }
    
    const users = await User.find(query)
      .select('-password -refreshToken -verificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete user's articles and comments
    await Article.deleteMany({ author: req.params.id });
    await Comment.deleteMany({ author: req.params.id });
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User and associated content deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    // Database collection sizes
    const collections = await Promise.all([
      User.collection.stats(),
      Article.collection.stats(),
      Comment.collection.stats(),
      Category.collection.stats()
    ]);
    
    const systemStats = {
      database: {
        collections: [
          { name: 'users', ...collections[0] },
          { name: 'articles', ...collections[1] },
          { name: 'comments', ...collections[2] },
          { name: 'categories', ...collections[3] }
        ]
      },
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };
    
    res.json(systemStats);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error while fetching system stats' });
  }
};

module.exports = {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemStats
};