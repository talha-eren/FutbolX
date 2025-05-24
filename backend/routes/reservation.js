const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Field = require('../models/Field');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');

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
    const { indoorFieldId } = req.query; // Kapalı saha ID'si query parametresi olarak alınıyor
    
    // Tarih formatını kontrol et
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Geçersiz tarih formatı' });
    }
    
    // Halı sahanın varlığını kontrol et
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Halı saha bulunamadı' });
    }
    
    // Sporyum 23 için özel kontrol
    if (fieldId === 'sporyum23' && !indoorFieldId) {
      return res.status(400).json({ message: 'Sporyum 23 için kapalı saha ID\'si gereklidir' });
    }
    
    // Müsait saatleri kontrol et
    const timeSlots = await Reservation.checkAvailability(fieldId, indoorFieldId, selectedDate);
    
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

    const { fieldId, indoorFieldId, date, startTime, endTime, notes, totalPrice, matchType, participants } = req.body;

    try {
      console.log('Rezervasyon isteği alındı:', {
        fieldId,
        indoorFieldId,
        userId: req.user.id,
        date,
        startTime,
        endTime
      });
      
      // Kullanıcı kontrolü
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.' });
      }
      
      // Sporyum 23 için özel durum - Field kontrolünü atlayıp doğrudan sabit ID kullan
      let fieldData;
      
      if (fieldId === 'sporium23' || fieldId.includes('sporyum')) {
        // Sabit field ID kullan (yeni bir ObjectID oluştur)
        fieldData = {
          _id: new mongoose.Types.ObjectId(),
          name: 'Sporium 23 Halı Saha',
          slugId: 'sporium23',
          location: 'Elazığ'
        };
        
        console.log('Sporyum 23 özel durumu tanımlandı:', fieldData._id);
      } else {
        // Diğer sahalar için normal akış
        let fieldQuery = {};
        
        // fieldId bir ObjectId formatında mı kontrol et
        if (fieldId && fieldId.match(/^[0-9a-fA-F]{24}$/)) {
          fieldQuery = { _id: fieldId };
        } else {
          // String ID'yi name veya slugId alanında ara
          fieldQuery = { 
            $or: [
              { slugId: fieldId },
              { name: fieldId }
            ]
          };
        }

        // Alan bilgisini bul
        const field = await Field.findOne(fieldQuery);
        
        if (!field) {
          console.log('Saha bulma hatası: Alan bulunamadı -', fieldId);
          return res.status(404).json({ message: 'Alan bulunamadı' });
        }
        
        fieldData = field;
        console.log('Alan bilgisi bulundu:', field._id);
      }
      
      // Sporyum 23 için özel kontrol
      if (fieldId === 'sporium23' && !indoorFieldId) {
        return res.status(400).json({ message: 'Sporyum 23 için kapalı saha ID\'si gereklidir' });
      }

      // Seçilen tarih ve saat için müsaitlik kontrolü
      // Sporyum 23 için basitleştirilmiş müsaitlik kontrolü
      if (fieldId === 'sporium23' || fieldId.includes('sporyum')) {
        // Çakışan rezervasyon kontrolü yap
        const existingReservation = await Reservation.findOne({
          // field alanını kullan, fieldId değil
          field: fieldData._id,
          indoorField: indoorFieldId,
          date: {
            $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
          },
          startTime,
          endTime,
          status: { $ne: 'İptal Edildi' }
        });
        
        if (existingReservation) {
          console.log('Çakışan rezervasyon bulundu:', existingReservation._id);
          return res.status(400).json({ 
            message: 'Seçilen saat aralığı dolu',
            conflictingReservation: {
              id: existingReservation._id,
              date: existingReservation.date,
              startTime: existingReservation.startTime,
              endTime: existingReservation.endTime
            }
          });
        }
      } else {
        // Normal müsaitlik kontrolü
        try {
          const existingReservation = await Reservation.checkConflict(
            fieldData._id, 
            indoorFieldId, 
            date, 
            startTime, 
            endTime
          );

          if (existingReservation) {
            console.log('Çakışan rezervasyon bulundu:', existingReservation._id);
            return res.status(400).json({ 
              message: 'Seçilen saat aralığı dolu',
              conflictingReservation: {
                id: existingReservation._id,
                date: existingReservation.date,
                startTime: existingReservation.startTime,
                endTime: existingReservation.endTime
              }
            });
          }
        } catch (conflictError) {
          console.error('Çakışma kontrolü hatası:', conflictError);
          return res.status(500).json({ message: 'Müsaitlik kontrolü sırasında hata oluştu' });
        }
      }

      // Geçmiş tarih kontrolü
      const reservationDate = new Date(date);
      const now = new Date();
      if (reservationDate < now) {
        return res.status(400).json({ message: 'Geçmiş tarihler için rezervasyon yapılamaz' });
      }

      // Toplam fiyatı hesapla (eğer gönderilmemişse)
      let calculatedTotalPrice = totalPrice;
      if (!calculatedTotalPrice) {
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
        const hours = endHour - startHour;
        
        // Saat farkı kontrolü
        if (hours <= 0) {
          return res.status(400).json({ message: 'Bitiş saati başlangıç saatinden sonra olmalıdır' });
        }
        
        // Sporyum 23 için kapalı sahalara göre fiyatlandırma
        if (fieldId === 'sporium23') {
          let hourlyRate = 450; // Varsayılan fiyat
          
          // Kapalı sahaya göre fiyat belirle
          if (indoorFieldId === 'sporyum23-indoor-1') {
            hourlyRate = 450;
          } else if (indoorFieldId === 'sporyum23-indoor-2') {
            hourlyRate = 400;
          } else if (indoorFieldId === 'sporyum23-indoor-3') {
            hourlyRate = 350;
          }
          
          calculatedTotalPrice = hourlyRate * hours;
        } else {
          calculatedTotalPrice = fieldData.price || 350;
        }
      }

      // Yeni rezervasyon oluştur
      const newReservation = new Reservation({
        field: fieldData._id, // Field ID'si kullan
        indoorField: indoorFieldId,
        user: req.user.id,
        date,
        startTime,
        endTime,
        totalPrice: calculatedTotalPrice,
        notes,
        matchType: matchType || 'Özel Maç',
        participants: participants || []
      });

      console.log('Yeni rezervasyon oluşturuluyor:', {
        field: newReservation.field,
        indoorField: newReservation.indoorField,
        date: newReservation.date,
        startTime: newReservation.startTime,
        endTime: newReservation.endTime,
        user: newReservation.user
      });

      // Burada rezervasyonu kaydedelim
      let savedReservation;
      try {
        savedReservation = await newReservation.save();
        console.log('Rezervasyon başarıyla kaydedildi:', savedReservation._id);
        
        // Başarılı kayıt kontrolü
        if (!savedReservation || !savedReservation._id) {
          console.error('Rezervasyon kaydedildi ancak ID bulunamadı');
          return res.status(500).json({ message: 'Rezervasyon kaydedilirken bir hata oluştu' });
        }
      } catch (saveError) {
        if (saveError.code === 11000) {
          console.error('Duplicate key hatası:', saveError);
          return res.status(400).json({ 
            message: 'Bu saat aralığı için zaten bir rezervasyon bulunmaktadır.',
            error: saveError.message
          });
        }
        console.error('Rezervasyon kaydetme hatası:', saveError);
        return res.status(500).json({ 
          message: 'Rezervasyon kaydedilirken bir hata oluştu: ' + saveError.message,
          error: saveError.toString()
        });
      }

      // Rezervasyon detaylarını döndür
      try {
        const reservation = await Reservation.findById(savedReservation._id)
          .populate('field', 'name location image')
          .populate('user', 'username name');

        if (!reservation) {
          console.error('Rezervasyon kaydedildi ancak geri alınamadı');
          return res.status(200).json({ 
            message: 'Rezervasyon oluşturuldu ancak detayları alınamadı',
            success: true,
            reservation: {
              _id: savedReservation._id,
              date: savedReservation.date,
              startTime: savedReservation.startTime,
              endTime: savedReservation.endTime,
              status: savedReservation.status
            }
          });
        }

        console.log('Rezervasyon başarıyla oluşturuldu:', reservation._id);
        res.status(201).json(reservation);
      } catch (populateError) {
        console.error('Rezervasyon detayları alınamadı:', populateError);
        return res.status(201).json({
          message: 'Rezervasyon oluşturuldu ancak detayları alınamadı',
          success: true,
          _id: savedReservation._id,
          date: savedReservation.date,
          startTime: savedReservation.startTime,
          endTime: savedReservation.endTime,
          status: savedReservation.status
        });
      }
    } catch (err) {
      console.error('Rezervasyon oluşturma hatası:', err);
      res.status(500).json({ 
        message: 'Sunucu hatası: ' + (err.message || 'Bilinmeyen hata'),
        error: err.toString()
      });
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
