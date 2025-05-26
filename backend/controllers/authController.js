const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'futbolx-secret-key';

// Token oluşturma fonksiyonu
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    console.log('Kayıt isteği alındı:', req.body);
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName,
      position,
      footballExperience,
      preferredFoot,
      location,
      phone,
      bio,
      height,
      weight,
      favoriteTeam
    } = req.body;

    console.log('Çıkarılan veriler:', {
      username, email, firstName, lastName, position, 
      footballExperience, preferredFoot, location, phone, 
      bio, height, weight, favoriteTeam
    });

    // Kullanıcı adı veya email zaten kullanılıyor mu kontrol et
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Bu kullanıcı adı veya email zaten kullanılıyor' 
      });
    }

    // Yeni kullanıcı oluştur
    const userData = {
      username,
      email,
      password,
      firstName,
      lastName,
      position: position || '',
      footballExperience: footballExperience || 'Başlangıç',
      preferredFoot: preferredFoot || 'Sağ',
      location: location || '',
      phone: phone || '',
      bio: bio || '',
      height: height && height !== null && height !== '' ? Number(height) : 0,
      weight: weight && weight !== null && weight !== '' ? Number(weight) : 0,
      favoriteTeam: favoriteTeam || ''
    };

    console.log('Kaydedilecek kullanıcı verisi:', userData);

    const newUser = new User(userData);

    // Kullanıcıyı kaydet
    await newUser.save();
    console.log('Yeni kullanıcı oluşturuldu:', {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      position: newUser.position,
      footballExperience: newUser.footballExperience,
      preferredFoot: newUser.preferredFoot,
      location: newUser.location,
      phone: newUser.phone,
      bio: newUser.bio,
      height: newUser.height,
      weight: newUser.weight,
      favoriteTeam: newUser.favoriteTeam
    });

    // Token oluştur
    const token = generateToken(newUser._id);

    // Kullanıcı bilgilerini döndür (şifre hariç)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      profilePicture: newUser.profilePicture,
      position: newUser.position,
      footballExperience: newUser.footballExperience,
      preferredFoot: newUser.preferredFoot,
      location: newUser.location,
      phone: newUser.phone,
      bio: newUser.bio,
      height: newUser.height,
      weight: newUser.weight,
      favoriteTeam: newUser.favoriteTeam,
      matchesPlayed: newUser.matchesPlayed,
      goalsScored: newUser.goalsScored,
      assists: newUser.assists,
      hoursPlayed: newUser.hoursPlayed,
      token
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ile kullanıcıyı bul
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    // Token oluştur
    const token = generateToken(user._id);

    // Kullanıcı bilgilerini döndür
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      position: user.position,
      footballExperience: user.footballExperience,
      preferredFoot: user.preferredFoot,
      location: user.location,
      phone: user.phone,
      bio: user.bio,
      height: user.height,
      weight: user.weight,
      favoriteTeam: user.favoriteTeam,
      matchesPlayed: user.matchesPlayed,
      goalsScored: user.goalsScored,
      assists: user.assists,
      hoursPlayed: user.hoursPlayed,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı profili getirme
exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız. Lütfen tekrar giriş yapın.' });
    }
    
    console.log('Profil isteniyor, kullanıcı ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    console.log('Kullanıcı bulundu:', user.username);
    console.log('Kullanıcı verileri:', {
      location: user.location,
      phone: user.phone,
      bio: user.bio,
      height: user.height,
      weight: user.weight,
      favoriteTeam: user.favoriteTeam
    });
    
    res.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı profili güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      firstName,
      lastName,
      position,
      footballExperience,
      preferredFoot,
      location,
      phone,
      bio,
      height,
      weight,
      favoriteTeam,
      matchesPlayed,
      goalsScored,
      assists,
      hoursPlayed
    } = req.body;
    
    // Kullanıcıyı bul ve güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        email,
        firstName,
        lastName,
        position,
        footballExperience,
        preferredFoot,
        location,
        phone,
        bio,
        height: height ? Number(height) : 0,
        weight: weight ? Number(weight) : 0,
        favoriteTeam,
        matchesPlayed,
        goalsScored,
        assists,
        hoursPlayed,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı maçlarını güncelleme
exports.updateMatches = async (req, res) => {
  try {
    const { matches } = req.body;
    
    // Kullanıcıyı bul ve maçlarını güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { matches, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(updatedUser.matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı maçı ekleme
exports.addMatch = async (req, res) => {
  try {
    const match = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Maçı ekle
    user.matches.push(match);
    user.updatedAt = Date.now();
    
    // Kullanıcı istatistiklerini güncelle
    if (!user.stats) {
      user.stats = { matches: 0, goals: 0, assists: 0, rating: 0 };
    }
    
    user.stats.matches += 1;
    user.stats.goals += match.performance?.goals || 0;
    user.stats.assists += match.performance?.assists || 0;
    
    // Ortalama puanı güncelle
    const totalMatches = user.stats.matches;
    const currentRating = user.stats.rating || 0;
    const newMatchRating = match.performance?.rating || 0;
    user.stats.rating = ((currentRating * (totalMatches - 1)) + newMatchRating) / totalMatches;
    
    await user.save();
    
    res.status(201).json(user.matches[user.matches.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı öne çıkanlarını güncelleme
exports.updateHighlights = async (req, res) => {
  try {
    const { highlights } = req.body;
    
    // Kullanıcıyı bul ve öne çıkanlarını güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { highlights, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(updatedUser.highlights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı öne çıkan ekleme
exports.addHighlight = async (req, res) => {
  try {
    const highlight = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Öne çıkanı ekle
    user.highlights.push(highlight);
    user.updatedAt = Date.now();
    await user.save();
    
    res.status(201).json(user.highlights[user.highlights.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Şifre değiştirme
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Mevcut şifreyi kontrol et
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }
    
    // Yeni şifreyi ayarla
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı bilgisi alma
exports.getUserInfo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız. Lütfen tekrar giriş yapın.' });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgisi getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı çıkış yapma
exports.logout = async (req, res) => {
  try {
    // JWT tokenlar stateless olduğu için, client tarafında token'ı silmek yeterli
    // Ancak gelecekte token'ı blacklist'e eklemek için bir işlem yapılabilir
    res.json({ message: 'Başarıyla çıkış yapıldı' });
  } catch (error) {
    console.error('Çıkış yapma hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Şifre sıfırlama isteği
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Email ile kullanıcıyı bul
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Bu email ile kayıtlı kullanıcı bulunamadı' });
    }
    
    // Şifre sıfırlama token'ı oluştur
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    // Gerçek uygulamada bu token e-posta ile kullanıcıya gönderilirdi
    // Ancak şimdilik token'ı doğrudan döndürelim
    res.json({ 
      message: 'Şifre sıfırlama talebi oluşturuldu', 
      resetToken 
    });
  } catch (error) {
    console.error('Şifre sıfırlama isteği hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Token doğrulama
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
    
    // Kullanıcıyı kontrol et
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ valid: true, userId: decoded.id });
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token', valid: false });
  }
};

// Şifre sıfırlama
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token ve yeni şifre gerekli' });
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Yeni şifreyi ayarla
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla sıfırlandı' });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({ message: error.message });
  }
};
