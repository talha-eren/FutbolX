const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Author alanı - kullanıcı referansı
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Geriye dönük uyumluluk için user alanı korundu
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    default: ''
  },
  // Yeni eklenen alanlar
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  tags: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  post_type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  // Eski "content" alanı geriye dönük uyumluluk için korundu
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  video: {
    type: String,
    default: null
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
