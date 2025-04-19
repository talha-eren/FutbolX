const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Kullanıcı adı veya e-posta kontrolü
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluştur
    const newUser = new User({
      username,
      email,
      password,
      name
    });

    // Kullanıcıyı kaydet
    await newUser.save();

    // JWT token oluştur
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        profilePicture: newUser.profilePicture
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı Girişi
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Şifreyi doğrula
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
