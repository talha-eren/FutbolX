const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Team = require('../models/Team');
const Match = require('../models/Match');
const mongoose = require('mongoose');

// Kullanıcı son aktivitelerini getir
router.get('/users/:userId/recent-activity', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Son rezervasyon
    const lastReservation = await Reservation.findOne({ 
      user: userId 
    })
    .populate('venue', 'name location')
    .sort({ createdAt: -1 });
    
    // Son takım aktivitesi
    const userTeams = await Team.find({ 
      members: userId 
    }).sort({ updatedAt: -1 }).limit(1);
    
    // Son maç
    const lastMatch = await Match.findOne({
      $or: [
        { 'team1.members': userId },
        { 'team2.members': userId }
      ]
    }).sort({ date: -1 });
    
    res.json({
      success: true,
      activity: {
        lastReservation,
        lastTeam: userTeams[0] || null,
        lastMatch,
        totalReservations: await Reservation.countDocuments({ user: userId }),
        totalTeams: userTeams.length
      }
    });
    
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Son aktiviteler alınırken hata oluştu',
      error: error.message
    });
  }
});

// Sahalar listesi
router.get('/venues', async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true })
      .select('name location pricePerHour rating amenities images')
      .sort({ rating: -1 });
    
    res.json({
      success: true,
      venues,
      total: venues.length
    });
    
  } catch (error) {
    console.error('Venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Sahalar alınırken hata oluştu',
      error: error.message
    });
  }
});

// Oyuncular listesi (kendisi hariç)
router.get('/users/players', async (req, res) => {
  try {
    const { exclude } = req.query;
    
    const query = { 
      isActive: true,
      role: 'user'
    };
    
    if (exclude) {
      query._id = { $ne: exclude };
    }
    
    const users = await User.find(query)
      .select('firstName lastName position footballExperience age location profileImage')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      users,
      total: users.length
    });
    
  } catch (error) {
    console.error('Players error:', error);
    res.status(500).json({
      success: false,
      message: 'Oyuncular alınırken hata oluştu',
      error: error.message
    });
  }
});

// Belirli saha için rezervasyonlar
router.get('/reservations/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    const { date } = req.query;
    
    let query = { venue: venueId };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    const reservations = await Reservation.find(query)
      .populate('user', 'firstName lastName')
      .select('date time status user')
      .sort({ date: 1, time: 1 });
    
    res.json({
      success: true,
      reservations,
      total: reservations.length
    });
    
  } catch (error) {
    console.error('Venue reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Saha rezervasyonları alınırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı rezervasyonları
router.get('/reservations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reservations = await Reservation.find({ user: userId })
      .populate('venue', 'name location pricePerHour')
      .sort({ date: -1 })
      .limit(20);
    
    res.json({
      success: true,
      reservations,
      total: reservations.length
    });
    
  } catch (error) {
    console.error('User reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı rezervasyonları alınırken hata oluştu',
      error: error.message
    });
  }
});

