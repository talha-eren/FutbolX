const express = require('express');
const router = express.Router();
const { register, login, logout, getUserInfo, forgotPassword, resetPassword, verifyToken, changePassword, getProfile, updateProfile } = require('../controllers/authController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Kullanıcı kaydı ve girişi
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Kullanıcı bilgisi alma
router.get('/me', protect, getUserInfo);

// Profile endpoint - getProfile fonksiyonunu kullanarak
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Oyuncu eşleştirme için tüm oyuncuları getir
router.get('/players', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Sadece futbol bilgileri olan kullanıcıları getir
    const players = await User.find({
      position: { $exists: true, $ne: '' }
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(players);
  } catch (error) {
    console.error('Oyuncular getirme hatası:', error);
    res.status(500).json({ message: 'Oyuncular getirilemedi' });
  }
});

// Şifre sıfırlama
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-token', verifyToken);

// Şifre değiştirme
router.put('/change-password', protect, changePassword);

// Admin rotaları
router.post('/admin/login', adminController.login);
router.post('/admin/register', protect, adminMiddleware, adminController.register);
router.get('/admin/dashboard-stats', protect, adminMiddleware, adminController.getDashboardStats);
router.get('/admin/reservations', protect, adminMiddleware, adminController.getAllReservations);
router.patch('/admin/reservations/:id/status', protect, adminMiddleware, adminController.updateReservationStatus);
router.patch('/admin/reservations/:id/reschedule', protect, adminMiddleware, adminController.rescheduleReservation);

module.exports = router;
