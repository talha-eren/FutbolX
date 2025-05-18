const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Venue = require('../models/Venue');

// Tüm halı sahaları getir
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find()
      .sort({ rating: -1 })
      .limit(req.query.limit ? parseInt(req.query.limit) : 20);
    
    res.json(venues);
  } catch (error) {
    console.error('Halı sahaları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Halı saha detaylarını getir
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    res.json(venue);
  } catch (error) {
    console.error('Halı saha detayı getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Yeni halı saha ekle
router.post('/', protect, async (req, res) => {
  try {
    const venue = new Venue({
      ...req.body,
      owner: req.user._id
    });
    
    const savedVenue = await venue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    console.error('Halı saha ekleme hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Halı saha güncelle
router.put('/:id', protect, async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    // Sadece sahip güncelleyebilir
    if (venue.owner && venue.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu halı sahayı güncelleme yetkiniz yok' });
    }
    
    Object.keys(req.body).forEach(key => {
      venue[key] = req.body[key];
    });
    
    venue.updatedAt = Date.now();
    const updatedVenue = await venue.save();
    
    res.json(updatedVenue);
  } catch (error) {
    console.error('Halı saha güncelleme hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Halı saha sil
router.delete('/:id', protect, async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    // Sadece sahip silebilir
    if (venue.owner && venue.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu halı sahayı silme yetkiniz yok' });
    }
    
    await venue.remove();
    
    res.json({ message: 'Halı saha başarıyla silindi' });
  } catch (error) {
    console.error('Halı saha silme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Halı saha derecelendirme
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Geçerli bir derecelendirme girin (1-5)' });
    }
    
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    // Mevcut derecelendirme varsa güncelle, yoksa yeni ekle
    const newRating = ((venue.rating * venue.ratingCount) + rating) / (venue.ratingCount + 1);
    venue.rating = parseFloat(newRating.toFixed(1));
    venue.ratingCount += 1;
    
    await venue.save();
    
    res.json({ rating: venue.rating, ratingCount: venue.ratingCount });
  } catch (error) {
    console.error('Halı saha derecelendirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bölgeye göre halı sahaları getir
router.get('/location/:location', async (req, res) => {
  try {
    const location = req.params.location;
    const venues = await Venue.find({
      $or: [
        { city: { $regex: location, $options: 'i' } },
        { district: { $regex: location, $options: 'i' } },
        { location: { $regex: location, $options: 'i' } }
      ]
    }).sort({ rating: -1 });
    
    res.json(venues);
  } catch (error) {
    console.error('Bölgeye göre halı saha getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 