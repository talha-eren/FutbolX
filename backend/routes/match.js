const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// GET tüm maçları getir - gelişmiş filtreleme ile
router.get('/', async (req, res) => {
  try {
    console.log('Maçlar listesi istendi - Veritabanından çekiliyor...');
    
    const { 
      status, 
      date_filter, 
      venue, 
      level, 
      price_max, 
      price_min,
      limit = 50,
      sort = 'date'
    } = req.query;
    
    // Filtreleme koşulları
    let filter = {};
    
    // Durum filtresi
    if (status && status !== 'all') {
      if (status === 'today') {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        filter.date = { $gte: startOfDay, $lte: endOfDay };
      } else if (status === 'this_week') {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        filter.date = { $gte: startOfWeek, $lte: endOfWeek };
      } else {
        filter.status = status;
      }
    }
    
    // Tarih filtresi
    if (date_filter) {
      const today = new Date();
      switch (date_filter) {
        case 'today':
          const startOfDay = new Date(today.setHours(0, 0, 0, 0));
          const endOfDay = new Date(today.setHours(23, 59, 59, 999));
          filter.date = { $gte: startOfDay, $lte: endOfDay };
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
          const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));
          filter.date = { $gte: startOfTomorrow, $lte: endOfTomorrow };
          break;
        case 'this_week':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          filter.date = { $gte: startOfWeek, $lte: endOfWeek };
          break;
      }
    }
    
    // Saha filtresi - daha esnek arama
    if (venue) {
      // Kısmi eşleşme ile arama (case insensitive)
      filter['venue.name'] = { $regex: venue, $options: 'i' };
      console.log(`Venue filtresi uygulandı: ${venue}`);
    }
    
    // Seviye filtresi
    if (level) {
      filter.level = level;
    }
    
    // Fiyat filtresi
    if (price_min || price_max) {
      filter.price = {};
      if (price_min) filter.price.$gte = parseInt(price_min);
      if (price_max) filter.price.$lte = parseInt(price_max);
    }
    
    // Sıralama
    let sortOption = {};
    switch (sort) {
      case 'date':
        sortOption = { date: -1 };
        break;
      case 'date_asc':
        sortOption = { date: 1 };
        break;
      case 'price':
        sortOption = { price: 1 };
        break;
      case 'participants':
        sortOption = { 'participants.length': -1 };
        break;
      default:
        sortOption = { date: -1 };
    }
    
    console.log('Filtreleme koşulları:', filter);
    console.log('Sıralama:', sortOption);
    
    // Veritabanından maçları çek
    const matches = await Match.find(filter)
      .populate('organizer', 'username profilePicture')
      .populate('participants', 'username profilePicture')
      .sort(sortOption)
      .limit(parseInt(limit));

    console.log(`${matches.length} maç veritabanından getirildi`);

    // İstatistikler
    const stats = {
      total: matches.length,
      upcoming: matches.filter(m => m.status === 'upcoming').length,
      live: matches.filter(m => m.status === 'live').length,
      completed: matches.filter(m => m.status === 'completed').length,
      today: matches.filter(m => {
        const today = new Date();
        const matchDate = new Date(m.date);
        return matchDate.toDateString() === today.toDateString();
      }).length
    };

    res.json({
      success: true,
      matches: matches,
      count: matches.length,
      stats: stats,
      filters: {
        status,
        date_filter,
        venue,
        level,
        price_min,
        price_max,
        sort
      }
    });
  } catch (error) {
    console.error('Maçlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Maçlar getirilirken hata oluştu',
      error: error.message
    });
  }
});

// GET kullanıcının maçlarını getir
router.get('/user', auth, async (req, res) => {
  try {
    console.log(`Kullanıcı maçları istendi: ${req.user.id}`);
    
    // Kullanıcının organize ettiği veya katıldığı maçlar
    const matches = await Match.find({
      $or: [
        { organizer: req.user.id },
        { participants: req.user.id }
      ]
    })
      .populate('organizer', 'username profilePicture')
      .populate('participants', 'username profilePicture')
      .sort({ date: 1 });
    
    console.log(`${matches.length} kullanıcı maçı bulundu`);
    res.json({
      success: true,
      matches: matches,
      count: matches.length
    });
  } catch (error) {
    console.error('Kullanıcı maçlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı maçları getirilirken hata oluştu',
      error: error.message
    });
  }
});

// GET tek bir maçı getir
router.get('/:id', async (req, res) => {
  try {
    const matchId = req.params.id;
    console.log(`Maç detayı istendi: ${matchId}`);

    const match = await Match.findById(matchId)
      .populate('organizer', 'username profilePicture')
      .populate('participants', 'username profilePicture');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Maç bulunamadı'
      });
    }
    
    console.log(`Maç detayı bulundu: ${match.title}`);
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('Maç detayları getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Maç detayı getirilirken hata oluştu',
      error: error.message
    });
  }
});

// POST yeni maç oluştur
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      venue,
      date,
      startTime,
      endTime,
      maxParticipants,
      price,
      level,
      description,
      isPrivate
    } = req.body;
    
    console.log('Yeni maç oluşturuluyor:', title);
    
    // Maç oluştur
    const newMatch = new Match({
      title,
      venue,
      date,
      startTime,
      endTime,
      organizer: req.user.id,
      participants: [req.user.id], // Organizatör otomatik olarak katılır
      maxParticipants,
      price,
      level,
      description,
      isPrivate
    });
    
    const savedMatch = await newMatch.save();
    console.log('Yeni maç oluşturuldu:', savedMatch.title);
    
    // Populate organizer
    const populatedMatch = await Match.findById(savedMatch._id)
      .populate('organizer', 'username profilePicture')
      .populate('participants', 'username profilePicture');
    
    res.status(201).json({
      success: true,
      data: populatedMatch,
      message: 'Maç başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Maç oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Maç oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// POST maça katıl
router.post('/:id/join', async (req, res) => {
  try {
    const matchId = req.params.id;
    const { userId } = req.body;

    console.log(`Maça katılma isteği: ${matchId}`);

    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Maç bulunamadı'
      });
    }
    
    // Maçın dolu olup olmadığını kontrol et
    if (match.participants.length >= match.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Maç dolu'
      });
    }
    
    // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
    if (match.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Zaten bu maça katıldınız'
      });
    }
    
    // Maça katıl
    match.participants.push(userId);
    await match.save();
    
    // Güncellenmiş maçı populate ile birlikte döndür
    const updatedMatch = await Match.findById(matchId)
      .populate('organizer', 'username profilePicture')
      .populate('participants', 'username profilePicture');

    console.log(`Kullanıcı maça katıldı`);
    
    res.json({
      success: true,
      data: updatedMatch,
      message: 'Maça başarıyla katıldınız'
    });
  } catch (error) {
    console.error('Maça katılma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Maça katılırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 