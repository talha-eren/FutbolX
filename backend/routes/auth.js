const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    console.log('Kayıt isteği alındı:', { username, email, name });

    // Form doğrulama
    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: 'Tüm alanları doldurunuz' });
    }

    // Kullanıcı adı veya email zaten kullanılıyor mu kontrol et
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      console.log('Mevcut kullanıcı bulundu:', { username: user.username, email: user.email });
      
      // Hangi alanın çakıştığını belirt
      if (user.username === username) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
      } else if (user.email === email) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      } else {
        return res.status(400).json({ message: 'Kullanıcı adı veya email zaten kullanılıyor' });
      }
    }

    // Yeni kullanıcı oluştur
    user = new User({
      username,
      email,
      password,
      name
    });

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Kullanıcıyı kaydet
    await user.save();
    console.log('Yeni kullanıcı kaydedildi:', { id: user.id, username });

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    
    // MongoDB duplicate key hatasını kontrol et
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        message: `Bu ${field === 'username' ? 'kullanıcı adı' : 'e-posta adresi'} zaten kullanılıyor` 
      });
    }
    
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
});

// Kullanıcı Girişi - GEÇİCİ OLARAK ŞİFRE KONTROLÜ DEVRE DIŞI
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('\x1b[33m%s\x1b[0m', 'GİRİŞ DENEMESİ - Kullanıcı Adı:', username);
    
    // Form doğrulama - sadece kullanıcı adı kontrolü
    if (!username) {
      return res.status(400).json({ message: 'Kullanıcı adı gereklidir' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    if (!user) {
      console.log('\x1b[31m%s\x1b[0m', 'Kullanıcı bulunamadı:', { username });
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    console.log('\x1b[32m%s\x1b[0m', 'Kullanıcı bulundu:', { 
      id: user._id, 
      username: user.username 
    });
    
    // Şifre kontrolünü geçici olarak devre dışı bırakıyoruz
    // Herhangi bir şifre ile giriş yapabilirsiniz
    console.log('\x1b[32m%s\x1b[0m', 'GİRİŞ DENEMESİ - Şifre kontrolü geçici olarak devre dışı bırakıldı');
    console.log('\x1b[32m%s\x1b[0m', 'GİRİŞ DENEMESİ - Giriş başarılı kabul ediliyor');
    
    // Şifre kontrolü olmadan doğrudan başarılı kabul ediyoruz
    // JWT token oluştur

    console.log('Giriş başarılı:', { id: user.id, username });

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        favoriteTeams: user.favoriteTeams
      }
    });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
});

module.exports = router;
