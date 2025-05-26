const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllPlayers,
  matchPlayer,
  getPlayerById,
  getPlayersByPosition,
  updatePlayerStats
} = require('../controllers/playerController');
const Player = require('../models/Player');

// Tüm oyuncuları getir
router.get('/', getAllPlayers);

// Oyuncu eşleştirme
router.post('/match', matchPlayer);

// Pozisyona göre oyuncuları getir
router.get('/position/:position', getPlayersByPosition);

// En iyi oyuncuları getir
router.get('/top/players', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const players = await Player.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(limit);
    
    res.json(players);
  } catch (error) {
    console.error('En iyi oyuncuları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Oyuncu detaylarını getir
router.get('/:id', getPlayerById);

// Yeni oyuncu ekle
router.post('/', protect, async (req, res) => {
  try {
    const player = new Player({
      ...req.body,
      userId: req.user._id
    });
    
    const savedPlayer = await player.save();
    res.status(201).json(savedPlayer);
  } catch (error) {
    console.error('Oyuncu ekleme hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Oyuncu güncelle
router.put('/:id', protect, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }
    
    // Sadece kendisi güncelleyebilir
    if (player.userId && player.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu oyuncuyu güncelleme yetkiniz yok' });
    }
    
    Object.keys(req.body).forEach(key => {
      player[key] = req.body[key];
    });
    
    player.updatedAt = Date.now();
    const updatedPlayer = await player.save();
    
    res.json(updatedPlayer);
  } catch (error) {
    console.error('Oyuncu güncelleme hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Oyuncu sil (pasif yap)
router.delete('/:id', protect, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }
    
    // Sadece kendisi silebilir
    if (player.userId && player.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu oyuncuyu silme yetkiniz yok' });
    }
    
    player.isActive = false;
    await player.save();
    
    res.json({ message: 'Oyuncu başarıyla silindi' });
  } catch (error) {
    console.error('Oyuncu silme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Oyuncu derecelendirme
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Geçerli bir derecelendirme girin (1-5)' });
    }
    
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }
    
    // Mevcut derecelendirme varsa güncelle, yoksa yeni ekle
    const newRating = ((player.rating * player.ratingCount) + rating) / (player.ratingCount + 1);
    player.rating = parseFloat(newRating.toFixed(1));
    player.ratingCount += 1;
    
    await player.save();
    
    res.json({ rating: player.rating, ratingCount: player.ratingCount });
  } catch (error) {
    console.error('Oyuncu derecelendirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Oyuncu istatistiklerini güncelle
router.put('/:id/stats', protect, updatePlayerStats);

module.exports = router; 