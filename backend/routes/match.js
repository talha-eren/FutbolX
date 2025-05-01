const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// GET tüm maçları getir
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().populate('organizer', 'username profilePicture').sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    console.error('Maçları getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET kullanıcının maçlarını getir
router.get('/user', auth, async (req, res) => {
  try {
    // Kullanıcının organize ettiği veya katıldığı maçlar
    const matches = await Match.find({
      $or: [
        { organizer: req.user.id },
        { players: req.user.id }
      ]
    }).populate('organizer', 'username profilePicture').sort({ date: 1 });
    
    res.json(matches);
  } catch (err) {
    console.error('Kullanıcı maçlarını getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET tek bir maçı getir
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('organizer', 'username profilePicture')
      .populate('players', 'username profilePicture');
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    res.json(match);
  } catch (err) {
    console.error('Maç detayları getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST yeni maç oluştur
router.post('/', auth, async (req, res) => {
  try {
    const { fieldName, location, date, time, price, totalPlayers, level, image, isPrivate } = req.body;
    
    // Maç oluştur
    const newMatch = new Match({
      fieldName,
      location,
      date,
      time,
      price,
      organizer: req.user.id,
      totalPlayers,
      level,
      image,
      isPrivate,
      players: [req.user.id] // Organizatör otomatik olarak katılır
    });
    
    await newMatch.save();
    
    // Populate organizer
    const match = await Match.findById(newMatch._id).populate('organizer', 'username profilePicture');
    
    res.status(201).json(match);
  } catch (err) {
    console.error('Maç oluşturma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT maça katıl
router.put('/:id/join', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Maçın dolu olup olmadığını kontrol et
    if (match.playersJoined >= match.totalPlayers) {
      return res.status(400).json({ message: 'Maç dolu' });
    }
    
    // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
    if (match.players.includes(req.user.id)) {
      return res.status(400).json({ message: 'Zaten bu maça katıldınız' });
    }
    
    // Maça katıl
    match.players.push(req.user.id);
    match.playersJoined = match.players.length;
    
    await match.save();
    
    res.json(match);
  } catch (err) {
    console.error('Maça katılma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// DELETE maçtan ayrıl
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    
    // Organizatör ise çıkamaz
    if (match.organizer.toString() === req.user.id) {
      return res.status(400).json({ message: 'Maçın organizatörü ayrılamaz' });
    }
    
    // Kullanıcının maçta olup olmadığını kontrol et
    if (!match.players.includes(req.user.id)) {
      return res.status(400).json({ message: 'Bu maça zaten kayıtlı değilsiniz' });
    }
    
    // Maçtan çık
    match.players = match.players.filter(player => player.toString() !== req.user.id);
    match.playersJoined = match.players.length;
    
    await match.save();
    
    res.json({ message: 'Maçtan başarıyla ayrıldınız' });
  } catch (err) {
    console.error('Maçtan ayrılma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 