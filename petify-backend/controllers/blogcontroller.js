const Article = require('../models/article');

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get article by ID
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new article
const addArticle = async (req, res) => {
    const { title, summary, content, image, category, animalType } = req.body;
  
    const article = new Article({
      title,
      summary,
      content,
      image,
      category,
      animalType, 
    });
  
    try {
      const newArticle = await article.save();
      res.status(201).json(newArticle);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

// Update an article
// Update an article
const updateArticle = async (req, res) => {
    const { title, summary, content, image, category, animalType } = req.body;
  
    try {
      const updatedArticle = await Article.findByIdAndUpdate(
        req.params.id,
        { title, summary, content, image, category, animalType }, // Ensure these fields can be updated
        { new: true }
      );
  
      if (!updatedArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }
  
      res.json(updatedArticle);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  
  const getArticlesByCategoryAndAnimalType = async (req, res) => {
    const { category, animalType } = req.query;
  
    try {
      const articles = await Article.find({ category, animalType }).sort({ createdAt: -1 });
      res.json(articles);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// Delete an article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  addArticle,
  updateArticle,
  deleteArticle,
  getArticlesByCategoryAndAnimalType
};
