const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const Venue = require('../models/Venue');
const { protect } = require('../middleware/authMiddleware');

// Tüm maçları getir
router.get('/', async (req, res) => {
  try {
    // Filtreler
    const filter = { };
    
    // Durum filtresi (açık, dolu, iptal, tamamlandı)
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Tarih filtresi - verilen tarihten sonraki maçlar
    if (req.query.dateFrom) {
      filter.date = { $gte: new Date(req.query.dateFrom) };
    }
    
    // Tarih filtresi - verilen tarihten önceki maçlar
    if (req.query.dateTo) {
      if (filter.date) {
        filter.date.$lte = new Date(req.query.dateTo);
      } else {
        filter.date = { $lte: new Date(req.query.dateTo) };
      }
    }
    
    // Venue (halı saha) filtresi
    if (req.query.venue) {
      filter.venue = req.query.venue;
    }
    
    // Oyuncu filtresi - belirli bir oyuncunun olduğu maçlar
    if (req.query.player) {
      filter['players.player'] = req.query.player;
    }
    
    // Düzenleyici filtresi
    if (req.query.organizer) {
      filter.organizer = req.query.organizer;
    }
    
    // Sıralama
    const sort = {};
    
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      
      const sortDirection = req.query.sort.startsWith('-') ? -1 : 1;
      sort[sortField] = sortDirection;
    } else {
      // Varsayılan sıralama: Tarih (azalan)
      sort.date = -1;
    }
    
    // Limit ve sayfalama
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Maçları sorgula
    const matches = await Match.find(filter)
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Toplam maç sayısını al
    const total = await Match.countDocuments(filter);
    
    res.json({
      matches,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Maçlar listelenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Belirli bir maçı getir
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('venue', 'name location price')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage');
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    res.json(match);
  } catch (error) {
    console.error('Maç detayları alınırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni maç oluştur
router.post('/', protect, async (req, res) => {
  try {
    const venueId = req.body.venue;
    
    // Venue'nün varlığını kontrol et
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Belirtilen halı saha bulunamadı' });
    }
    
    // Gelen veriyi kontrol et
    console.log('Yeni maç isteği alındı:', JSON.stringify(req.body, null, 2));
    
    // Skoru hazırla
    let score = req.body.score;
    if (!score) {
      score = {
        teamA: {
          name: 'Formalı Takım',
          goals: 0
        },
        teamB: {
          name: 'Formasız Takım',
          goals: 0
        }
      };
    }
    
    const newMatch = new Match({
      ...req.body,
      score: score,
      organizer: req.user._id,
      // Organizatörü oyuncular listesine ekle
      players: [{
        player: req.user._id,
        team: req.body.organizerTeam || 'A',
        position: req.body.organizerPosition || ''
      }]
    });
    
    const savedMatch = await newMatch.save();
    console.log('Kaydedilen maç:', JSON.stringify(savedMatch, null, 2));
    
    // Oluşturulan maçı venue ve organizer bilgileriyle birlikte döndür
    const populatedMatch = await Match.findById(savedMatch._id)
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage');
    
    res.status(201).json(populatedMatch);
  } catch (error) {
    console.error('Maç oluşturulurken hata:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Maça katıl
router.post('/:id/join', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Maç açık mı kontrol et
    if (match.status !== 'açık') {
      return res.status(400).json({ message: `Maça katılamazsınız. Maç durumu: ${match.status}` });
    }
    
    // Oyuncu zaten maçta mı kontrol et
    const isPlayerAlreadyInMatch = match.players.some(
      player => player.player.toString() === req.user._id.toString()
    );
    
    if (isPlayerAlreadyInMatch) {
      return res.status(400).json({ message: 'Zaten bu maça katıldınız' });
    }
    
    // Maçta yer var mı kontrol et
    if (match.players.length >= match.maxPlayers) {
      // Maçı dolu olarak işaretle
      match.status = 'dolu';
      await match.save();
      
      return res.status(400).json({ message: 'Maç dolu, katılamazsınız' });
    }
    
    // Oyuncuyu maça ekle
    const { team, position } = req.body;
    
    match.players.push({
      player: req.user._id,
      team: team || 'A',
      position: position || ''
    });
    
    // Maç doldu mu kontrol et
    if (match.players.length >= match.maxPlayers) {
      match.status = 'dolu';
    }
    
    await match.save();
    
    // Güncellenmiş maç bilgilerini döndür
    const updatedMatch = await Match.findById(req.params.id)
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage');
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('Maça katılırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Maçtan ayrıl
router.delete('/:id/leave', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Oyuncu maçta mı kontrol et
    const playerIndex = match.players.findIndex(
      player => player.player.toString() === req.user._id.toString()
    );
    
    if (playerIndex === -1) {
      return res.status(400).json({ message: 'Bu maça katılmadınız' });
    }
    
    // Organizatör maçtan ayrılamaz
    if (match.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Organizatör olarak maçtan ayrılamazsınız' });
    }
    
    // Oyuncuyu maçtan çıkar
    match.players.splice(playerIndex, 1);
    
    // Maç dolu ise durumu açık olarak güncelle
    if (match.status === 'dolu') {
      match.status = 'açık';
    }
    
    await match.save();
    
    // Güncellenmiş maç bilgilerini döndür
    const updatedMatch = await Match.findById(req.params.id)
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage');
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('Maçtan ayrılırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Maç bilgilerini güncelle (sadece organizatör)
router.put('/:id', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Kullanıcı organizatör mü kontrol et
    if (match.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'venue_owner') {
      return res.status(403).json({ message: 'Sadece organizatör, admin veya halı saha sahibi maçı güncelleyebilir' });
    }
    
    // Özel alanları güncelleme işleminden çıkar
    const { players, organizer, ...updateData } = req.body;
    
    console.log('Güncellenecek veri:', JSON.stringify(updateData, null, 2));
    
    // Skor bilgisini kontrol et
    if (!updateData.score) {
      updateData.score = {
        teamA: {
          name: 'Formalı Takım',
          goals: 0
        },
        teamB: {
          name: 'Formasız Takım',
          goals: 0
        }
      };
    }
    
    // Maçı güncelle
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage');
    
    console.log('Güncellenen maç:', JSON.stringify(updatedMatch, null, 2));
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('Maç güncellenirken hata:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Maçı iptal et (sadece organizatör)
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Kullanıcı organizatör mü kontrol et
    if (match.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sadece organizatör maçı iptal edebilir' });
    }
    
    // Maç zaten iptal edilmiş mi kontrol et
    if (match.status === 'iptal') {
      return res.status(400).json({ message: 'Maç zaten iptal edilmiş' });
    }
    
    // Maçı iptal et
    match.status = 'iptal';
    await match.save();
    
    // Güncellenmiş maç bilgilerini döndür
    const updatedMatch = await Match.findById(req.params.id)
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage');
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('Maç iptal edilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Maçı tamamla (sadece organizatör)
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Kullanıcı organizatör mü kontrol et
    if (match.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'venue_owner') {
      return res.status(403).json({ message: 'Sadece organizatör, admin veya halı saha sahibi maçı tamamlayabilir' });
    }
    
    // Maç zaten tamamlanmış mı kontrol et
    if (match.status === 'tamamlandı') {
      return res.status(400).json({ message: 'Maç zaten tamamlanmış' });
    }
    
    // Maç zaten iptal edilmiş mi kontrol et
    if (match.status === 'iptal') {
      return res.status(400).json({ message: 'İptal edilmiş bir maç tamamlanamaz' });
    }
    
    // Maçı tamamla
    match.status = 'tamamlandı';
    
    // Varsayılan skor bilgisini ekle
    if (!match.score) {
      match.score = {
        teamA: {
          name: 'Formalı Takım',
          goals: 0
        },
        teamB: {
          name: 'Formasız Takım',
          goals: 0
        }
      };
    }
    
    await match.save();
    
    // Güncellenmiş maç bilgilerini döndür
    const updatedMatch = await Match.findById(req.params.id)
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .populate('players.player', 'name email profileImage');
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('Maç tamamlanırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcının maçlarını getir
router.get('/user/me', protect, async (req, res) => {
  try {
    const matches = await Match.find({
      'players.player': req.user._id
    })
      .populate('venue', 'name location')
      .populate('organizer', 'name email profileImage')
      .sort({ date: 1 });
    
    res.json(matches);
  } catch (error) {
    console.error('Kullanıcı maçları listelenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Skor verilerini düzelt (admin için)
router.post('/migrate-scores', protect, async (req, res) => {
  try {
    // Sadece admin kullanıcılar bu endpoint'i kullanabilir
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Tüm maçları getir
    const matches = await Match.find();
    let fixedCount = 0;
    
    // Her bir maçı kontrol et ve güncelle
    for (const match of matches) {
      let updated = false;
      
      // Takım A skorunu kontrol et
      if (match.score && match.score.teamA && 
          match.score.teamA.name && 
          !isNaN(Number(match.score.teamA.name)) && 
          (!match.score.teamA.goals || match.score.teamA.goals === 0)) {
        // Skor name alanında, goals alanına taşı
        match.score.teamA.goals = Number(match.score.teamA.name);
        updated = true;
      }
      
      // Takım B skorunu kontrol et
      if (match.score && match.score.teamB && 
          match.score.teamB.name && 
          !isNaN(Number(match.score.teamB.name)) && 
          (!match.score.teamB.goals || match.score.teamB.goals === 0)) {
        // Skor name alanında, goals alanına taşı
        match.score.teamB.goals = Number(match.score.teamB.name);
        updated = true;
      }
      
      // Takım isimlerini düzelt
      if (match.score && match.score.teamA && !isNaN(Number(match.score.teamA.name))) {
        match.score.teamA.name = 'Formalı Takım';
        updated = true;
      }
      
      if (match.score && match.score.teamB && !isNaN(Number(match.score.teamB.name))) {
        match.score.teamB.name = 'Formasız Takım';
        updated = true;
      }
      
      // Değişiklik varsa kaydet
      if (updated) {
        await match.save();
        fixedCount++;
      }
    }
    
    res.json({ 
      message: `${fixedCount} maçın skor verileri başarıyla düzeltildi`,
      fixedCount 
    });
  } catch (error) {
    console.error('Skor verileri düzeltilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Maçı sil (sadece organizatör veya admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Kullanıcı organizatör veya admin mi kontrol et
    if (match.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu maçı silme yetkiniz yok' });
    }
    
    await Match.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Maç başarıyla silindi' });
  } catch (error) {
    console.error('Maç silinirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 