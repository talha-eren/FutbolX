const jwt = require('jsonwebtoken');

// JWT_SECRET değerini .env dosyasından al veya varsayılan değeri kullan
const JWT_SECRET = process.env.JWT_SECRET || 'futbolx_super_gizli_anahtar_2025';

// Token'dan Bearer önekini temizleme yardımcı fonksiyonu
const cleanToken = (token) => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token.substring(7) : token;
};

// Kullanıcının kimliğini doğrulama middleware'i
const auth = (req, res, next) => {
  try {
    console.log('\x1b[33m%s\x1b[0m', '==== TOKEN DOĞRULAMA BAŞLADI ====');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Tüm token içeren header'ları topla
    const authHeader = req.header('Authorization');
    const xAuthToken = req.header('x-auth-token');
    const xToken = req.header('x-token');
    
    // ÖNEMLİ: Tüm olası token kaynakları için tek tek deneme yap
    let token = null;
    let tokenSource = '';
    
    if (authHeader) {
      token = cleanToken(authHeader);
      tokenSource = 'Authorization';
      console.log('\x1b[36m%s\x1b[0m', 'Authorization header bulundu:', authHeader.substring(0, 20) + '...');
    } else if (xAuthToken) {
      token = cleanToken(xAuthToken);
      tokenSource = 'x-auth-token';
      console.log('\x1b[36m%s\x1b[0m', 'x-auth-token header bulundu:', xAuthToken.substring(0, 20) + '...');
    } else if (xToken) {
      token = cleanToken(xToken);
      tokenSource = 'x-token';
      console.log('\x1b[36m%s\x1b[0m', 'x-token header bulundu:', xToken.substring(0, 20) + '...');
    } else if (req.query && req.query.token) {
      // URL query parametresi olarak token
      token = req.query.token;
      tokenSource = 'query';
      console.log('\x1b[36m%s\x1b[0m', 'Query token bulundu:', token.substring(0, 20) + '...');
    }
    
    // Hala token yoksa veya token geçersizse hata dön
    if (!token) {
      console.log('\x1b[31m%s\x1b[0m', 'Token bulunamadı. Headers:', JSON.stringify(req.headers));
      return res.status(401).json({ message: 'Kimlik doğrulama hatası: Token bulunamadı' });
    }
    
    console.log('\x1b[32m%s\x1b[0m', `Token bulundu (${tokenSource}):`, token.substring(0, 20) + '...');

    // Bozuk token düzeltme girişimleri - web ve mobil token formatı farklı olabilir
    let cleanedToken = token;
    
    // Bazı olası bozuk token formatlarını düzelt
    if (token.includes('\\')) {
      cleanedToken = token.replace(/\\/g, '');
      console.log('\x1b[33m%s\x1b[0m', 'Token içindeki escape karakterleri temizlendi');
    }
    
    if (token.includes('"')) {
      cleanedToken = token.replace(/"/g, '');
      console.log('\x1b[33m%s\x1b[0m', 'Token içindeki çift tırnak karakterleri temizlendi');
    }
    
    try {
      // İlk olarak orijinal token ile doğrulama dene
      console.log('\x1b[36m%s\x1b[0m', 'Orijinal token doğrulanıyor...');
    const decoded = jwt.verify(token, JWT_SECRET);
    
      console.log('\x1b[32m%s\x1b[0m', 'Token başarıyla doğrulandı. User ID:', decoded.id);
    req.user = { id: decoded.id };
    req.userId = decoded.id; // Geriye dönük uyumluluk için
      return next();
    } catch (firstError) {
      console.log('\x1b[33m%s\x1b[0m', 'İlk doğrulama başarısız, başka yöntemler deneniyor:', firstError.message);
      
      // Temizlenmiş token ile tekrar dene (orijinal token çalışmadıysa)
      if (cleanedToken !== token) {
        try {
          console.log('\x1b[36m%s\x1b[0m', 'Temizlenmiş token doğrulanıyor...');
          const decoded = jwt.verify(cleanedToken, JWT_SECRET);
          
          console.log('\x1b[32m%s\x1b[0m', 'Temizlenmiş token başarıyla doğrulandı. User ID:', decoded.id);
          req.user = { id: decoded.id };
          req.userId = decoded.id;
          return next();
        } catch (secondError) {
          console.error('\x1b[31m%s\x1b[0m', 'Temizlenmiş token doğrulama hatası:', secondError.message);
        }
      }
      
      // Son çare - JWT decode (verify olmadan) -> sadece geliştirme ortamında!
      try {
        console.log('\x1b[33m%s\x1b[0m', 'DEBUG MODU: Token decode deneniyor (tehlikeli!)');
        
        // NOT: Bu güvenli değil, sadece hata ayıklama için!
        const decodedAnyway = jwt.decode(token);
        if (decodedAnyway && decodedAnyway.id) {
          console.log('\x1b[33m%s\x1b[0m', 'UYARI: Doğrulanmamış token ile devam ediliyor! User ID:', decodedAnyway.id);
          // Geliştirme ortamında bu kullanılabilir, üretimde ASLA kullanma!
          if (process.env.NODE_ENV !== 'production') {
            req.user = { id: decodedAnyway.id };
            req.userId = decodedAnyway.id;
            return next();
          }
        }
      } catch (decodeError) {
        console.error('\x1b[31m%s\x1b[0m', 'Token decode hatası:', decodeError.message);
      }
      
      // Hiçbir yöntem çalışmadı, hata dön
      console.error('\x1b[31m%s\x1b[0m', 'Token doğrulama nihai hatası!');
      throw firstError; // Orijinal hatayı fırlat
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Token doğrulama hatası:', error.message);
    console.error('JWT Secret karakterleri:', JWT_SECRET.length, 'uzunluğunda');
    res.status(401).json({ message: 'Kimlik doğrulama hatası: Geçersiz token' });
  }
};

module.exports = auth;
