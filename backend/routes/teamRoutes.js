const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, adminMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// Tüm takımları getir - herkese açık
router.get('/', optionalAuth, teamController.getTeams);

// ID'ye göre takım getir - herkese açık
router.get('/:id', teamController.getTeamById);

// Yeni takım oluştur (giriş yapmış kullanıcılar için)
router.post('/', protect, teamController.createTeam);

// Takım güncelle (takım yöneticileri ve adminler için)
router.put('/:id', protect, teamController.updateTeam);

// Takım sil (sadece adminler için)
router.delete('/:id', adminMiddleware, teamController.deleteTeam);

// Takıma oyuncu ekle
router.post('/player', protect, teamController.addPlayerToTeam);

// Takımdan oyuncu çıkar
router.delete('/:teamId/player/:playerId', protect, teamController.removePlayerFromTeam);

// Takım istatistiklerini güncelle
router.patch('/:teamId/stats', adminMiddleware, teamController.updateTeamStats);

module.exports = router; 