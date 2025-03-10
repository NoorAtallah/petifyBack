const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  message: {  // Add message field
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  response: { type: String, default: '' }, 
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
