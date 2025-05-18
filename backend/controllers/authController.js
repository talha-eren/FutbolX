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
      level,
      preferredFoot
    } = req.body;

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
    const newUser = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      position,
      level,
      preferredFoot
    });

    // Kullanıcıyı kaydet
    await newUser.save();
    console.log('Yeni kullanıcı oluşturuldu:', newUser);

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
      level: newUser.level,
      preferredFoot: newUser.preferredFoot,
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
      level: user.level,
      preferredFoot: user.preferredFoot, 
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
      level,
      preferredFoot,
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
        level,
        preferredFoot,
        matchesPlayed,
        goalsScored,
        assists,
        hoursPlayed
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
