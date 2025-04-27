const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Tüm etkinlikleri getir
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Etkinlik getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ID'ye göre etkinlik getir
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    res.json(event);
  } catch (error) {
    console.error('Etkinlik detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni etkinlik ekle
router.post('/', auth, async (req, res) => {
  try {
    const newEvent = new Event({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
      time: req.body.time,
      image: req.body.image,
      maxParticipants: req.body.maxParticipants,
      organizer: req.user.id
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Etkinlik ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Etkinliğe katıl
router.post('/:id/join', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    
    if (event.participants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Etkinlik dolu' });
    }
    
    event.participants += 1;
    await event.save();
    
    res.json({ message: 'Etkinliğe başarıyla katıldınız', event });
  } catch (error) {
    console.error('Etkinliğe katılma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Etkinlik güncelle (sadece organizatör)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    
    // Sadece organizatör güncelleyebilir
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Etkinlik güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Etkinlik sil (sadece organizatör)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    
    // Sadece organizatör silebilir
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Etkinlik başarıyla silindi' });
  } catch (error) {
    console.error('Etkinlik silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
