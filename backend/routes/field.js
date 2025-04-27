const express = require('express');
const router = express.Router();
const Field = require('../models/Field');
const auth = require('../middleware/auth');

// Tüm halı sahaları getir
router.get('/', async (req, res) => {
  try {
    const fields = await Field.find().sort({ createdAt: -1 });
    res.json(fields);
  } catch (error) {
    console.error('Halı saha getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ID'ye göre halı saha getir
router.get('/:id', async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    res.json(field);
  } catch (error) {
    console.error('Halı saha detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni halı saha ekle (admin için)
router.post('/', auth, async (req, res) => {
  try {
    const newField = new Field({
      name: req.body.name,
      location: req.body.location,
      price: req.body.price,
      image: req.body.image,
      rating: req.body.rating || 0,
      availability: req.body.availability || 'Müsait',
      description: req.body.description || '',
      features: req.body.features || []
    });

    const savedField = await newField.save();
    res.status(201).json(savedField);
  } catch (error) {
    console.error('Halı saha ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Halı saha güncelle (admin için)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedField = await Field.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body
      },
      { new: true }
    );
    
    if (!updatedField) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    res.json(updatedField);
  } catch (error) {
    console.error('Halı saha güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Halı saha sil (admin için)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedField = await Field.findByIdAndDelete(req.params.id);
    
    if (!deletedField) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    res.json({ message: 'Halı saha başarıyla silindi' });
  } catch (error) {
    console.error('Halı saha silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
