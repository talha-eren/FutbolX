const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png'
  },
  
  // Futbol Profil Bilgileri
  footballExperience: {
    type: String,
    enum: ['Başlangıç', 'Orta', 'İleri'],
    default: 'Başlangıç'
  },
  preferredFoot: {
    type: String,
    enum: ['Sağ', 'Sol', 'Her İkisi'],
    default: 'Sağ'
  },
  position: {
    type: String,
    enum: ['Kaleci', 'Defans', 'Orta Saha', 'Forvet', ''],
    default: ''
  },
  
  // İletişim ve Kişisel Bilgiler
  location: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  
  // Eski alanlar (geriye uyumluluk için)
  level: {
    type: String,
    default: '-'
  },
  
  // İstatistikler
  matchesPlayed: {
    type: Number,
    default: 0
  },
  goalsScored: {
    type: Number,
    default: 0
  },
  assists: {
    type: Number,
    default: 0
  },
  hoursPlayed: {
    type: Number,
    default: 0
  },
  
  // Ek bilgiler
  favoriteTeam: {
    type: String,
    default: ''
  },
  achievements: [{
    type: String
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  highlights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Şifreyi hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre doğrulama metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
