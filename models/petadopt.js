const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  description: { type: String },
  status: { type: String, enum: ['Adoptable', 'Adopted'], default: 'Adoptable' },
  image: { type: String },
  location: { type: String, required: true },
  vaccinationStatus: { type: String, enum: ['Up-to-date', 'Not up-to-date'], required: true },
  healthInfo: { type: String },
  size: { type: String, enum: ['Small', 'Medium', 'Large'] },
  temperament: { type: String, enum: ['Calm', 'Active', 'Aggressive', 'Friendly'], required: true },
  spayedNeutered: { type: Boolean, required: true },
  goodWithKids: { type: Boolean, default: false },
  goodWithOtherPets: { type: Boolean, default: false },
  adoptionFee: { type: Number, default: 0 },
  contactInfo: { type: String },
  type: { type: String, enum: ['Dog', 'Cat', 'Other'], required: true }, 
  createdAt: { type: Date, default: Date.now },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Pet', petSchema);
