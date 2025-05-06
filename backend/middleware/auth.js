const jwt = require('jsonwebtoken');

// JWT_SECRET değerini .env dosyasından al veya varsayılan değeri kullan
const JWT_SECRET = process.env.JWT_SECRET || 'futbolx_super_gizli_anahtar_2025';

// Kullanıcının kimliğini doğrulama middleware'i
const auth = (req, res, next) => {
  try {
    // Önce Authorization header'dan token'ı al
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Eğer Authorization header'da token yoksa, x-auth-token header'ını kontrol et
    if (!token) {
      token = req.header('x-auth-token');
    }
    
    // Hala token yoksa hata dön
    if (!token) {
      console.log('Token bulunamadı. Headers:', req.headers);
      return res.status(401).json({ message: 'Kimlik doğrulama hatası: Token bulunamadı' });
    }
    
    console.log('Token doğrulanıyor:', token.substring(0, 15) + '...');

    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kullanıcı bilgisini request'e ekle
    req.user = { id: decoded.id };
    req.userId = decoded.id; // Geriye dönük uyumluluk için
    next();
  } catch (error) {
    res.status(401).json({ message: 'Kimlik doğrulama hatası: Geçersiz token' });
  }
};

module.exports = auth;
