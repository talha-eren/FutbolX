const User = require('../models/User');

// Tüm oyuncuları getir (sadece users koleksiyonundan)
const getAllPlayers = async (req, res) => {
  try {
    // Users koleksiyonundan gerçek kullanıcılar (pozisyonu olan)
    const realUsers = await User.find({ 
      position: { $exists: true, $ne: '' },
      isActive: { $ne: false }
    })
    .select('username firstName lastName email position footballExperience height weight location phone bio favoriteTeam createdAt')
    .sort({ createdAt: -1 });

    // Kullanıcıları player formatına dönüştür
    const formattedUsers = realUsers.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      position: user.position,
      level: user.footballExperience === 'Başlangıç' ? 'başlangıç' : 
             user.footballExperience === 'Orta' ? 'orta' : 
             user.footballExperience === 'İleri' ? 'ileri' : 'başlangıç',
      contactNumber: user.phone || '',
      description: user.bio || `${user.position} pozisyonunda oynayan oyuncu`,
      location: {
        city: 'İstanbul',
        district: user.location || 'Belirtilmemiş'
      },
      isActive: true,
      isApproved: true,
      favoriteTeam: user.favoriteTeam || '',
      createdBy: {
        username: user.username,
        email: user.email
      },
      stats: {
        attack: user.position === 'Forvet' ? 80 : user.position === 'Orta Saha' ? 70 : 40,
        defense: user.position === 'Kaleci' ? 90 : user.position === 'Defans' ? 85 : 50,
        speed: user.position === 'Forvet' ? 85 : user.position === 'Orta Saha' ? 80 : 60,
        teamwork: 75
      },
      preferredTime: '20:00',
      regularPlayDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
      rating: 0,
      matches: [],
      userType: 'real' // Gerçek kullanıcı olduğunu belirt
    }));
    
    res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Oyuncular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Oyuncular getirilirken hata oluştu'
    });
  }
};

// Oyuncu eşleştirme (sadece gerçek kullanıcılar)
const matchPlayer = async (req, res) => {
  try {
    const { userId, position, level, preferredTime, location } = req.body;
    
    // Kullanıcının kendi bilgilerini al
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    console.log('Eşleştirme kriterleri:', { position, level, preferredTime, location });

    // Gerçek kullanıcılardan eşleştirme yap
    let userMatchCriteria = {
      _id: { $ne: userId }, // Kendisini hariç tut
      position: { $exists: true, $ne: '' }
    };

    // Pozisyon filtresi
    if (position && position !== 'Hepsi') {
      userMatchCriteria.position = position;
    }

    // Seviye filtresi
    if (level && level !== 'Hepsi') {
      const levelMap = {
        'başlangıç': 'Başlangıç',
        'orta': 'Orta', 
        'ileri': 'İleri'
      };
      userMatchCriteria.footballExperience = levelMap[level];
    }

    // Lokasyon filtresi
    if (location && location.district) {
      userMatchCriteria.location = new RegExp(location.district, 'i');
    }

    console.log('Kullanıcı eşleştirme kriterleri:', userMatchCriteria);

    // Gerçek kullanıcıları bul
    const matchedUsers = await User.find(userMatchCriteria)
      .select('username firstName lastName email position footballExperience height weight location phone bio favoriteTeam createdAt')
      .limit(10);

    console.log('Bulunan kullanıcılar:', matchedUsers.length);

    // Kullanıcıları player formatına dönüştür
    const formattedUsers = matchedUsers.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      position: user.position,
      level: user.footballExperience === 'Başlangıç' ? 'başlangıç' : 
             user.footballExperience === 'Orta' ? 'orta' : 
             user.footballExperience === 'İleri' ? 'ileri' : 'başlangıç',
      contactNumber: user.phone || 'Belirtilmemiş',
      description: user.bio || `${user.position} pozisyonunda oynayan gerçek oyuncu`,
      location: {
        city: 'İstanbul',
        district: user.location || 'Belirtilmemiş'
      },
      isActive: true,
      isApproved: true,
      favoriteTeam: user.favoriteTeam || '',
      createdBy: {
        username: user.username,
        email: user.email
      },
      stats: {
        attack: user.position === 'Forvet' ? 80 : user.position === 'Orta Saha' ? 70 : 40,
        defense: user.position === 'Kaleci' ? 90 : user.position === 'Defans' ? 85 : 50,
        speed: user.position === 'Forvet' ? 85 : user.position === 'Orta Saha' ? 80 : 60,
        teamwork: 75
      },
      preferredTime: '20:00',
      regularPlayDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
      rating: 0,
      matches: [],
      userType: 'real' // Gerçek kullanıcı
    }));

    // Eğer hiç eşleşme yoksa, daha geniş kriterlerde ara
    if (formattedUsers.length === 0) {
      console.log('Hiç eşleşme bulunamadı, geniş arama yapılıyor...');
      
      // Geniş kullanıcı araması
      const broadUserSearch = await User.find({
        _id: { $ne: userId },
        position: { $exists: true, $ne: '' }
      })
      .select('username firstName lastName email position footballExperience height weight location phone bio favoriteTeam createdAt')
      .limit(5);

      const broadFormattedUsers = broadUserSearch.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        position: user.position,
        level: user.footballExperience === 'Başlangıç' ? 'başlangıç' : 
               user.footballExperience === 'Orta' ? 'orta' : 
               user.footballExperience === 'İleri' ? 'ileri' : 'başlangıç',
        contactNumber: user.phone || 'Belirtilmemiş',
        description: user.bio || `${user.position} pozisyonunda oynayan gerçek oyuncu`,
        location: {
          city: 'İstanbul',
          district: user.location || 'Belirtilmemiş'
        },
        isActive: true,
        isApproved: true,
        favoriteTeam: user.favoriteTeam || '',
        createdBy: {
          username: user.username,
          email: user.email
        },
        stats: {
          attack: user.position === 'Forvet' ? 80 : user.position === 'Orta Saha' ? 70 : 40,
          defense: user.position === 'Kaleci' ? 90 : user.position === 'Defans' ? 85 : 50,
          speed: user.position === 'Forvet' ? 85 : user.position === 'Orta Saha' ? 80 : 60,
          teamwork: 75
        },
        preferredTime: '20:00',
        regularPlayDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
        rating: 0,
        matches: [],
        userType: 'real'
      }));

      formattedUsers.push(...broadFormattedUsers);
    }

    // Rastgele sıralama
    const shuffledPlayers = formattedUsers.sort(() => 0.5 - Math.random());

    res.status(200).json({
      success: true,
      data: shuffledPlayers,
      message: `${shuffledPlayers.length} gerçek kullanıcı eşleşmesi bulundu`
    });

  } catch (error) {
    console.error('Oyuncu eşleştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Oyuncu eşleştirme sırasında hata oluştu'
    });
  }
};

