const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'futbolx-secret-key';

// Kimlik doğrulama middleware'i
const protect = async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı ayıkla
      token = req.headers.authorization.split(' ')[1];
      
      console.log('Alınan token:', token);

      // Token yoksa veya geçersizse
      if (!token) {
        return res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı' });
      }

      // Token'ı doğrula
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decode edilen token:', decoded);

      // Kullanıcıyı bul ve request'e ekle (şifre hariç)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
      }
      
      req.user = user;
      console.log('Kimlik doğrulama başarılı, kullanıcı:', user.username);
      
      next();
    } catch (error) {
      console.error('Kimlik doğrulama hatası:', error.message);
      return res.status(401).json({ message: 'Yetkilendirme başarısız, geçersiz token' });
    }
  } else {
    return res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı' });
  }
};

// Admin yetkisi kontrolü
const isAdmin = async (req, res, next) => {
  try {
    // Önce protect middleware'ini çağır
    await protect(req, res, async () => {
      // Kullanıcı kimlik doğrulaması yapıldı mı?
      if (!req.user) {
        return res.status(401).json({ message: 'Yetkilendirme başarısız' });
      }
      
      // Kullanıcı admin mi kontrol et
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlemi gerçekleştirmek için admin yetkisi gerekiyor' });
      }
      
      // Admin yetkisi varsa devam et
      next();
    });
  } catch (error) {
    console.error('Admin yetkisi kontrolü hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yetkilendirme kontrolü olmayan basit bir middleware
const optionalAuth = async (req, res, next) => {
  let token;

  // Token'ı header'dan al (varsa)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı ayıkla
      token = req.headers.authorization.split(' ')[1];
      
      // Token varsa doğrula
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        req.user = user || null;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Hata durumunda sessizce geç ve kullanıcıyı null olarak ayarla
      console.log('İsteğe bağlı kimlik doğrulama hatası (yoksayılıyor):', error.message);
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

module.exports = { protect, isAdmin, optionalAuth };
