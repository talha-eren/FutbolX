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

module.exports = { protect };
