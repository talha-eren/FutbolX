const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Başlangıç', 'Orta', 'İyi', 'Pro'],
    default: 'Orta'
  },
  neededPlayers: {
    type: Number,
    default: 0
  },
  currentPlayerCount: {
    type: Number,
    default: 0
  },
  preferredTime: {
    type: String,
    default: '20:00'
  },
  venue: {
    _id: String,
    name: String,
    location: String
  },
  contactNumber: String,
  matchHistory: {
    type: String,
    default: '0'
  },
  description: String,
  isApproved: {
    type: Boolean,
    default: true
  },
  captain: {
    _id: String,
    username: String,
    profilePicture: String
  },
  players: [{
    _id: String,
    username: String,
    profilePicture: String,
    position: String
  }],
  city: String,
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  goalsFor: {
    type: Number,
    default: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0
  },
  logo: String
}, {
  timestamps: true
});

// Güncelleme zamanını otomatik ayarla
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Oyuncu sayısını otomatik hesapla
teamSchema.pre('save', function(next) {
  this.currentPlayerCount = this.players.length;
  next();
});

module.exports = mongoose.model('Team', teamSchema); 