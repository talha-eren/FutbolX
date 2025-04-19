const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Kullanıcı profil bilgilerini getir
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı profil bilgilerini güncelle
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, profilePicture, favoriteTeams } = req.body;
    
    // Güncelleme nesnesi oluştur
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (favoriteTeams) updateData.favoriteTeams = favoriteTeams;
    updateData.updatedAt = Date.now();
    
    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre değiştirme
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Mevcut şifreyi doğrula
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }
    
    // Yeni şifreyi ayarla
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