// Sistem istatistikleri
router.get('/stats/system', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalVenues = await Venue.countDocuments({ isActive: true });
    const totalReservations = await Reservation.countDocuments();
    const totalTeams = await Team.countDocuments({ isActive: true });
    
    // Bu hafta rezervasyonları
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyReservations = await Reservation.countDocuments({
      createdAt: { $gte: weekAgo }
    });
    
    // Bu ay rezervasyonları
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthlyReservations = await Reservation.countDocuments({
      createdAt: { $gte: monthAgo }
    });
    
    // En popüler sahalar
    const popularVenues = await Reservation.aggregate([
      {
        $group: {
          _id: '$venue',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'venues',
          localField: '_id',
          foreignField: '_id',
          as: 'venue'
        }
      },
      {
        $unwind: '$venue'
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalVenues,
        totalReservations,
        totalTeams,
        weeklyReservations,
        monthlyReservations,
        popularVenues
      }
    });
    
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Sistem istatistikleri alınırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı istatistikleri
router.get('/stats/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const totalReservations = await Reservation.countDocuments({ user: userId });
    const totalMatches = await Match.countDocuments({
      $or: [
        { 'team1.members': userId },
        { 'team2.members': userId }
      ]
    });
    
    const userTeams = await Team.find({ members: userId });
    const teamCount = userTeams.length;
    
    // Toplam harcama hesapla
    const reservationsWithVenues = await Reservation.find({ user: userId })
      .populate('venue', 'pricePerHour');
    
    const totalSpent = reservationsWithVenues.reduce((total, reservation) => {
      return total + (reservation.venue?.pricePerHour || 0);
    }, 0);
    
    // En çok gittiği saha
    const favoriteVenue = await Reservation.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$venue',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'venues',
          localField: '_id',
          foreignField: '_id',
          as: 'venue'
        }
      },
      {
        $unwind: '$venue'
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalReservations,
        totalMatches,
        teamCount,
        totalSpent,
        favoriteVenue: favoriteVenue[0] || null,
        averageSpentPerReservation: totalReservations > 0 ? Math.round(totalSpent / totalReservations) : 0
      }
    });
    
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı istatistikleri alınırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcının takımları
router.get('/teams/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const teams = await Team.find({ 
      members: userId,
      isActive: true 
    })
    .populate('members', 'firstName lastName position')
    .populate('captain', 'firstName lastName')
    .sort({ createdAt: -1 });
    
    // Takım bilgilerini zenginleştir
    const enrichedTeams = teams.map(team => ({
      ...team.toObject(),
      memberCount: team.members.length,
      maxMembers: team.maxMembers || 11
    }));
    
    res.json({
      success: true,
      teams: enrichedTeams,
      total: teams.length
    });
    
  } catch (error) {
    console.error('User teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı takımları alınırken hata oluştu',
      error: error.message
    });
  }
});

// Katılınabilir takımlar
router.get('/teams/available', async (req, res) => {
  try {
    const { exclude } = req.query;
    
    const teams = await Team.find({
      isActive: true,
      isPublic: true,
      members: { $ne: exclude } // Kullanıcının zaten üye olmadığı takımlar
    })
    .populate('members', 'firstName lastName')
    .populate('captain', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(20);
    
    // Dolu olmayan takımları filtrele
    const availableTeams = teams.filter(team => {
      const maxMembers = team.maxMembers || 11;
      return team.members.length < maxMembers;
    }).map(team => ({
      ...team.toObject(),
      memberCount: team.members.length,
      maxMembers: team.maxMembers || 11
    }));
    
    res.json({
      success: true,
      teams: availableTeams,
      total: availableTeams.length
    });
    
  } catch (error) {
    console.error('Available teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Mevcut takımlar alınırken hata oluştu',
      error: error.message
    });
  }
});

