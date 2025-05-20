const Admin = require('../models/Admin');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Venue = require('../models/Venue');
const jwt = require('jsonwebtoken');

// Admin girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Admin'i bul
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    
    // Şifreyi kontrol et
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    
    // JWT token oluştur
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'futbolx-secret-key',
      { expiresIn: '24h' }
    );
    
    // Son giriş zamanını güncelle
    admin.lastLogin = Date.now();
    await admin.save();
    
    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin giriş hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin kaydı (sadece süper admin yapabilir)
exports.register = async (req, res) => {
  try {
    // İsteği yapan kullanıcının süper admin olup olmadığını kontrol et
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
    }
    
    const { username, email, password, firstName, lastName, role, permissions } = req.body;
    
    // E-posta veya kullanıcı adı zaten kullanılıyor mu kontrol et
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor' });
    }
    
    // Yeni admin oluştur
    const admin = new Admin({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'admin',
      permissions: permissions || {}
    });
    
    await admin.save();
    
    res.status(201).json({
      message: 'Admin başarıyla oluşturuldu',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin kayıt hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Tüm rezervasyonları getir
exports.getAllReservations = async (req, res) => {
  try {
    const { status, date, venue } = req.query;
    let query = {};
    
    // Durum filtreleme
    if (status) {
      query.status = status;
    }
    
    // Tarih filtreleme
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Venue filtreleme
    if (venue) {
      query.venue = venue;
    }
    
    const reservations = await Reservation.find(query)
      .populate('venue', 'name location price')
      .populate('user', 'firstName lastName email')
      .sort({ date: 1, startTime: 1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Rezervasyon durumunu güncelle
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Durumu güncelle
    reservation.status = status;
    
    // Notları güncelle (varsa)
    if (notes) {
      reservation.notes = notes;
    }
    
    await reservation.save();
    
    res.json({ message: 'Rezervasyon durumu güncellendi', reservation });
  } catch (error) {
    console.error('Rezervasyon durumu güncelleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Rezervasyonu başka bir tarihe taşı
exports.rescheduleReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.body;
    
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Yeni tarih ve saat için çakışma kontrolü
    const existingReservation = await Reservation.findOne({
      _id: { $ne: id }, // Kendisi hariç
      venue: reservation.venue,
      date: new Date(date),
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ],
      status: { $nin: ['iptal edildi'] }
    });
    
    if (existingReservation) {
      return res.status(400).json({ message: 'Bu tarih ve saatte başka bir rezervasyon bulunuyor' });
    }
    
    // Rezervasyonu güncelle
    reservation.date = date;
    reservation.startTime = startTime;
    reservation.endTime = endTime;
    reservation.status = 'onaylandı'; // Taşınan rezervasyon otomatik onaylanır
    
    await reservation.save();
    
    res.json({ message: 'Rezervasyon başarıyla taşındı', reservation });
  } catch (error) {
    console.error('Rezervasyon taşıma hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Dashboard istatistikleri
exports.getDashboardStats = async (req, res) => {
  try {
    // Toplam rezervasyon sayısı
    const totalReservations = await Reservation.countDocuments();
    
    // Bugünkü rezervasyon sayısı
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayReservations = await Reservation.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Duruma göre rezervasyon sayıları
    const pendingReservations = await Reservation.countDocuments({ status: 'beklemede' });
    const confirmedReservations = await Reservation.countDocuments({ status: 'onaylandı' });
    const cancelledReservations = await Reservation.countDocuments({ status: 'iptal edildi' });
    
    // Toplam kullanıcı sayısı
    const totalUsers = await User.countDocuments();
    
    // Toplam venue sayısı
    const totalVenues = await Venue.countDocuments();
    
    res.json({
      totalReservations,
      todayReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      totalUsers,
      totalVenues
    });
  } catch (error) {
    console.error('Dashboard istatistikleri hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin profil bilgilerini getir
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin bulunamadı' });
    }
    
    res.json(admin);
  } catch (error) {
    console.error('Admin profil hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin profil bilgilerini güncelle
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, username } = req.body;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin bulunamadı' });
    }
    
    // E-posta veya kullanıcı adı değişiyorsa, başka bir admin tarafından kullanılıyor mu kontrol et
    if (email !== admin.email || username !== admin.username) {
      const existingAdmin = await Admin.findOne({
        _id: { $ne: req.user.id },
        $or: [{ email }, { username }]
      });
      
      if (existingAdmin) {
        return res.status(400).json({ message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor' });
      }
    }
    
    // Bilgileri güncelle
    admin.firstName = firstName;
    admin.lastName = lastName;
    admin.email = email;
    admin.username = username;
    admin.updatedAt = Date.now();
    
    await admin.save();
    
    res.json({
      message: 'Profil başarıyla güncellendi',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin profil güncelleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin şifre değiştirme
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin bulunamadı' });
    }
    
    // Mevcut şifreyi kontrol et
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mevcut şifre yanlış' });
    }
    
    // Yeni şifreyi ayarla
    admin.password = newPassword;
    admin.updatedAt = Date.now();
    
    await admin.save();
    
    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Admin şifre değiştirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
}; 