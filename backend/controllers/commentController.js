const Comment = require('../models/Comment');
const Article = require('../models/Article');
const { emitNewComment } = require('../utils/socket');
const { validationResult } = require('express-validator');

// Get comments for an article
const getCommentsByArticle = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const article = await Article.findById(req.params.articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    const comments = await Comment.find({ article: req.params.articleId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Comment.countDocuments({ article: req.params.articleId });
    
    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid article ID' });
    }
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// Create new comment
const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { content, article } = req.body;
    
    // Verify article exists
    const articleExists = await Article.findById(article);
    if (!articleExists) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    const comment = new Comment({
      content,
      author: req.user.id,
      article
    });
    
    await comment.save();
    await comment.populate('author', 'name email');
    
    // Emit real-time notification
    emitNewComment({
      comment,
      articleId: article,
      articleTitle: articleExists.title
    });
    
    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error while creating comment' });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { content } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is comment author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name email');
    
    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is comment author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};

// Get user's comments
const getUserComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const comments = await Comment.find({ author: req.user.id })
      .populate('article', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Comment.countDocuments({ author: req.user.id });
    
    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total
      }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ message: 'Server error while fetching user comments' });
  }
};

module.exports = {
  getCommentsByArticle,
  createComment,
  updateComment,
  deleteComment,
  getUserComments
};