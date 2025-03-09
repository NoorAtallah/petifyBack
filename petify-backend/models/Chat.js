const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String }, // Text is now optional in case it's an image message
  imageUrl: { type: String }, // URL to the uploaded image
  timestamp: { type: Date, default: Date.now },
  fileUrl: {type:String}
});

module.exports = mongoose.model('Message', MessageSchema);