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
    const { username, email, password, firstName, lastName } = req.body;

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
      bio: `Merhaba, ben ${firstName} ${lastName}!`
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
      profilePicture: user.profilePicture,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı profili getirme
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı profili güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio, favoriteTeam, position } = req.body;
    
    // Kullanıcıyı bul ve güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, bio, favoriteTeam, position },
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
