const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  updateMatches,
  addMatch,
  updateHighlights,
  addHighlight,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Kullanıcı kaydı ve girişi
router.post('/register', register);
router.post('/login', login);

// Korumalı rotalar - Profil
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Korumalı rotalar - Maçlar
router.put('/profile/matches', protect, updateMatches);
router.post('/profile/matches', protect, addMatch);

// Korumalı rotalar - Öne Çıkanlar
router.put('/profile/highlights', protect, updateHighlights);
router.post('/profile/highlights', protect, addHighlight);

// Şifre değiştirme
router.put('/change-password', protect, changePassword);

module.exports = router;
