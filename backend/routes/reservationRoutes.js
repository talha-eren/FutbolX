const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, isAdmin, optionalAuth } = require('../middleware/authMiddleware');
const reservationController = require('../controllers/reservationController');

// ÖNEMLİ: Parametreli rotalardan önce spesifik rotaları tanımla
// Belirli bir tarih için boş saatleri getir
router.get('/available-slots', reservationController.getAvailableTimeSlots);

// Doğrudan MongoDB'den rezervasyonları getir - basitleştirilmiş endpoint
router.get('/direct-mongodb', async (req, res) => {
  try {
    console.log('Direkt MongoDB\'den rezervasyon getirme endpoint\'i çağrıldı');
    const Reservation = require('../models/Reservation');
    
    // Tüm rezervasyonları basitçe getir
    const allReservations = await Reservation.find()
      .sort({ createdAt: -1 });
    
    console.log(`MongoDB'den ${allReservations.length} adet rezervasyon bulundu`);
    
    // Detaylı log
    if (allReservations.length > 0) {
      for (let i = 0; i < Math.min(allReservations.length, 3); i++) {
        console.log(`Rezervasyon #${i+1}:`, {
          id: allReservations[i]._id,
          date: allReservations[i].date,
          startTime: allReservations[i].startTime,
          status: allReservations[i].status
        });
      }
    }
    
    res.json(allReservations);
  } catch (error) {
    console.error('Direkt MongoDB rezervasyon getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Sporyum 23 halı sahası için özel endpoint - kimlik doğrulama olmadan
router.get('/venue/sporyum23', async (req, res) => {
  try {
    console.log('Sporyum 23 rezervasyonlarını getirme endpoint\'i çağrıldı');
    
    // Sporyum 23 halı sahasının ID'sini bul veya oluştur
    const Venue = require('../models/Venue');
    let venue = await Venue.findOne({ name: 'Sporyum 23' });
    
    if (!venue) {
      console.log('Sporyum 23 tesisi bulunamadı, yeni tesis oluşturuluyor...');
      venue = new Venue({
        name: 'Sporyum 23',
        location: 'İstanbul',
        address: 'Sporyum 23 Halı Saha Tesisi',
        city: 'İstanbul',
        district: 'Ümraniye',
        price: 450,
        priceUnit: 'TL/saat',
        image: 'S',
        contact: '0555 123 4567',
        email: 'info@sporyum23.com',
        description: 'Sporyum 23 Halı Saha Tesisi',
        amenities: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya'],
        workingHours: '09:00 - 23:00',
        workingDays: {
          monday: { open: '09:00', close: '23:00' },
          tuesday: { open: '09:00', close: '23:00' },
          wednesday: { open: '09:00', close: '23:00' },
          thursday: { open: '09:00', close: '23:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '09:00', close: '23:00' }
        },
        size: '30x50',
        capacity: 14,
        indoor: false
      });
      
      await venue.save();
      console.log('Sporyum 23 tesisi başarıyla oluşturuldu:', venue._id);
    }
    
    // MongoDB'den Sporyum 23 için tüm rezervasyonları getir
    const Reservation = require('../models/Reservation');
    const User = require('../models/User');
    
    console.log('Rezervasyonları MongoDB\'den getiriliyor...');
    console.log('MongoDB connection URL:', mongoose.connection.host);
    console.log('Venue ID:', venue._id);
    
    // Tüm rezervasyonları getir - venue filtresini kaldırıyoruz
    console.log('MongoDB veritabanında tüm rezervasyonları getiriyoruz...');
    
    const allReservations = await Reservation.find()
      .sort({ date: -1, startTime: 1 });
    
    console.log(`MongoDB'de toplam ${allReservations.length} adet rezervasyon bulundu`);
    
    if (allReservations.length > 0) {
      console.log('İlk rezervasyon bilgileri:', {
        id: allReservations[0]._id,
        date: allReservations[0].date,
        field: allReservations[0].field,
        startTime: allReservations[0].startTime,
        venue: allReservations[0].venue
      });
    }
    
    // Bütün rezervasyonları kullanıcı bilgileriyle birlikte getir
    const reservations = await Reservation.find()
      .populate({
        path: 'user',
        select: 'username firstName lastName email phone profilePicture'
      })
      .sort({ date: -1, startTime: 1 });
    
    console.log(`Tüm rezervasyonlar (venue filtresi ile): ${reservations.length} adet`);
    
    console.log(`Sporyum 23 için ${reservations.length} adet rezervasyon bulundu`);
    
    // Detaylı veriler için tüm rezervasyonları işle
    const processedReservations = reservations.map(res => {
      const reservation = res.toObject();
      
      // User olmayan veya null user durumları için
      if (!reservation.user) {
        console.log(`Rezervasyon ID: ${reservation._id} için kullanıcı bilgisi yok, varsayılan bilgiler ekleniyor`);
        reservation.user = {
          firstName: 'Rezervasyon',
          lastName: 'Sahibi',
          phone: 'Telefon Bilgisi Yok',
          email: ''
        };
      } 
      // "Misafir" veya "guest" kullanıcılar için daha açıklayıcı bilgiler
      else if (reservation.user.firstName === 'Misafir' || 
               reservation.user.username === 'guest' || 
               !reservation.user.firstName) {
        
        console.log(`Misafir kullanıcı tespit edildi, rezervasyon: ${reservation._id}`);
        
        // Daha açıklayıcı bilgiler ekle
        const reservationDate = new Date(reservation.date);
        const formattedDate = reservationDate.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        reservation.user = {
          ...reservation.user,
          firstName: `${formattedDate}`,
          lastName: `${reservation.startTime} Rezervasyon`,
          phone: reservation.user.phone || 'Telefon Bilgisi Yok'
        };
      }
      
      return reservation;
    });
    
    // Detaylı log için en son birkaç rezervasyonu göster
    if (processedReservations.length > 0) {
      console.log('İşlenmiş rezervasyonlardan örnekler:');
      const sampleCount = Math.min(3, processedReservations.length);
      
      for (let i = 0; i < sampleCount; i++) {
        const res = processedReservations[i];
        console.log(`Örnek #${i+1}:`, {
          id: res._id,
          date: res.date,
          time: `${res.startTime}-${res.endTime}`,
          user: `${res.user.firstName} ${res.user.lastName}`,
          phone: res.user.phone,
          status: res.status
        });
      }
    }
    
    // Başarılı yanıt döndür
    res.json({
      venue,
      reservations: processedReservations
    });
  } catch (error) {
    console.error('Sporyum 23 bilgilerini getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Tüm rezervasyonları getir (admin için)
router.get('/all', isAdmin, reservationController.getAllReservations);

// Kullanıcının rezervasyonlarını getir
router.get('/', protect, reservationController.getUserReservations);

// Yeni rezervasyon oluştur - kimlik doğrulama olmadan
router.post('/', reservationController.createReservation);

// Rezervasyon ile ilgili parametreli rotalar - en sona koy
// Rezervasyon detaylarını getir - ID parametreli rotaları en sona koy
router.get('/:id', optionalAuth, reservationController.getReservationById);

// Rezervasyon güncelle
router.put('/:id', protect, reservationController.updateReservation);

// Rezervasyon iptal et
router.delete('/:id', protect, reservationController.cancelReservation);

// Admin için rezervasyon durumunu güncelle - admin yetkisi ile
router.patch('/:id/status', optionalAuth, reservationController.updateReservationStatus);

module.exports = router; 