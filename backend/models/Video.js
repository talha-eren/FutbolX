const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  length: { type: Number }, // bytes
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  description: { type: String },
  // GridFS dosya ID'si
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
});

module.exports = mongoose.model('Video', VideoSchema);
