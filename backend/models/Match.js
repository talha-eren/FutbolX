const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  venue: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    image: String
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
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  score: {
    teamA: {
      name: String,
      goals: {
        type: Number,
        default: 0
      }
    },
    teamB: {
      name: String,
      goals: {
        type: Number,
        default: 0
      }
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: 22
  },
  price: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Başlangıç', 'Orta', 'İyi', 'Pro'],
    default: 'Orta'
  },
  description: {
    type: String,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
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

// Güncelleme zamanını otomatik ayarla
matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Eğer title yoksa otomatik oluştur
matchSchema.pre('save', function(next) {
  if (!this.title) {
    if (this.score && this.score.teamA && this.score.teamB) {
      this.title = `${this.score.teamA.name} vs ${this.score.teamB.name}`;
    } else {
      this.title = `Maç - ${this.venue.name}`;
    }
  }
  next();
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match; 