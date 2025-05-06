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
    const { name, email, profilePicture, favoriteTeams, bio, location, phone, level, position, footPreference, stats } = req.body;
    
    // Güncelleme nesnesi oluştur
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (favoriteTeams) updateData.favoriteTeams = favoriteTeams;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (level !== undefined) updateData.level = level;
    if (position !== undefined) updateData.position = position;
    if (footPreference !== undefined) updateData.footPreference = footPreference;
    updateData.updatedAt = Date.now();
    
    // Stats alanının güncellemesi
    if (stats) {
      updateData.stats = {};
      if (stats.matches !== undefined) updateData.stats.matches = stats.matches;
      if (stats.goals !== undefined) updateData.stats.goals = stats.goals;
      if (stats.assists !== undefined) updateData.stats.assists = stats.assists;
      if (stats.playHours !== undefined) updateData.stats.playHours = stats.playHours;
      if (stats.rating !== undefined) updateData.stats.rating = stats.rating;
    }
    
    console.log('Kullanıcı profili güncelleniyor:', updateData);
    
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
