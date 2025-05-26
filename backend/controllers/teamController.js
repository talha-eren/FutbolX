const Team = require('../models/Team');
const User = require('../models/User');

// Tüm takımları getir
exports.getTeams = async (req, res) => {
  try {
    console.log('getTeams fonksiyonu çağrıldı');
    console.log('Kullanıcı bilgileri:', req.user ? `${req.user.username} (${req.user.role})` : 'Kullanıcı yok');
    
    // DÜZELTME: Herhangi bir filtre olmadan tüm takımları getir
    let query = {};
    
    console.log('Takım sorgusu:', query);
    
    // Tüm takımları getir - onay durumuna bakmadan
    const teams = await Team.find(query)
      .populate('venue', 'name location')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`${teams.length} takım bulundu:`, teams.map(t => t.name));
    
    // Takım verileri hakkında daha fazla bilgi
    if (teams.length === 0) {
      console.log('Veritabanında hiç takım bulunamadı!');
    } else {
      teams.forEach(team => {
        console.log(`Takım: ${team.name}, ID: ${team._id}, Onay durumu: ${team.isApproved ? 'Onaylı' : 'Onaysız'}`);
      });
    }
    
    res.json(teams);
  } catch (error) {
    console.error('Takımlar getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// ID'ye göre takım getir
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('venue', 'name location')
      .populate('createdBy', 'name')
      .populate('players.player', 'name email');
    
    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Takım getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni takım oluştur
exports.createTeam = async (req, res) => {
  try {
    console.log('createTeam fonksiyonu çağrıldı');
    console.log('Kullanıcı bilgileri:', req.user);
    console.log('İstek gövdesi:', req.body);
    
    const {
      name,
      level,
      neededPlayers,
      venue,
      preferredTime,
      contactNumber,
      description,
      regularPlayDays,
      location,
      stats,
      isApproved
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name) {
      return res.status(400).json({ message: 'Takım adı gereklidir' });
    }
    
    // Kullanıcı kimliğini kontrol et
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Kullanıcı kimliği bulunamadı' });
    }
    
    // Yeni takım oluştur
    const newTeam = new Team({
      name,
      level: level || 'Orta',
      neededPlayers: neededPlayers || 1,
      venue: venue || null,
      preferredTime: preferredTime || '20:00',
      contactNumber: contactNumber || '',
      description: description || '',
      regularPlayDays: regularPlayDays || [],
      location: {
        city: location?.city || 'İstanbul',
        district: location?.district || 'Sporyum 23'
      },
      createdBy: req.user._id,
      players: [{
        player: req.user._id,
        isAdmin: true
      }],
      // Admin değilse onay bekliyor, admin ise otomatik onaylı (veya açıkça belirtilen değer)
      isApproved: isApproved !== undefined ? isApproved : (req.user.role === 'admin'),
      stats: stats || {
        attack: 50,
        defense: 50,
        speed: 50,
        teamwork: 50
      }
    });
    
    console.log('Oluşturulacak takım:', newTeam);
    
    try {
    const savedTeam = await newTeam.save();
    console.log('Takım kaydedildi:', savedTeam);
    
    // Oluşturulan takımı getir
    const populatedTeam = await Team.findById(savedTeam._id)
      .populate('venue', 'name location')
      .populate('createdBy', 'name')
      .populate('players.player', 'name email');
    
    res.status(201).json(populatedTeam);
    } catch (saveError) {
      console.error('Takım kaydedilirken veritabanı hatası:', saveError);
      return res.status(500).json({ 
        message: 'Takım kaydedilirken veritabanı hatası oluştu', 
        error: saveError.message,
        stack: saveError.stack 
      });
    }
  } catch (error) {
    console.error('Takım oluşturulurken hata:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message,
      stack: error.stack 
    });
  }
};

