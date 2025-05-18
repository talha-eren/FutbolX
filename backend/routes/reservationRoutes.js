const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Reservation = require('../models/Reservation');
const Venue = require('../models/Venue');

// Tüm rezervasyonları getir (admin için)
router.get('/all', protect, async (req, res) => {
  try {
    // Admin kontrolü yapılabilir
    const reservations = await Reservation.find()
      .populate('venue', 'name location image')
      .populate('user', 'username profilePicture')
      .sort({ date: 1, startTime: 1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcının rezervasyonlarını getir
router.get('/', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('venue', 'name location image rating')
      .sort({ date: 1, startTime: 1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Kullanıcı rezervasyonlarını getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rezervasyon detaylarını getir
router.get('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('venue', 'name location image rating price amenities')
      .populate('user', 'username profilePicture')
      .populate('participants', 'username profilePicture');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Sadece rezervasyonu yapan kişi veya admin görebilir
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu rezervasyonu görüntüleme yetkiniz yok' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Rezervasyon detayı getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Yeni rezervasyon oluştur
router.post('/', protect, async (req, res) => {
  try {
    // Halı saha kontrolü
    const venue = await Venue.findById(req.body.venue);
    if (!venue) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    // Aynı tarih ve saatte başka rezervasyon var mı kontrol et
    const existingReservation = await Reservation.findOne({
      venue: req.body.venue,
      date: new Date(req.body.date),
      $or: [
        {
          $and: [
            { startTime: { $lte: req.body.startTime } },
            { endTime: { $gt: req.body.startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: req.body.endTime } },
            { endTime: { $gte: req.body.endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: req.body.startTime } },
            { endTime: { $lte: req.body.endTime } }
          ]
        }
      ],
      status: { $nin: ['iptal edildi'] }
    });
    
    if (existingReservation) {
      return res.status(400).json({ message: 'Bu tarih ve saatte başka bir rezervasyon bulunuyor' });
    }
    
    const reservation = new Reservation({
      ...req.body,
      user: req.user._id,
      participants: req.body.participants || [req.user._id]
    });
    
    const savedReservation = await reservation.save();
    
    // Populate edilmiş rezervasyon bilgilerini döndür
    const populatedReservation = await Reservation.findById(savedReservation._id)
      .populate('venue', 'name location image rating')
      .populate('user', 'username profilePicture');
    
    res.status(201).json(populatedReservation);
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Rezervasyon güncelle
router.put('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Sadece rezervasyonu yapan kişi güncelleyebilir
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu rezervasyonu güncelleme yetkiniz yok' });
    }
    
    // Tarih veya saat değişiyorsa çakışma kontrolü yap
    if (req.body.date || req.body.startTime || req.body.endTime) {
      const existingReservation = await Reservation.findOne({
        _id: { $ne: req.params.id }, // Kendisi hariç
        venue: reservation.venue,
        date: req.body.date ? new Date(req.body.date) : reservation.date,
        $or: [
          {
            $and: [
              { startTime: { $lte: req.body.startTime || reservation.startTime } },
              { endTime: { $gt: req.body.startTime || reservation.startTime } }
            ]
          },
          {
            $and: [
              { startTime: { $lt: req.body.endTime || reservation.endTime } },
              { endTime: { $gte: req.body.endTime || reservation.endTime } }
            ]
          },
          {
            $and: [
              { startTime: { $gte: req.body.startTime || reservation.startTime } },
              { endTime: { $lte: req.body.endTime || reservation.endTime } }
            ]
          }
        ],
        status: { $nin: ['iptal edildi'] }
      });
      
      if (existingReservation) {
        return res.status(400).json({ message: 'Bu tarih ve saatte başka bir rezervasyon bulunuyor' });
      }
    }
    
    // Güncellenemeyecek alanlar
    const { user, ...updateData } = req.body;
    
    Object.keys(updateData).forEach(key => {
      reservation[key] = updateData[key];
    });
    
    const updatedReservation = await reservation.save();
    
    res.json(updatedReservation);
  } catch (error) {
    console.error('Rezervasyon güncelleme hatası:', error);
    res.status(400).json({ message: error.message });
  }
});

// Rezervasyon iptal et
router.delete('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Sadece rezervasyonu yapan kişi iptal edebilir
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu rezervasyonu iptal etme yetkiniz yok' });
    }
    
    reservation.status = 'iptal edildi';
    await reservation.save();
    
    res.json({ message: 'Rezervasyon başarıyla iptal edildi' });
  } catch (error) {
    console.error('Rezervasyon iptal hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Halı sahaya göre rezervasyonları getir
router.get('/venue/:venueId', async (req, res) => {
  try {
    const reservations = await Reservation.find({
      venue: req.params.venueId,
      status: { $ne: 'iptal edildi' }
    })
    .select('date startTime endTime status')
    .sort({ date: 1, startTime: 1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Halı sahaya göre rezervasyon getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Tarih aralığına göre rezervasyonları getir
router.get('/date/:startDate/:endDate', protect, async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: 'Geçersiz tarih formatı' });
    }
    
    const reservations = await Reservation.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: 'iptal edildi' }
    })
    .populate('venue', 'name location image rating')
    .sort({ date: 1, startTime: 1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Tarih aralığına göre rezervasyon getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rezervasyona katılımcı ekle
router.post('/:id/participants', protect, async (req, res) => {
  try {
    const { participantIds } = req.body;
    
    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ message: 'Geçerli katılımcı listesi gerekli' });
    }
    
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Sadece rezervasyonu yapan kişi katılımcı ekleyebilir
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu rezervasyona katılımcı ekleme yetkiniz yok' });
    }
    
    // Yeni katılımcıları ekle (tekrarları önle)
    participantIds.forEach(id => {
      if (!reservation.participants.includes(id)) {
        reservation.participants.push(id);
      }
    });
    
    await reservation.save();
    
    res.json({ message: 'Katılımcılar başarıyla eklendi', participants: reservation.participants });
  } catch (error) {
    console.error('Rezervasyona katılımcı ekleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 