const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: function() {
      return this.postType === 'video' || this.postType === 'image';
    }
  },
  filePath: {
    type: String,
    required: function() {
      return this.postType === 'video' || this.postType === 'image';
    }
  },
  thumbnail: {
    type: String,
    default: 'default-thumbnail.jpg'
  },
  duration: {
    type: String,
    default: '0:00'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postType: {
    type: String,
    enum: ['video', 'image', 'text'],
    default: 'video'
  },
  textContent: {
    type: String,
    required: function() {
      return this.postType === 'text';
    }
  },
  category: {
    type: String,
    enum: ['maç', 'antrenman', 'röportaj', 'diğer'],
    default: 'diğer'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
