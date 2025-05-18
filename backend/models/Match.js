const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      type: String,
      enum: ['Kaleci', 'Defans', 'Orta Saha', 'Forvet', '']
    },
    team: {
      type: String,
      enum: ['A', 'B']
    }
  }],
  maxPlayers: {
    type: Number,
    default: 14
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['açık', 'dolu', 'iptal', 'tamamlandı'],
    default: 'açık'
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match; 