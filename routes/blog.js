const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogcontroller');

// Route to get all articles
router.get('/', blogController.getAllArticles);

// Route to get a single article by ID
router.get('/:id', blogController.getArticleById);

// Route to add a new article
router.post('/', blogController.addArticle);

// Route to update an article
router.put('/:id', blogController.updateArticle);

// Route to delete an article
router.delete('/:id', blogController.deleteArticle);

module.exports = router;
