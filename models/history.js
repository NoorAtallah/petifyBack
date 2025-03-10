const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrescriptionSchema = new Schema({
  medication: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  notes: String
});

const ConsultationSchema = new Schema({
  vetId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petOwnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName: {
    type: String,
    required: true
  },
  consultationDate: {
    type: Date,
    default: Date.now
  },
  symptoms: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  notes: String,
  prescriptions: [PrescriptionSchema],
  followUpDate: Date
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
