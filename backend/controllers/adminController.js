const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalComments = await Comment.countDocuments();

    const articlesPerCategory = await Article.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 0,
          category: '$category.name',
          count: 1
        }
      }
    ]);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentArticles = await Article.countDocuments({
      createdAt: { $gte: last7Days }
    });

    res.json({
      totalUsers,
      totalArticles,
      totalComments,
      articlesPerCategory,
      recentArticles
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};