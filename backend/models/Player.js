const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  surname: {
    type: String,
    trim: true
  },
  position: { 
    type: String, 
    required: true,
    enum: ['Kaleci', 'Defans', 'Orta Saha', 'Forvet']
  },
  level: {
    type: String,
    enum: ['başlangıç', 'orta', 'ileri'],
    default: 'başlangıç'
  },
  preferredTime: {
    type: String,
    default: '20:00'
  },
  contactNumber: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  stats: {
    attack: { type: Number, min: 0, max: 100, default: 50 },
    defense: { type: Number, min: 0, max: 100, default: 50 },
    speed: { type: Number, min: 0, max: 100, default: 50 },
    teamwork: { type: Number, min: 0, max: 100, default: 50 }
  },
  location: {
    city: { type: String, default: 'İstanbul' },
    district: { type: String, default: 'Kadıköy' }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  regularPlayDays: [{
    type: String,
    enum: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  }],
  age: {
    type: Number
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  preferredFoot: {
    type: String,
    enum: ['Sağ', 'Sol', 'Her İkisi'],
    default: 'Sağ'
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  matches: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Match' 
  }],
  goals: { 
    type: Number, 
    default: 0 
  },
  assists: { 
    type: Number, 
    default: 0 
  },
  yellowCards: {
    type: Number,
    default: 0
  },
  redCards: {
    type: Number,
    default: 0
  },
  image: { 
    type: String, 
    default: 'default-player.jpg' 
  },
  bio: {
    type: String,
    trim: true
  },
  favoriteTeam: {
    type: String,
    trim: true
  },
  skills: [{
    name: String,
    value: Number
  }],
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player; 