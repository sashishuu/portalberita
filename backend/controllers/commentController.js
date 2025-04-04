const Comment = require('../models/Comment');
const Article = require('../models/Article');

let ioInstance = null;

function setSocket(io) {
  ioInstance = io;
}

function emitNewComment(comment) {
  if (ioInstance) {
    ioInstance.emit('new-comment', {
      _id: comment._id,
      comment: comment.comment,
      user: comment.user,
      article: comment.article,
      createdAt: comment.createdAt
    });
  }
}

exports.setSocket = setSocket;



// Get all comments (optionally filter by article ID)
exports.getAllComments = async (req, res) => {
  try {
    const { articleId } = req.query;
    const query = {};
    if (articleId) query.article = articleId;

    const comments = await Comment.find(query)
      .populate('user', 'username')
      .populate('article', 'title');
      
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { article, comment } = req.body;

    // Validasi wajib
    if (!article || !comment) {
      return res.status(400).json({ message: 'Article and comment are required.' });
    }

    // Validasi panjang minimal komentar
    if (comment.trim().length < 10) {
      return res.status(400).json({ message: 'Comment must be at least 10 characters long.' });
    }

    // Pastikan artikel ada
    const articleExists = await Article.findById(article);
    if (!articleExists) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const newComment = await Comment.create({
      article,
      user: req.user.id,
      comment,
      createdAt: new Date()
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Hanya pemilik komentar atau admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

