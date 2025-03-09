// models/AnsweredQuestion.js

const mongoose = require('mongoose');

const AnsweredQuestionSchema = new mongoose.Schema({
    userId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming vets are stored in the User model
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  dateAnswered: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AnsweredQuestion', AnsweredQuestionSchema);
