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
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  favoriteTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  // İstatistikler
  stats: {
    matches: {
      type: Number,
      default: 0
    },
    goals: {
      type: Number,
      default: 0
    },
    assists: {
      type: Number,
      default: 0
    },
    playHours: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    }
  },
  // Şifre sıfırlama alanları
  resetPasswordCode: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  // Sosyal giriş alanları
  googleId: {
    type: String,
    sparse: true
  },
  facebookId: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  footPreference: {
    type: String,
    default: ''
  }
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Password değişmedi, hash\'leme atlanıyor');
    return next();
  }
  
  console.log('Password hash\'leme başlıyor. Şifre uzunluğu:', this.password?.length);
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hash\'leme tamamlandı. Hash uzunluğu:', this.password?.length);
    next();
  } catch (error) {
    console.error('Password hash\'leme hatası:', error.message);
    next(error);
  }
});

// Şifre doğrulama metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
