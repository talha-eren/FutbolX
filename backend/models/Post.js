const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  username: String,
  videoUrl: String,
  description: String,
  likes: { type: Number, default: 0 },
  comments: [{ 
    username: String, 
    text: String, 
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 