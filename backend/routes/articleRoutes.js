const express = require('express');
const router = express.Router();
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadArticleImage
} = require('../controllers/articleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateArticle, validateRequest } = require('../middleware/validateArticle');
const { handleUpload } = require('../middleware/uploadMiddleware');

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', authMiddleware, validateArticle, validateRequest, createArticle);
router.put('/:id', authMiddleware, validateArticle, validateRequest, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);
router.post('/:id/upload-image', authMiddleware, handleUpload('article'), uploadArticleImage);

module.exports = router;
