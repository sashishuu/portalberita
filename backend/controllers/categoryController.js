const Category = require('../models/Category');
const Article = require('../models/Article');
const { validationResult } = require('express-validator');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // If requested, include article count for each category
    if (req.query.includeCount === 'true') {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const articleCount = await Article.countDocuments({ 
            category: category._id,
            status: 'published'
          });
          return {
            ...category.toObject(),
            articleCount
          };
        })
      );
      return res.json(categoriesWithCount);
    }
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get articles count for this category
    const articleCount = await Article.countDocuments({ 
      category: category._id,
      status: 'published'
    });
    
    res.json({
      ...category.toObject(),
      articleCount
    });
  } catch (error) {
    console.error('Get category error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};

// Create new category (Admin only)
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = new Category({
      name,
      description
    });
    
    await category.save();
    
    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    
    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    
    await category.save();
    
    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has articles
    const articleCount = await Article.countDocuments({ category: req.params.id });
    if (articleCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${articleCount} associated articles.` 
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

// Get articles by category
const getArticlesByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const articles = await Article.find({ 
      category: req.params.id,
      status: 'published'
    })
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Article.countDocuments({ 
      category: req.params.id,
      status: 'published'
    });
    
    res.json({
      category,
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArticles: total
      }
    });
  } catch (error) {
    console.error('Get articles by category error:', error);
    res.status(500).json({ message: 'Server error while fetching articles' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getArticlesByCategory
};