// Fiyat analizi
router.get('/stats/price-analysis', async (req, res) => {
  try {
    const venues = await Venue.find({ 
      isActive: true,
      pricePerHour: { $gt: 0 }
    }).select('pricePerHour name location');
    
    if (venues.length === 0) {
      return res.json({
        success: true,
        analysis: {
          average: 0,
          min: 0,
          max: 0,
          total: 0
        }
      });
    }
    
    const prices = venues.map(v => v.pricePerHour);
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    // Zaman bazlı fiyat analizi (örnek - gerçek implementasyon için zaman bazlı fiyatlandırma gerekli)
    const timeBasedPrices = {
      morning: average * 0.8,   // Sabah %20 indirim
      afternoon: average,       // Öğlen normal fiyat
      evening: average * 1.2    // Akşam %20 zam
    };
    
    // Fiyat aralıklarına göre saha sayıları
    const priceRanges = {
      budget: venues.filter(v => v.pricePerHour <= average * 0.8).length,
      medium: venues.filter(v => v.pricePerHour > average * 0.8 && v.pricePerHour <= average * 1.2).length,
      premium: venues.filter(v => v.pricePerHour > average * 1.2).length
    };
    
    res.json({
      success: true,
      analysis: {
        average: Math.round(average),
        min,
        max,
        total: venues.length,
        timeBasedPrices,
        priceRanges,
        cheapestVenues: venues.filter(v => v.pricePerHour === min).slice(0, 3),
        mostExpensiveVenues: venues.filter(v => v.pricePerHour === max).slice(0, 3)
      }
    });
    
  } catch (error) {
    console.error('Price analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyat analizi yapılırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı bütçe analizi
router.get('/stats/user/:userId/budget', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userReservations = await Reservation.find({ user: userId })
      .populate('venue', 'pricePerHour name');
    
    if (userReservations.length === 0) {
      return res.json({
        success: true,
        budget: {
          averageSpent: 0,
          totalSpent: 0,
          reservationCount: 0,
          affordableVenues: 0
        }
      });
    }
    
    const totalSpent = userReservations.reduce((total, res) => {
      return total + (res.venue?.pricePerHour || 0);
    }, 0);
    
    const averageSpent = totalSpent / userReservations.length;
    
    // Kullanıcının bütçesine uygun sahalar
    const allVenues = await Venue.find({ 
      isActive: true,
      pricePerHour: { $lte: averageSpent * 1.2 } // %20 tolerans
    });
    
    res.json({
      success: true,
      budget: {
        averageSpent: Math.round(averageSpent),
        totalSpent: Math.round(totalSpent),
        reservationCount: userReservations.length,
        affordableVenues: allVenues.length,
        recommendedBudget: Math.round(averageSpent),
        maxBudget: Math.round(averageSpent * 1.5)
      }
    });
    
  } catch (error) {
    console.error('User budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bütçe analizi yapılırken hata oluştu',
      error: error.message
    });
  }
});

// Akıllı saha önerileri
router.post('/smart-venue-suggestions', async (req, res) => {
  try {
    const { userId, preferences = {} } = req.body;
    
    // Kullanıcının geçmiş rezervasyonlarını analiz et
    const userReservations = await Reservation.find({ user: userId })
      .populate('venue');
    
    // Kullanıcı tercihlerini çıkar
    const userPreferences = {
      averagePrice: 0,
      preferredLocations: [],
      preferredTimes: []
    };
    
    if (userReservations.length > 0) {
      userPreferences.averagePrice = userReservations.reduce((total, res) => {
        return total + (res.venue?.pricePerHour || 0);
      }, 0) / userReservations.length;
      
      // En çok gittiği lokasyonlar
      const locationCounts = {};
      userReservations.forEach(res => {
        if (res.venue?.location) {
          locationCounts[res.venue.location] = (locationCounts[res.venue.location] || 0) + 1;
        }
      });
      
      userPreferences.preferredLocations = Object.keys(locationCounts)
        .sort((a, b) => locationCounts[b] - locationCounts[a])
        .slice(0, 3);
    }
    
    // Tüm sahaları al ve skorla
    const allVenues = await Venue.find({ isActive: true });
    const suggestions = [];
    
    for (const venue of allVenues) {
      let score = 50; // Base score
      
      // Fiyat uyumluluğu
      if (userPreferences.averagePrice > 0) {
        const priceDiff = Math.abs(venue.pricePerHour - userPreferences.averagePrice);
        const priceScore = Math.max(0, 30 - (priceDiff / userPreferences.averagePrice) * 30);
        score += priceScore;
      }
      
      // Lokasyon tercihi
      if (userPreferences.preferredLocations.includes(venue.location)) {
        score += 25;
      }
      
      // Rating
      if (venue.rating) {
        score += (venue.rating / 5) * 20;
      }
      
      // Bugün için müsaitlik
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = await Reservation.countDocuments({
        venue: venue._id,
        date: {
          $gte: new Date(today),
          $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      const availabilityScore = Math.max(0, (14 - todayReservations) / 14 * 15);
      score += availabilityScore;
      
      suggestions.push({
        venue,
        score: Math.min(100, Math.round(score)),
        availableSlots: Math.max(0, 14 - todayReservations),
        reason: score > 80 ? 'Mükemmel eşleşme' : score > 70 ? 'Çok uygun' : 'İyi seçenek'
      });
    }
    
    // Skora göre sırala ve en iyi 5'ini döndür
    const topSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    res.json({
      success: true,
      suggestions: topSuggestions,
      userPreferences
    });
    
  } catch (error) {
    console.error('Smart venue suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Akıllı saha önerileri oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// Bugünkü maçlar
router.get('/matches/today', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const matches = await Match.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['açık', 'dolu'] }
    })
    .populate('venue', 'name location')
    .populate('organizer', 'firstName lastName')
    .sort({ startTime: 1 });

    res.json({
      success: true,
      matches,
      total: matches.length
    });

  } catch (error) {
    console.error('Today matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Bugünkü maçlar alınırken hata oluştu',
      error: error.message
    });
  }
});

// Yaklaşan maçlar
router.get('/matches/upcoming', async (req, res) => {
  try {
    const now = new Date();
    
    const matches = await Match.find({
      date: { $gte: now },
      status: { $in: ['açık', 'dolu'] }
    })
    .populate('venue', 'name location')
    .populate('organizer', 'firstName lastName')
    .sort({ date: 1, startTime: 1 })
    .limit(20);

    res.json({
      success: true,
      matches,
      total: matches.length
    });

  } catch (error) {
    console.error('Upcoming matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Yaklaşan maçlar alınırken hata oluştu',
      error: error.message
    });
  }
});

// Saha bazlı maçlar
router.get('/matches/venue', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Saha adı gerekli'
      });
    }

    // Saha adına göre venue bul
    const venue = await Venue.findOne({
      name: { $regex: name, $options: 'i' },
      isActive: true
    });

    if (!venue) {
      return res.json({
        success: true,
        matches: [],
        message: 'Saha bulunamadı'
      });
    }

    const matches = await Match.find({
      venue: venue._id,
      date: { $gte: new Date() },
      status: { $in: ['açık', 'dolu'] }
    })
    .populate('organizer', 'firstName lastName')
    .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      matches,
      venue: venue.name,
      total: matches.length
    });

  } catch (error) {
    console.error('Venue matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Saha maçları alınırken hata oluştu',
      error: error.message
    });
  }
});

