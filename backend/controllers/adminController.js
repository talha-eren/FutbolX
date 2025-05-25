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
    // Tarih hesaplamaları
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastMonthStart = new Date(today);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    // Toplam rezervasyon sayısı
    const totalReservations = await Reservation.countDocuments();
    
    // Bugünkü rezervasyon sayısı
    const todayReservations = await Reservation.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Haftalık rezervasyon sayısı
    const weeklyReservations = await Reservation.countDocuments({
      date: { $gte: lastWeekStart, $lt: tomorrow }
    });
    
    // Aylık rezervasyon sayısı
    const monthlyReservations = await Reservation.countDocuments({
      date: { $gte: lastMonthStart, $lt: tomorrow }
    });
    
    // Ödeme durumuna göre gelir hesaplaması
    const reservations = await Reservation.find({
      paymentStatus: 'ödendi'
    });
    
    // Toplam gelir
    const totalIncome = reservations.reduce((sum, reservation) => sum + reservation.price, 0);
    
    // Haftalık gelir
    const weeklyReservationsWithPrice = await Reservation.find({
      date: { $gte: lastWeekStart, $lt: tomorrow },
      paymentStatus: 'ödendi'
    });
    const weeklyIncome = weeklyReservationsWithPrice.reduce((sum, reservation) => sum + reservation.price, 0);
    
    // Aylık gelir
    const monthlyReservationsWithPrice = await Reservation.find({
      date: { $gte: lastMonthStart, $lt: tomorrow },
      paymentStatus: 'ödendi'
    });
    const monthlyIncome = monthlyReservationsWithPrice.reduce((sum, reservation) => sum + reservation.price, 0);
    
    // Kullanıcı sayısı
    const customerCount = await User.countDocuments();
    
    // Son 10 rezervasyon
    const recentBookings = await Reservation.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Recentbookings'i frontend için dönüştür
    const formattedRecentBookings = recentBookings.map(booking => {
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
      };
      
      return {
        id: booking._id,
        customer: booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : booking.customerName,
        field: `Saha ${booking.field}`,
        time: `${booking.startTime} - ${booking.endTime}`,
        date: formatDate(booking.date),
        amount: booking.price,
        status: booking.status
      };
    });
    
    // Sahalara göre rezervasyon dağılımı
    const field1Count = await Reservation.countDocuments({ field: 1 });
    const field2Count = await Reservation.countDocuments({ field: 2 });
    const field3Count = await Reservation.countDocuments({ field: 3 });
    
    const totalFieldCount = field1Count + field2Count + field3Count;
    const calculatePercentage = (count) => totalFieldCount > 0 ? Math.round((count / totalFieldCount) * 100) : 0;
    
    const fieldUtilization = [
      { name: 'Saha 1', value: calculatePercentage(field1Count) },
      { name: 'Saha 2', value: calculatePercentage(field2Count) },
      { name: 'Saha 3', value: calculatePercentage(field3Count) }
    ];
    
    // Popüler saatler
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    
    // Her saat için rezervasyon sayısını hesapla
    const timeStats = [];
    for (const time of timeSlots) {
      const count = await Reservation.countDocuments({
        startTime: time
      });
      timeStats.push({ time, count });
    }
    
    // En çok tercih edilen saatleri bul (en yüksek 5 saat)
    const sortedTimeStats = [...timeStats].sort((a, b) => b.count - a.count);
    const topTimeStats = sortedTimeStats.slice(0, 5);
    
    // En çok tercih edilen saatlerin yüzdelik oranlarını hesapla
    const maxTimeCount = Math.max(...timeStats.map(t => t.count));
    const popularTimes = topTimeStats.map(t => ({
      time: t.time,
      count: t.count,
      percentage: maxTimeCount > 0 ? Math.round((t.count / maxTimeCount) * 100) : 0
    }));
    
    // Aylık trend verileri
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentYear = today.getFullYear();
    
    const monthlyTrend = [];
    for (let i = 0; i < 6; i++) {
      const monthIndex = (today.getMonth() - 5 + i + 12) % 12; // Son 6 ay (negatif indeks olmaması için)
      const year = monthIndex > today.getMonth() ? currentYear - 1 : currentYear;
      
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      
      const monthlyReservationCount = await Reservation.countDocuments({
        date: { $gte: monthStart, $lte: monthEnd }
      });
      
      const monthlyRevenueData = await Reservation.find({
        date: { $gte: monthStart, $lte: monthEnd },
        paymentStatus: 'ödendi'
      });
      
      const monthlyRevenue = monthlyRevenueData.reduce((sum, r) => sum + r.price, 0);
      
      monthlyTrend.push({
        name: months[monthIndex],
        reservations: monthlyReservationCount,
        revenue: monthlyRevenue
      });
    }
    
    // Doluluk oranı
    // Son bir haftadaki toplam rezervasyonların, toplam kapasiteye oranı
    const totalCapacityPerDay = timeSlots.length * 3; // 3 saha, her saat için bir kapasite
    const totalCapacityWeek = totalCapacityPerDay * 7; // Haftalık toplam kapasite
    
    const occupancyRate = totalCapacityWeek > 0 
      ? Math.round((weeklyReservations / totalCapacityWeek) * 100) 
      : 0;
    
    // Tüm istatistikleri döndür
    res.json({
      totalReservations,
      todayReservations,
      weeklyReservations,
      monthlyReservations,
      totalIncome,
      weeklyIncome,
      monthlyIncome,
      customerCount,
      occupancyRate,
      popularTimes,
      recentBookings: formattedRecentBookings,
      fieldUtilization,
      monthlyTrend
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