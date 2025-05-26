const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Tüm takımları getir
router.get('/', async (req, res) => {
  try {
    console.log('Takımlar listesi istendi');
    
    const teams = await Team.find({}).sort({ createdAt: -1 });
    
    console.log(`${teams.length} takım bulundu`);
    
    res.json({
      success: true,
      data: teams,
      count: teams.length
    });
  } catch (error) {
    console.error('Takımlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Takımlar getirilirken hata oluştu',
      error: error.message
    });
  }
});

// Belirli bir takımı getir
router.get('/:id', async (req, res) => {
  try {
    const teamId = req.params.id;
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Takım bulunamadı'
      });
    }
    
    console.log(`Takım detayı istendi: ${team.name}`);
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Takım detayı getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Takım detayı getirilirken hata oluştu',
      error: error.message
    });
  }
});

// Şehre göre takımları getir
router.get('/city/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const cityTeams = await Team.find({ 
      city: { $regex: new RegExp(city, 'i') } 
    }).sort({ createdAt: -1 });
    
    console.log(`${city} şehrindeki ${cityTeams.length} takım istendi`);
    res.json({
      success: true,
      data: cityTeams,
      count: cityTeams.length
    });
  } catch (error) {
    console.error('Şehir takımları getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Şehir takımları getirilirken hata oluştu',
      error: error.message
    });
  }
});

// Seviyeye göre takımları getir
router.get('/level/:level', async (req, res) => {
  try {
    const level = req.params.level;
    const levelTeams = await Team.find({ level }).sort({ createdAt: -1 });
    
    console.log(`${level} seviyesindeki ${levelTeams.length} takım istendi`);
    res.json({
      success: true,
      data: levelTeams,
      count: levelTeams.length
    });
  } catch (error) {
    console.error('Seviye takımları getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Seviye takımları getirilirken hata oluştu',
      error: error.message
    });
  }
});

// Takıma katılma isteği
router.post('/:id/join', async (req, res) => {
  try {
    const teamId = req.params.id;
    const { userId } = req.body;
    
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Takım bulunamadı'
      });
    }
    
    if (team.neededPlayers <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Takım dolu, yeni oyuncu alınmıyor'
      });
    }
    
    // Kullanıcının zaten takımda olup olmadığını kontrol et
    const isAlreadyMember = team.players.some(player => player._id === userId);
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Zaten bu takımın üyesisiniz'
      });
    }
    
    console.log(`Takıma katılma isteği: ${team.name} - User: ${userId}`);
    res.json({
      success: true,
      message: 'Katılma isteğiniz takım kaptanına iletildi'
    });
  } catch (error) {
    console.error('Takıma katılma isteği işlenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Takıma katılma isteği işlenirken hata oluştu',
      error: error.message
    });
  }
});

// Yeni takım oluştur
router.post('/', async (req, res) => {
  try {
    const teamData = req.body;
    
    const newTeam = new Team(teamData);
    const savedTeam = await newTeam.save();
    
    console.log(`Yeni takım oluşturuldu: ${savedTeam.name}`);
    res.status(201).json({
      success: true,
      data: savedTeam,
      message: 'Takım başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Takım oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Takım oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// Takım güncelle
router.put('/:id', async (req, res) => {
  try {
    const teamId = req.params.id;
    const updateData = req.body;
    
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedTeam) {
      return res.status(404).json({
        success: false,
        message: 'Takım bulunamadı'
      });
    }
    
    console.log(`Takım güncellendi: ${updatedTeam.name}`);
    res.json({
      success: true,
      data: updatedTeam,
      message: 'Takım başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Takım güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Takım güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// Takım sil
router.delete('/:id', async (req, res) => {
  try {
    const teamId = req.params.id;
    
    const deletedTeam = await Team.findByIdAndDelete(teamId);
    
    if (!deletedTeam) {
      return res.status(404).json({
        success: false,
        message: 'Takım bulunamadı'
      });
    }
    
    console.log(`Takım silindi: ${deletedTeam.name}`);
    res.json({
      success: true,
      message: 'Takım başarıyla silindi'
    });
  } catch (error) {
    console.error('Takım silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Takım silinirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 