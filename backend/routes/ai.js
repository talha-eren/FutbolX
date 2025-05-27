const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Tüm AI route'ları authentication gerektirir
router.use(auth);

// AI durumunu kontrol et
router.get('/status', aiController.getAIStatus);

// Oyuncu önerileri al
router.get('/player-recommendations', aiController.getPlayerRecommendations);

// Antrenman önerileri al
router.get('/training-recommendations', aiController.getTrainingRecommendations);

// Takım analizi yap
router.post('/analyze-team', aiController.analyzeTeam);

// AI ile sohbet et
router.post('/chat', aiController.chatWithAI);

// Maç analizi yap
router.post('/analyze-match', aiController.analyzeMatch);

module.exports = router; 