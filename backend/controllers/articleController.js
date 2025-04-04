const Article = require('../models/Article');

exports.getAllArticles = async (req, res) => {
  try {
    const {
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {
      $or: [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ]
    };

    const total = await Article.countDocuments(query);

    const articles = await Article.find(query)
      .populate('author', 'username')
      .populate('category', 'name')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      articles
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'username')
      .populate('category', 'name');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const article = await Article.create({ title, content, category, author: req.user.id });
    res.status(201).json({ message: 'Article created successfully', article });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    const updates = req.body;
    updates.updatedAt = Date.now();
    const updatedArticle = await Article.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Article updated successfully', article: updatedArticle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadArticleImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  const filePath = '/uploads/article/' + path.basename(req.file.filepath);
  const article = await Article.findByIdAndUpdate(req.params.id, { image: filePath }, { new: true });
  if (!article) return res.status(404).json({ message: 'Article not found' });
  res.json({ message: 'Article image uploaded', article });
};
