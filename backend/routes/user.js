const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Tüm kullanıcıları getir (Player Matching için) - EN ÜST SIRADA
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Tüm kullanıcılar isteniyor...');
    
    // Test kullanıcılarını filtrele ve sadece gerçek kullanıcıları getir
    const users = await User.find({
      // Test kullanıcılarını hariç tut
      username: { 
        $not: { 
          $regex: /(guest|deneme|test|ahmet_kaleci|mehmet_defans|ali_defans|emre_ortasaha|burak_ortasaha|cem_ortasaha|serkan_forvet)/i 
        } 
      },
      name: { 
        $not: { 
          $regex: /(guest|deneme|test)/i 
        } 
      },
      // Pozisyonu olan kullanıcılar
      position: { $exists: true, $ne: null, $ne: '' }
    }).select('-password');
    
    console.log(`✅ ${users.length} gerçek kullanıcı bulundu (pozisyonlu)`);
    
    // Pozisyon dağılımını kontrol et
    const positionCounts = users.reduce((acc, user) => {
      const position = user.position || 'Tanımsız';
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Pozisyon dağılımı:', positionCounts);
    
    // Kullanıcı detaylarını logla
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} | ${user.name || 'İsim yok'} | ${user.position} | ${user.email}`);
    });
    
    res.json(users);
  } catch (error) {
    console.error('❌ Kullanıcıları getirme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası',
      error: error.message 
    });
  }
});

// Test endpoint - auth olmadan
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Test endpoint çağrıldı');
    const userCount = await User.countDocuments();
    res.json({ 
      message: 'Users endpoint çalışıyor!',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test endpoint hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Test hatası',
      error: error.message 
    });
  }
});

// Kullanıcı profil bilgilerini getir
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı profil bilgilerini güncelle
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, profilePicture, favoriteTeams, bio, location, phone, level, position, footPreference, stats } = req.body;
    
    // Güncelleme nesnesi oluştur
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (favoriteTeams) updateData.favoriteTeams = favoriteTeams;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (level !== undefined) updateData.level = level;
    if (position !== undefined) updateData.position = position;
    if (footPreference !== undefined) updateData.footPreference = footPreference;
    updateData.updatedAt = Date.now();
    
    // Stats alanının güncellemesi
    if (stats) {
      updateData.stats = {};
      if (stats.matches !== undefined) updateData.stats.matches = stats.matches;
      if (stats.goals !== undefined) updateData.stats.goals = stats.goals;
      if (stats.assists !== undefined) updateData.stats.assists = stats.assists;
      if (stats.playHours !== undefined) updateData.stats.playHours = stats.playHours;
      if (stats.rating !== undefined) updateData.stats.rating = stats.rating;
    }
    
    console.log('Kullanıcı profili güncelleniyor:', updateData);
    
    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre değiştirme
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Mevcut şifreyi doğrula
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }
    
    // Yeni şifreyi ayarla
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Pozisyon bazlı takım ihtiyaçları
const getTeamNeeds = (userPosition) => {
  const teamFormation = {
    'Kaleci': ['Defans', 'Defans', 'Orta Saha', 'Orta Saha', 'Forvet'],
    'Defans': ['Kaleci', 'Defans', 'Orta Saha', 'Orta Saha', 'Forvet'],
    'Orta Saha': ['Kaleci', 'Defans', 'Defans', 'Orta Saha', 'Forvet'],
    'Forvet': ['Kaleci', 'Defans', 'Defans', 'Orta Saha', 'Orta Saha']
  };
  return teamFormation[userPosition] || ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];
};

// Oyuncu eşleştirme endpoint'i
router.get('/match-players', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    if (!currentUser.position) {
      return res.status(400).json({
        success: false,
        message: 'Önce profilinizde pozisyonunuzu belirtmelisiniz.'
      });
    }

    // Takım ihtiyaçlarını al
    const neededPositions = getTeamNeeds(currentUser.position);
    
    // Aktif kullanıcıları getir (kendisi hariç)
    const allPlayers = await User.find({
      _id: { $ne: currentUser._id },
      position: { $exists: true, $ne: null, $ne: '' }
    }).select('-password');

    // Pozisyon bazlı eşleştirme
    const matchedPlayers = {};
    
    neededPositions.forEach(position => {
      const playersInPosition = allPlayers.filter(player => 
        player.position === position
      );
      
      // Lokasyon bazlı sıralama
      if (currentUser.location) {
        playersInPosition.sort((a, b) => {
          const aLocationMatch = a.location && 
            a.location.toLowerCase().includes(currentUser.location.toLowerCase());
          const bLocationMatch = b.location && 
            b.location.toLowerCase().includes(currentUser.location.toLowerCase());
          
          if (aLocationMatch && !bLocationMatch) return -1;
          if (!aLocationMatch && bLocationMatch) return 1;
          return 0;
        });
      }
      
      // Her pozisyon için en fazla 3 oyuncu
      matchedPlayers[position] = playersInPosition.slice(0, 3);
    });

    res.json({
      success: true,
      data: {
        userPosition: currentUser.position,
        matchedPlayers,
        totalMatches: Object.values(matchedPlayers).flat().length
      }
    });

  } catch (error) {
    console.error('Oyuncu eşleştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Tüm oyuncuları getir
router.get('/all-players', auth, async (req, res) => {
  try {
    const players = await User.find({
      _id: { $ne: req.user.id }
    }).select('-password');
    
    res.json({
      success: true,
      data: players
    });
  } catch (error) {
    console.error('Oyuncular getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Pozisyonu olmayan kullanıcılara rastgele pozisyon ata
router.post('/assign-positions', auth, async (req, res) => {
  try {
    console.log('🎯 Pozisyonu olmayan kullanıcılara pozisyon atanıyor...');
    
    // Pozisyonu olmayan kullanıcıları bul
    const usersWithoutPosition = await User.find({
      $or: [
        { position: { $exists: false } },
        { position: null },
        { position: '' }
      ]
    });
    
    console.log(`📋 Pozisyonu olmayan kullanıcı sayısı: ${usersWithoutPosition.length}`);
    
    if (usersWithoutPosition.length === 0) {
      return res.json({
        success: true,
        message: 'Tüm kullanıcıların pozisyonu zaten tanımlı',
        updatedCount: 0
      });
    }
    
    const positions = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];
    let updatedCount = 0;
    
    for (const user of usersWithoutPosition) {
      // Rastgele pozisyon seç
      const randomPosition = positions[Math.floor(Math.random() * positions.length)];
      
      await User.findByIdAndUpdate(user._id, {
        position: randomPosition,
        level: user.level || ['Başlangıç', 'Orta', 'İleri'][Math.floor(Math.random() * 3)],
        location: user.location || ['İstanbul', 'Ankara', 'İzmir', 'Bursa'][Math.floor(Math.random() * 4)]
      });
      
      console.log(`✅ ${user.username} -> ${randomPosition} pozisyonu atandı`);
      updatedCount++;
    }
    
    // Güncellenmiş pozisyon dağılımını göster
    const allUsers = await User.find({}).select('position');
    const positionCounts = allUsers.reduce((acc, user) => {
      const position = user.position || 'Tanımsız';
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Güncellenmiş pozisyon dağılımı:', positionCounts);
    
    res.json({
      success: true,
      message: `${updatedCount} kullanıcıya pozisyon atandı`,
      updatedCount,
      positionDistribution: positionCounts
    });
    
  } catch (error) {
    console.error('❌ Pozisyon atama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Pozisyon atama sırasında hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