// Takım güncelle
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    // Kullanıcının takım yöneticisi veya admin olup olmadığını kontrol et
    const isTeamAdmin = team.players.some(p => 
      p.player.toString() === req.user._id.toString() && p.isAdmin === true
    );
    
    if (!isTeamAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    const {
      name,
      level,
      neededPlayers,
      venue,
      preferredTime,
      contactNumber,
      description,
      regularPlayDays,
      location
    } = req.body;
    
    // Güncellenecek alanları belirle
    if (name) team.name = name;
    if (level) team.level = level;
    if (neededPlayers !== undefined) team.neededPlayers = neededPlayers;
    if (venue !== undefined) team.venue = venue || null;
    if (preferredTime) team.preferredTime = preferredTime;
    if (contactNumber !== undefined) team.contactNumber = contactNumber;
    if (description !== undefined) team.description = description;
    if (regularPlayDays) team.regularPlayDays = regularPlayDays;
    if (location) {
      team.location = {
        city: location.city || team.location.city,
        district: location.district || team.location.district
      };
    }
    
    const updatedTeam = await team.save();
    
    // Güncellenen takımı getir
    const populatedTeam = await Team.findById(updatedTeam._id)
      .populate('venue', 'name location')
      .populate('createdBy', 'name')
      .populate('players.player', 'name email');
    
    res.json(populatedTeam);
  } catch (error) {
    console.error('Takım güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Takım sil
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    await Team.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Takım başarıyla silindi' });
  } catch (error) {
    console.error('Takım silinirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Takıma oyuncu ekle
exports.addPlayerToTeam = async (req, res) => {
  try {
    const { teamId, playerId, position } = req.body;
    
    // Takımı bul
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    // Kullanıcının takım yöneticisi veya admin olup olmadığını kontrol et
    const isTeamAdmin = team.players.some(p => 
      p.player.toString() === req.user._id.toString() && p.isAdmin === true
    );
    
    if (!isTeamAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Oyuncuyu bul
    const player = await User.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }
    
    // Oyuncu zaten takımda mı kontrol et
    const isPlayerInTeam = team.players.some(p => p.player.toString() === playerId);
    if (isPlayerInTeam) {
      return res.status(400).json({ message: 'Bu oyuncu zaten takımda' });
    }
    
    // Oyuncuyu takıma ekle
    team.players.push({
      player: playerId,
      position: position || '',
      isAdmin: false
    });
    
    // Takımdaki oyuncu sayısı artarsa, ihtiyaç duyulan oyuncu sayısını güncelle
    if (team.neededPlayers > 0) {
      team.neededPlayers = Math.max(0, team.neededPlayers - 1);
    }
    
    await team.save();
    
    // Güncellenmiş takımı getir
    const updatedTeam = await Team.findById(teamId)
      .populate('venue', 'name location')
      .populate('createdBy', 'name')
      .populate('players.player', 'name email');
    
    res.json(updatedTeam);
  } catch (error) {
    console.error('Oyuncu eklenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Takımdan oyuncu çıkar
exports.removePlayerFromTeam = async (req, res) => {
  try {
    const { teamId, playerId } = req.params;
    
    // Takımı bul
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    // Kullanıcının takım yöneticisi veya admin olup olmadığını kontrol et
    const isTeamAdmin = team.players.some(p => 
      p.player.toString() === req.user._id.toString() && p.isAdmin === true
    );
    
    if (!isTeamAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Oyuncunun takımda olup olmadığını kontrol et
    const playerIndex = team.players.findIndex(p => p.player.toString() === playerId);
    if (playerIndex === -1) {
      return res.status(404).json({ message: 'Oyuncu takımda bulunamadı' });
    }
    
    // Takım kurucusu çıkarılamaz
    if (team.createdBy.toString() === playerId) {
      return res.status(400).json({ message: 'Takım kurucusu takımdan çıkarılamaz' });
    }
    
    // Oyuncuyu takımdan çıkar
    team.players.splice(playerIndex, 1);
    
    // İhtiyaç duyulan oyuncu sayısını güncelle
    team.neededPlayers += 1;
    
    await team.save();
    
    // Güncellenmiş takımı getir
    const updatedTeam = await Team.findById(teamId)
      .populate('venue', 'name location')
      .populate('createdBy', 'name')
      .populate('players.player', 'name email');
    
    res.json(updatedTeam);
  } catch (error) {
    console.error('Oyuncu çıkarılırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Takım istatistiklerini güncelle
exports.updateTeamStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { matchId, result, goals, conceded } = req.body;
    
    // Takımı bul
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    // Kullanıcının admin olup olmadığını kontrol et
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Maç zaten eklenmiş mi kontrol et
    const matchIndex = team.matches.findIndex(m => m.match.toString() === matchId);
    
    if (matchIndex !== -1) {
      // Mevcut maçı güncelle
      team.matches[matchIndex].result = result;
      team.matches[matchIndex].score.goals = goals;
      team.matches[matchIndex].score.conceded = conceded;
    } else {
      // Yeni maç ekle
      team.matches.push({
        match: matchId,
        result,
        score: {
          goals,
          conceded
        }
      });
    }
    
    await team.save();
    
    // Güncellenmiş takımı getir
    const updatedTeam = await Team.findById(teamId)
      .populate('venue', 'name location')
      .populate('createdBy', 'name')
      .populate('matches.match', 'title date');
    
    res.json(updatedTeam);
  } catch (error) {
    console.error('Takım istatistikleri güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}; 