const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playersJoined: {
    type: Number,
    default: 1
  },
  totalPlayers: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    enum: ['Amatör', 'Orta', 'İleri'],
    default: 'Orta'
  },
  image: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match; 