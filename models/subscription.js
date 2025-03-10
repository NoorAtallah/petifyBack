const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'weekly'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  endDate: { 
    type: Date, 
    required: true // End date is required now
  },
  isActive: { 
    type: Boolean,
    default: true
  },
  amount: { 
    type: String, 
    required: true 
  },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
