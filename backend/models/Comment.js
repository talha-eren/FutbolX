const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Yorumun ait olduğu içerik (post veya video)
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // İçerik tipi (post veya video)
  contentType: {
    type: String,
    enum: ['post', 'video'],
    required: true
  },
  // Yorumu yapan kullanıcı
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Kullanıcı adı (hızlı erişim için)
  username: {
    type: String,
    required: true
  },
  // Kullanıcı profil resmi (hızlı erişim için)
  userImage: {
    type: String,
    default: ''
  },
  // Yorum içeriği
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  // Beğeni sayısı
  likes: {
    type: Number,
    default: 0
  },
  // Oluşturulma tarihi
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Yorumları tarihe göre sıralama için indeks
commentSchema.index({ contentId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
