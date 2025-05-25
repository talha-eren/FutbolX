const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Başlangıç', 'Orta', 'İyi', 'Pro'],
    default: 'Orta'
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
    isAdmin: {
      type: Boolean,
      default: false
    }
  }],
  neededPlayers: {
    type: Number,
    default: 1,
    min: 0,
    max: 10
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue'
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
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  regularPlayDays: [{
    type: String,
    enum: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  matches: [{
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    result: {
      type: String,
      enum: ['Galibiyet', 'Beraberlik', 'Mağlubiyet', '']
    },
    score: {
      goals: {
        type: Number,
        default: 0
      },
      conceded: {
        type: Number,
        default: 0
      }
    }
  }],
  location: {
    city: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    }
  },
  stats: {
    attack: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    defense: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    speed: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    teamwork: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Takımın maç istatistiklerini hesapla
teamSchema.virtual('matchStats').get(function() {
  const stats = {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0
  };
  
  if (this.matches && this.matches.length > 0) {
    stats.played = this.matches.length;
    
    this.matches.forEach(match => {
      if (match.result === 'Galibiyet') stats.won++;
      else if (match.result === 'Beraberlik') stats.drawn++;
      else if (match.result === 'Mağlubiyet') stats.lost++;
      
      stats.goalsFor += match.score.goals || 0;
      stats.goalsAgainst += match.score.conceded || 0;
    });
  }
  
  return stats;
});

// Takımın güncel oyuncu sayısını hesapla
teamSchema.virtual('currentPlayerCount').get(function() {
  return this.players ? this.players.length : 0;
});

// Takımın kısa maç geçmişini döndür (örn. "7G 2B 1M")
teamSchema.virtual('matchHistory').get(function() {
  const stats = this.matchStats;
  return `${stats.won}G ${stats.drawn}B ${stats.lost}M`;
});

// JSON çıktısında virtual'ları dahil et
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team; 