const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
  day: { type: String, required: true }, // e.g., 'Monday', 'Tuesday'
  startTime: { type: String, required: true }, // e.g., '09:00 AM'
  endTime: { type: String, required: true } // e.g., '05:00 PM'
});

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // Add profile picture URL (optional)
  role: { 
    type: String, 
    enum: ['user', 'vet'], 
    default: 'user' 
  },
  isActive: { type: Boolean, default: true },
  schedule: {
    type: [ScheduleSchema],
    default: []
  }
});

module.exports = mongoose.model('User', UserSchema);
