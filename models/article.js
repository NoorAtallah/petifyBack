const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  category: { type: String, required: true }, // Category like "Feeding", "Training", etc.
  animalType: { type: String, required: true }, // Animal type like "Cat", "Dog", etc.
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Article', articleSchema);
