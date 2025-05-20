const Reservation = require('../models/Reservation');
const Venue = require('../models/Venue');

// Tüm rezervasyonları getir (admin için)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('venue', 'name location image')
      .populate('user', 'username firstName lastName profilePicture')
      .sort({ date: 1, startTime: 1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcının rezervasyonlarını getir
exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('venue', 'name location image rating')
      .sort({ date: 1, startTime: 1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Kullanıcı rezervasyonlarını getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Rezervasyon detaylarını getir
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('venue', 'name location image rating price amenities')
      .populate('user', 'username firstName lastName profilePicture')
      .populate('participants', 'username profilePicture');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Rezervasyon detayı getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Yeni rezervasyon oluştur
exports.createReservation = async (req, res) => {
  try {
    console.log('Rezervasyon oluşturma isteği:', req.body);
    
    // Gerekli alanların kontrolü
    if (!req.body.venue || !req.body.date || !req.body.startTime || !req.body.endTime || !req.body.price) {
      return res.status(400).json({ message: 'Eksik bilgi: venue, date, startTime, endTime ve price alanları zorunludur' });
    }
    
    // Halı saha kontrolü - ID veya isim ile bul
    let venue;
    
    // MongoDB ObjectId formatında mı kontrol et
    if (req.body.venue && req.body.venue.match(/^[0-9a-fA-F]{24}$/)) {
      venue = await Venue.findById(req.body.venue);
    } else {
      // ID değilse isim ile ara (Sporyum23 gibi)
      venue = await Venue.findOne({ name: { $regex: new RegExp(req.body.venue, 'i') } });
    }
    
    if (!venue) {
      // Sporyum 23 için özel durum
      if (req.body.venue === 'sporyum23') {
        console.log('Sporyum 23 için yeni venue oluşturuluyor');
        venue = new Venue({
          name: 'Sporyum 23',
          location: 'Ümraniye, İstanbul',
          price: 450,
          priceUnit: 'TL/saat',
          workingDays: {
            monday: { open: '09:00', close: '23:00' },
            tuesday: { open: '09:00', close: '23:00' },
            wednesday: { open: '09:00', close: '23:00' },
            thursday: { open: '09:00', close: '23:00' },
            friday: { open: '09:00', close: '23:00' },
            saturday: { open: '09:00', close: '23:00' },
            sunday: { open: '09:00', close: '23:00' }
          }
        });
        await venue.save();
      } else {
        return res.status(404).json({ message: 'Halı saha bulunamadı' });
      }
    }
    
    // Hangi saha için rezervasyon yapılıyor (1, 2 veya 3)
    const fieldNumber = req.body.field || 1;
    
    if (fieldNumber < 1 || fieldNumber > 3) {
      return res.status(400).json({ message: 'Geçersiz saha numarası: 1, 2 veya 3 olabilir' });
    }
    
    // Aynı tarih, saat ve SAHA için başka rezervasyon var mı kontrol et
    const existingReservation = await Reservation.findOne({
      venue: venue._id,
      field: fieldNumber, // Aynı saha numarası için kontrol
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
      return res.status(400).json({ 
        message: `Saha ${fieldNumber} için bu tarih ve saatte başka bir rezervasyon bulunuyor`,
        existingReservation: {
          date: existingReservation.date,
          startTime: existingReservation.startTime,
          endTime: existingReservation.endTime
        }
      });
    }
    
    // Misafir rezervasyonu için geçici kullanıcı oluştur veya mevcut kullanıcıyı kullan
    let userId;
    
    try {
      // Kimlik doğrulaması yoksa misafir kullanıcı oluştur veya bul
      const User = require('../models/User');
      
      // Önce misafir kullanıcıyı bul
      let guestUser = await User.findOne({ username: 'guest' });
      
      if (!guestUser) {
        // Misafir kullanıcı yoksa oluştur
        console.log('Misafir kullanıcı oluşturuluyor');
        
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('guestpassword123', salt);
        
        guestUser = new User({
          username: 'guest',
          firstName: 'Misafir',
          lastName: 'Kullanıcı',
          email: 'guest@futbolx.com',
          password: hashedPassword,
          role: 'user',
          // Gereken diğer varsayılan alanları ekle
          age: 30,
          position: 'Forvet',
          height: 175,
          weight: 75,
          preferredFoot: 'Sağ',
          phone: '0555123456'
        });
        
        await guestUser.save();
        console.log('Misafir kullanıcı oluşturuldu:', guestUser._id);
      }
      
      userId = guestUser._id;
    } catch (userError) {
      console.error('Misafir kullanıcı oluşturma hatası:', userError);
      
      // MongoDB bağlantı hatası durumunda geçici bir ID oluştur
      userId = '000000000000000000000000'; // 24 karakterlik geçici ID
    }
    
    // Müşteri adı ve telefon bilgileri (kullanıcı bilgileri)
    const customerName = req.body.customerName || 'Misafir';
    const customerPhone = req.body.customerPhone || 'Telefon Bilgisi Yok';
    
    // Rezervasyon oluştur
    const reservation = new Reservation({
      venue: venue._id,
      user: userId,
      customerName: customerName, // Yeni eklenen alan
      customerPhone: customerPhone, // Yeni eklenen alan
      date: new Date(req.body.date),
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      price: req.body.price,
      participants: [], // Empty array for participants
      notes: req.body.notes || '',
      status: 'beklemede',
      paymentStatus: 'beklemede',
      field: fieldNumber // Hangi saha için rezervasyon yapıldığı
    });
    
    const savedReservation = await reservation.save();
    console.log('Rezervasyon kaydedildi:', savedReservation);
    
    // Başarılı yanıt döndür
    res.status(201).json({
      message: 'Rezervasyon başarıyla oluşturuldu',
      reservation: savedReservation
    });
    
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    res.status(400).json({ message: error.message || 'Rezervasyon oluşturulurken bir hata oluştu' });
  }
};

// Rezervasyon güncelle
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
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
};

// Rezervasyon iptal et
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    reservation.status = 'iptal edildi';
    await reservation.save();
    
    res.json({ message: 'Rezervasyon iptal edildi' });
  } catch (error) {
    console.error('Rezervasyon iptal hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir tarih için boş saatleri getir
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    console.log('getAvailableTimeSlots çağrıldı, query:', req.query);
    const { venueId, date, field } = req.query;
    
    // Hangi saha için sorgu yapılıyor? (1, 2 veya 3)
    const fieldNumber = parseInt(field) || 1;
    
    if (!venueId || !date) {
      return res.status(400).json({ message: 'Halı saha ID ve tarih gereklidir' });
    }
    
    if (fieldNumber < 1 || fieldNumber > 3) {
      return res.status(400).json({ message: 'Geçersiz saha numarası: 1, 2 veya 3 olabilir' });
    }
    
    // Halı saha bilgilerini al - id veya name ile bul
    let venue;
    
    // MongoDB ObjectId formatında mı kontrol et
    if (venueId.match(/^[0-9a-fA-F]{24}$/)) {
      venue = await Venue.findById(venueId);
    } else {
      // ID değilse isim ile ara (Sporyum23 gibi)
      venue = await Venue.findOne({ name: { $regex: new RegExp(venueId, 'i') } });
    }
    
    if (!venue) {
      // Sporyum 23 için özel durum
      if (venueId === 'sporyum23') {
        console.log('Sporyum 23 için yeni venue oluşturuluyor');
        venue = new Venue({
          name: 'Sporyum 23',
          location: 'Ümraniye, İstanbul',
          price: 450,
          priceUnit: 'TL/saat',
          workingDays: {
            monday: { open: '09:00', close: '23:00' },
            tuesday: { open: '09:00', close: '23:00' },
            wednesday: { open: '09:00', close: '23:00' },
            thursday: { open: '09:00', close: '23:00' },
            friday: { open: '09:00', close: '23:00' },
            saturday: { open: '09:00', close: '23:00' },
            sunday: { open: '09:00', close: '23:00' }
          }
        });
        await venue.save();
      } else {
        return res.status(404).json({ message: 'Halı saha bulunamadı' });
      }
    }
    
    console.log('Venue bulundu:', venue.name);
    console.log(`Saha ${fieldNumber} için müsaitlik sorgulanıyor`);
    
    // Seçilen tarihin haftanın hangi günü olduğunu bul
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0: Pazar, 1: Pazartesi, ...
    
    // Haftanın günü için çalışma saatlerini al
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const workingHours = venue.workingDays ? venue.workingDays[days[dayOfWeek]] : null;
    
    if (!workingHours || !workingHours.open || !workingHours.close) {
      return res.status(400).json({ message: 'Bu gün için çalışma saatleri tanımlanmamış' });
    }
    
    // Çalışma saatleri aralığında saatlik dilimler oluştur
    const openHour = parseInt(workingHours.open.split(':')[0]);
    const closeHour = parseInt(workingHours.close.split(':')[0]);
    
    const timeSlots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      timeSlots.push({
        startTime,
        endTime,
        available: true
      });
    }
    
    // O tarih VE saha için mevcut rezervasyonları bul
    const reservations = await Reservation.find({
      venue: venue._id,
      field: fieldNumber, // Sadece seçilen saha numarası için kontrol
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59))
      },
      status: { $nin: ['iptal edildi'] } // İptal edilmiş rezervasyonlar hariç tüm rezervasyonlar
    });
    
    console.log(`Saha ${fieldNumber} için ${reservations.length} adet rezervasyon bulundu`);
    
    // Rezerve edilmiş saatleri işaretle
    reservations.forEach(reservation => {
      const startHour = parseInt(reservation.startTime.split(':')[0]);
      const endHour = parseInt(reservation.endTime.split(':')[0]);
      
      console.log(`Rezervasyon: ${startHour}:00 - ${endHour}:00 (${reservation.status})`);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const index = hour - openHour;
        if (index >= 0 && index < timeSlots.length) {
          timeSlots[index].available = false;
          timeSlots[index].reservationId = reservation._id;
          timeSlots[index].status = reservation.status;
        }
      }
    });
    
    res.json({
      venue: {
        _id: venue._id,
        name: venue.name,
        price: venue.price,
        priceUnit: venue.priceUnit || 'TL/saat'
      },
      date: date,
      field: fieldNumber,
      timeSlots
    });
  } catch (error) {
    console.error('Boş saatleri getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin için rezervasyon durumunu güncelle
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Rezervasyon durumu güncelleniyor: ${id} -> ${status}`);
    
    if (!['beklemede', 'onaylandı', 'iptal edildi', 'tamamlandı'].includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum değeri' });
    }
    
    const reservation = await Reservation.findById(id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Önceki ve yeni durum bilgilerini logla
    console.log(`Rezervasyon #${id} durumu değiştiriliyor: ${reservation.status} -> ${status}`);
    
    // Durumu güncelle
    reservation.status = status;
    await reservation.save();
    
    console.log(`Rezervasyon durumu başarıyla güncellendi: ${id} -> ${status}`);
    
    // Başarılı yanıt döndür
    res.json({ 
      message: 'Rezervasyon durumu güncellendi', 
      reservation: {
        _id: reservation._id,
        venue: reservation.venue,
        user: reservation.user,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        status: reservation.status,
        price: reservation.price
      }
    });
  } catch (error) {
    console.error('Rezervasyon durumu güncelleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
}; 