// Pozisyon bazlı oyuncu arama
router.get('/users/players/position', async (req, res) => {
  try {
    const { position, exclude } = req.query;
    
    if (!position) {
      return res.status(400).json({
        success: false,
        message: 'Pozisyon gerekli'
      });
    }

    const query = {
      isActive: true,
      role: 'user',
      position: position
    };
    
    if (exclude) {
      query._id = { $ne: exclude };
    }

    const users = await User.find(query)
      .select('firstName lastName position footballExperience age location profileImage goalsScored')
      .sort({ goalsScored: -1, createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      users,
      position,
      total: users.length
    });

  } catch (error) {
    console.error('Position players error:', error);
    res.status(500).json({
      success: false,
      message: 'Pozisyon bazlı oyuncular alınırken hata oluştu',
      error: error.message
    });
  }
});

// En çok gol atan oyuncular
router.get('/stats/top-scorers', async (req, res) => {
  try {
    const topScorers = await User.find({
      isActive: true,
      role: 'user',
      goalsScored: { $gt: 0 }
    })
    .select('firstName lastName goalsScored position profileImage')
    .sort({ goalsScored: -1 })
    .limit(10);

    res.json({
      success: true,
      players: topScorers,
      total: topScorers.length
    });

  } catch (error) {
    console.error('Top scorers error:', error);
    res.status(500).json({
      success: false,
      message: 'En çok gol atan oyuncular alınırken hata oluştu',
      error: error.message
    });
  }
});

// En aktif takımlar
router.get('/stats/most-active-teams', async (req, res) => {
  try {
    // Takımların maç sayılarını hesapla
    const activeTeams = await Match.aggregate([
      {
        $match: {
          status: 'tamamlandı',
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Son 30 gün
        }
      },
      {
        $unwind: '$players'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'players.player',
          foreignField: '_id',
          as: 'playerInfo'
        }
      },
      {
        $unwind: '$playerInfo'
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'playerInfo.teams',
          foreignField: '_id',
          as: 'teamInfo'
        }
      },
      {
        $unwind: '$teamInfo'
      },
      {
        $group: {
          _id: '$teamInfo._id',
          name: { $first: '$teamInfo.name' },
          matchCount: { $sum: 1 },
          memberCount: { $first: '$teamInfo.members.length' }
        }
      },
      {
        $sort: { matchCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      teams: activeTeams,
      total: activeTeams.length
    });

  } catch (error) {
    console.error('Most active teams error:', error);
    res.status(500).json({
      success: false,
      message: 'En aktif takımlar alınırken hata oluştu',
      error: error.message
    });
  }
});

