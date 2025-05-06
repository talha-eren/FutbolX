const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Field = require('../models/Field');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Tüm rezervasyonları getir (Admin için)
router.get('/admin', auth, async (req, res) => {
  try {
    // Kullanıcı admin mi kontrol et
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const reservations = await Reservation.find()
      .populate('field', 'name location image')
      .populate('user', 'username name profilePicture')
      .sort({ date: 1, startTime: 1 });

    res.json(reservations);
  } catch (err) {
    console.error('Rezervasyon listeleme hatası:', err.message);
    res.status(500).send('Sunucu hatası');
  }
});

// Kullanıcının kendi rezervasyonlarını getir
router.get('/my', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('field', 'name location image price')
      .sort({ date: -1 });

    res.json(reservations);
  } catch (err) {
    console.error('Rezervasyon listeleme hatası:', err.message);
    res.status(500).send('Sunucu hatası');
  }
});

// Belirli bir halı sahanın rezervasyonlarını getir
router.get('/field/:fieldId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      field: req.params.fieldId,
      status: { $ne: 'İptal Edildi' },
      date: { $gte: new Date() } 
    })
    .select('date startTime endTime status')
    .sort({ date: 1, startTime: 1 });

    res.json(reservations);
  } catch (err) {
    console.error('Saha rezervasyonları listeleme hatası:', err.message);
    res.status(500).send('Sunucu hatası');
  }
});

// Belirli bir tarihteki müsait saatleri kontrol et
router.get('/available/:fieldId/:date', async (req, res) => {
  try {
    const { fieldId, date } = req.params;
    
    // Tarih formatını kontrol et
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Geçersiz tarih formatı' });
    }
    
    // Seçilen tarihteki tüm rezervasyonları getir
    const reservations = await Reservation.find({
      field: fieldId,
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'İptal Edildi' }
    }).select('startTime endTime');
    
    // Halı sahanın çalışma saatlerini getir (varsayılan: 08:00-23:00)
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    // Müsait saatleri hesapla
    const workingHours = {
      start: '08:00',
      end: '23:00'
    };
    
    // Saat aralıklarını oluştur (1 saatlik dilimler)
    const timeSlots = [];
    let currentHour = parseInt(workingHours.start.split(':')[0]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    
    while (currentHour < endHour) {
      const startTime = `${currentHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(currentHour + 1).toString().padStart(2, '0')}:00`;
      
      // Bu saat aralığında rezervasyon var mı kontrol et
      const isReserved = reservations.some(reservation => 
        reservation.startTime <= startTime && reservation.endTime > startTime
      );
      
      timeSlots.push({
        startTime,
        endTime,
        available: !isReserved
      });
      
      currentHour++;
    }
    
    res.json(timeSlots);
  } catch (err) {
    console.error('Müsait saatler kontrolü hatası:', err.message);
    res.status(500).send('Sunucu hatası');
  }
});

// Yeni rezervasyon oluştur
router.post(
  '/',
  [
    auth,
    [
      check('fieldId', 'Halı saha ID gerekli').not().isEmpty(),
      check('date', 'Geçerli bir tarih gerekli').isISO8601(),
      check('startTime', 'Başlangıç saati gerekli').not().isEmpty(),
      check('endTime', 'Bitiş saati gerekli').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fieldId, date, startTime, endTime, notes } = req.body;

    try {
      // Halı sahayı kontrol et
      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Halı saha bulunamadı' });
      }

      // Seçilen tarih ve saat için müsaitlik kontrolü
      const existingReservation = await Reservation.findOne({
        field: fieldId,
        date: new Date(date),
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        status: { $ne: 'İptal Edildi' }
      });

      if (existingReservation) {
        return res.status(400).json({ message: 'Seçilen saat aralığı dolu' });
      }

      // Toplam fiyatı hesapla (saat başına)
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      const hours = endHour - startHour;
      const totalPrice = field.price * hours;

      // Yeni rezervasyon oluşturmadan önce tekrar kontrol et
      // Aynı kullanıcının aynı saha için aynı tarih ve saatte rezervasyonu var mı?
      const userExistingReservation = await Reservation.findOne({
        field: fieldId,
        user: req.user.id,
        date: new Date(date),
        startTime: startTime,
        endTime: endTime,
        status: { $ne: 'İptal Edildi' }
      });
      
      if (userExistingReservation) {
        return res.status(400).json({ 
          message: 'Zaten bu saat aralığında bir rezervasyonunuz bulunmaktadır.' 
        });
      }
      
      // Yeni rezervasyon oluştur
      const newReservation = new Reservation({
        field: fieldId,
        user: req.user.id,
        date: new Date(date),
        startTime,
        endTime,
        totalPrice,
        notes
      });

      try {
        await newReservation.save();
      } catch (saveError) {
        if (saveError.code === 11000) {
          return res.status(400).json({ 
            message: 'Bu saat aralığı için zaten bir rezervasyon bulunmaktadır.' 
          });
        }
        throw saveError;
      }

      // Rezervasyon detaylarını döndür
      const reservation = await Reservation.findById(newReservation._id)
        .populate('field', 'name location image')
        .populate('user', 'username name');

      res.json(reservation);
    } catch (err) {
      console.error('Rezervasyon oluşturma hatası:', err.message);
      res.status(500).send('Sunucu hatası');
    }
  }
);

// Rezervasyon güncelle (sadece durum değişikliği için)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Onay Bekliyor', 'Onaylandı', 'İptal Edildi', 'Tamamlandı'].includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum değeri' });
    }
    
    // Rezervasyonu bul
    let reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Yetki kontrolü (kullanıcı kendi rezervasyonunu veya admin)
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Kullanıcılar sadece iptal edebilir, diğer durumlar admin için
    if (req.user.role !== 'admin' && status !== 'İptal Edildi') {
      return res.status(403).json({ message: 'Sadece iptal işlemi yapabilirsiniz' });
    }
    
    // Durumu güncelle
    reservation.status = status;
    await reservation.save();
    
    res.json(reservation);
  } catch (err) {
    console.error('Rezervasyon güncelleme hatası:', err.message);
    res.status(500).send('Sunucu hatası');
  }
});

// Rezervasyon iptal et
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Yetki kontrolü
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Rezervasyonu iptal et (silmek yerine durumunu değiştir)
    reservation.status = 'İptal Edildi';
    await reservation.save();
    
    res.json({ message: 'Rezervasyon iptal edildi' });
  } catch (err) {
    console.error('Rezervasyon iptal hatası:', err.message);
    res.status(500).send('Sunucu hatası');
  }
});

module.exports = router;
