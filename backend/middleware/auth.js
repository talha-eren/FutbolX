const jwt = require('jsonwebtoken');

// Kullanıcının kimliğini doğrulama middleware'i
const auth = (req, res, next) => {
  try {
    // Token'ı header'dan al
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Kimlik doğrulama hatası: Token bulunamadı' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcı ID'sini request'e ekle
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Kimlik doğrulama hatası: Geçersiz token' });
  }
};

module.exports = auth;