// Takım için oyuncu önerileri
router.post('/teams/:teamId/player-suggestions', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { missingPositions } = req.body;

    if (!missingPositions || !Array.isArray(missingPositions)) {
      return res.status(400).json({
        success: false,
        message: 'Eksik pozisyonlar gerekli'
      });
    }

    const team = await Team.findById(teamId).populate('members');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Takım bulunamadı'
      });
    }

    // Takım üyelerinin ID'lerini al
    const memberIds = team.members.map(m => m._id);

    // Eksik pozisyonlardaki oyuncuları bul
    const suggestions = [];
    
    for (const position of missingPositions) {
      const players = await User.find({
        isActive: true,
        role: 'user',
        position: position,
        _id: { $nin: memberIds } // Takım üyesi olmayanlar
      })
      .select('firstName lastName position footballExperience location goalsScored')
      .limit(5);

      // Her oyuncu için uyumluluk skoru hesapla
      players.forEach(player => {
        let matchScore = 50; // Base score
        
        // Deneyim seviyesi uyumluluğu
        const teamExperiences = team.members.map(m => m.footballExperience).filter(e => e);
        if (teamExperiences.length > 0) {
          const avgExperience = teamExperiences[0]; // Basit yaklaşım
          if (player.footballExperience === avgExperience) {
            matchScore += 30;
          }
        }
        
        // Gol performansı
        if (player.goalsScored > 5) {
          matchScore += 20;
        }
        
        // Lokasyon uyumluluğu (basit kontrol)
        const teamLocations = team.members.map(m => m.location).filter(l => l);
        if (teamLocations.includes(player.location)) {
          matchScore += 15;
        }

        suggestions.push({
          player,
          matchScore: Math.min(100, matchScore),
          reason: `${position} pozisyonu için uygun`
        });
      });
    }

    // Skora göre sırala
    suggestions.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 10),
      team: team.name,
      missingPositions
    });

  } catch (error) {
    console.error('Team player suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Takım oyuncu önerileri alınırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı gelişim analizi
router.get('/stats/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Son 3 ayın verilerini al
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentMatches = await Match.find({
      'players.player': userId,
      date: { $gte: threeMonthsAgo },
      status: 'tamamlandı'
    }).sort({ date: 1 });

    const recentReservations = await Reservation.find({
      user: userId,
      createdAt: { $gte: threeMonthsAgo }
    }).sort({ createdAt: 1 });

    // Gelişim metrikleri hesapla
    const progress = {
      totalMatches: recentMatches.length,
      totalReservations: recentReservations.length,
      monthlyActivity: {},
      improvementAreas: [],
      achievements: []
    };

    // Aylık aktivite hesapla
    recentMatches.forEach(match => {
      const month = match.date.toISOString().slice(0, 7); // YYYY-MM
      progress.monthlyActivity[month] = (progress.monthlyActivity[month] || 0) + 1;
    });

    // Gelişim alanları öner
    if (recentMatches.length < 5) {
      progress.improvementAreas.push('Daha fazla maç oynayarak deneyim kazan');
    }
    
    if (!user.position || user.position === '') {
      progress.improvementAreas.push('Profilinde pozisyon belirle');
    }

    // Başarılar
    if (recentMatches.length >= 10) {
      progress.achievements.push('Aktif Oyuncu - 10+ maç');
    }
    
    if (user.goalsScored >= 5) {
      progress.achievements.push('Golcü - 5+ gol');
    }

    res.json({
      success: true,
      progress,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        position: user.position,
        experience: user.footballExperience
      }
    });

  } catch (error) {
    console.error('User progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı gelişim analizi yapılırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 