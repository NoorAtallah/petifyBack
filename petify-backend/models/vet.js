const mongoose = require('mongoose');
const vetApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
 
  },
  coverLetter: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approved: {
    type: Boolean,
    default: false // Default to false, only true when the vet is approved
  },
  selectedBookings: [{type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'}],
});

const VetApplication = mongoose.model('VetApplication', vetApplicationSchema);
module.exports = VetApplication;
