const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Kullanıcı kaydı ve girişi
router.post('/register', register);
router.post('/login', login);

// Korumalı rotalar
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
