const Article = require('../models/Article');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// Get all articles with search, filter, sort, and pagination
const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { status: 'published' };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Date filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.createdAt.$lte = new Date(req.query.dateTo);
      }
    }
    
    // Sort options
    let sortOptions = {};
    switch (req.query.sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { views: -1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // newest first
    }
    
    const articles = await Article.find(query)
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    const total = await Article.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages,
        totalArticles: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Server error while fetching articles' });
  }
};

// Get single article by ID
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email')
      .populate('category', 'name description');
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Increment views
    article.views += 1;
    await article.save();
    
    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid article ID' });
    }
    res.status(500).json({ message: 'Server error while fetching article' });
  }
};

// Create new article
const createArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, content, category, tags, status } = req.body;
    
    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const articleData = {
      title,
      content,
      author: req.user.id,
      category,
      status: status || 'published'
    };
    
    // Handle image upload
    if (req.file) {
      articleData.image = req.file.path;
    }
    
    // Handle tags
    if (tags) {
      articleData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    const article = new Article(articleData);
    await article.save();
    
    await article.populate([
      { path: 'author', select: 'name email' },
      { path: 'category', select: 'name' }
    ]);
    
    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Server error while creating article' });
  }
};

// Update article
const updateArticle = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;
    
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Check if user is author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }
    
    // Verify category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      article.category = category;
    }
    
    // Update fields
    if (title) article.title = title;
    if (content) article.content = content;
    if (status) article.status = status;
    
    // Handle tags
    if (tags) {
      article.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (article.image && fs.existsSync(article.image)) {
        fs.unlinkSync(article.image);
      }
      article.image = req.file.path;
    }
    
    await article.save();
    await article.populate([
      { path: 'author', select: 'name email' },
      { path: 'category', select: 'name' }
    ]);
    
    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Server error while updating article' });
  }
};

// Delete article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Check if user is author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }
    
    // Delete associated image
    if (article.image && fs.existsSync(article.image)) {
      fs.unlinkSync(article.image);
    }
    
    await Article.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Server error while deleting article' });
  }
};

// Get articles by author
const getArticlesByAuthor = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const articles = await Article.find({ author: req.user.id })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Article.countDocuments({ author: req.user.id });
    
    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArticles: total
      }
    });
  } catch (error) {
    console.error('Get user articles error:', error);
    res.status(500).json({ message: 'Server error while fetching user articles' });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByAuthor
};