// Tek oyuncu getir
const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('username firstName lastName email position footballExperience height weight location phone bio favoriteTeam createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcıyı player formatına dönüştür
    const formattedUser = {
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      position: user.position,
      level: user.footballExperience === 'Başlangıç' ? 'başlangıç' : 
             user.footballExperience === 'Orta' ? 'orta' : 
             user.footballExperience === 'İleri' ? 'ileri' : 'başlangıç',
      contactNumber: user.phone || 'Belirtilmemiş',
      description: user.bio || `${user.position} pozisyonunda oynayan gerçek oyuncu`,
      location: {
        city: 'İstanbul',
        district: user.location || 'Belirtilmemiş'
      },
      isActive: true,
      isApproved: true,
      favoriteTeam: user.favoriteTeam || '',
      createdBy: {
        username: user.username,
        email: user.email
      },
      stats: {
        attack: user.position === 'Forvet' ? 80 : user.position === 'Orta Saha' ? 70 : 40,
        defense: user.position === 'Kaleci' ? 90 : user.position === 'Defans' ? 85 : 50,
        speed: user.position === 'Forvet' ? 85 : user.position === 'Orta Saha' ? 80 : 60,
        teamwork: 75
      },
      preferredTime: '20:00',
      regularPlayDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
      rating: 0,
      matches: [],
      userType: 'real'
    };

    res.status(200).json({
      success: true,
      data: formattedUser
    });
  } catch (error) {
    console.error('Oyuncu getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Oyuncu getirilirken hata oluştu'
    });
  }
};

// Pozisyona göre oyuncuları getir
const getPlayersByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    
    const users = await User.find({ 
      position: position,
      isActive: { $ne: false }
    })
    .select('username firstName lastName email position footballExperience height weight location phone bio favoriteTeam createdAt')
    .sort({ createdAt: -1 });

    // Kullanıcıları player formatına dönüştür
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      position: user.position,
      level: user.footballExperience === 'Başlangıç' ? 'başlangıç' : 
             user.footballExperience === 'Orta' ? 'orta' : 
             user.footballExperience === 'İleri' ? 'ileri' : 'başlangıç',
      contactNumber: user.phone || 'Belirtilmemiş',
      description: user.bio || `${user.position} pozisyonunda oynayan gerçek oyuncu`,
      location: {
        city: 'İstanbul',
        district: user.location || 'Belirtilmemiş'
      },
      isActive: true,
      isApproved: true,
      favoriteTeam: user.favoriteTeam || '',
      createdBy: {
        username: user.username,
        email: user.email
      },
      stats: {
        attack: user.position === 'Forvet' ? 80 : user.position === 'Orta Saha' ? 70 : 40,
        defense: user.position === 'Kaleci' ? 90 : user.position === 'Defans' ? 85 : 50,
        speed: user.position === 'Forvet' ? 85 : user.position === 'Orta Saha' ? 80 : 60,
        teamwork: 75
      },
      preferredTime: '20:00',
      regularPlayDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
      rating: 0,
      matches: [],
      userType: 'real'
    }));
    
    res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Pozisyona göre oyuncular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Oyuncular getirilirken hata oluştu'
    });
  }
};

// Oyuncu istatistiklerini güncelle
const updatePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, goals, assists, matches } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // İstatistikleri güncelle
    if (rating !== undefined) {
      user.rating = rating;
    }
    if (goals !== undefined) {
      user.goalsScored = (user.goalsScored || 0) + goals;
    }
    if (assists !== undefined) {
      user.assists = (user.assists || 0) + assists;
    }
    if (matches !== undefined) {
      user.matchesPlayed = (user.matchesPlayed || 0) + 1;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'Kullanıcı istatistikleri güncellendi'
    });
  } catch (error) {
    console.error('Kullanıcı istatistikleri güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler güncellenirken hata oluştu'
    });
  }
};

module.exports = {
  getAllPlayers,
  matchPlayer,
  getPlayerById,
  getPlayersByPosition,
  updatePlayerStats
}; 