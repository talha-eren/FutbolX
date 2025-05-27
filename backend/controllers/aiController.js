const geminiService = require('../services/geminiService');
const User = require('../models/User');

// Oyuncu önerileri al
exports.getPlayerRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const recommendations = await geminiService.getPlayerRecommendations(user);
    
    res.json({
      success: true,
      recommendations,
      userProfile: {
        position: user.position,
        experience: user.footballExperience,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Oyuncu önerileri hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'AI önerileri alınamadı' 
    });
  }
};

// Takım analizi yap
exports.analyzeTeam = async (req, res) => {
  try {
    const { playerIds } = req.body;
    
    if (!playerIds || !Array.isArray(playerIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçerli oyuncu ID\'leri gerekli' 
      });
    }

    const players = await User.find({ 
      _id: { $in: playerIds } 
    }).select('firstName lastName position footballExperience');

    if (players.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Oyuncular bulunamadı' 
      });
    }

    const analysis = await geminiService.analyzeTeamComposition(players);
    
    res.json({
      success: true,
      analysis,
      teamSize: players.length,
      players: players.map(p => ({
        name: `${p.firstName} ${p.lastName}`,
        position: p.position,
        experience: p.footballExperience
      }))
    });
  } catch (error) {
    console.error('Takım analizi hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Takım analizi yapılamadı' 
    });
  }
};

// Antrenman önerileri al
exports.getTrainingRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const recommendations = await geminiService.getTrainingRecommendations(user);
    
    res.json({
      success: true,
      recommendations,
      userProfile: {
        position: user.position,
        experience: user.footballExperience,
        height: user.height,
        weight: user.weight
      }
    });
  } catch (error) {
    console.error('Antrenman önerileri hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Antrenman önerileri alınamadı' 
    });
  }
};

// AI Chatbot
exports.chatWithAI = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Soru gerekli' 
      });
    }

    // Kullanıcı context'i al
    const user = await User.findById(userId).select('position footballExperience');
    const userContext = user ? {
      position: user.position,
      footballExperience: user.footballExperience
    } : {};

    const response = await geminiService.chatWithAI(question, userContext);
    
    res.json({
      success: true,
      question,
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI Chat hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'AI ile sohbet edilemiyor' 
    });
  }
};

// Maç analizi yap
exports.analyzeMatch = async (req, res) => {
  try {
    const { matchData } = req.body;
    
    if (!matchData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maç verileri gerekli' 
      });
    }

    const analysis = await geminiService.analyzeMatch(matchData);
    
    res.json({
      success: true,
      analysis,
      matchData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Maç analizi hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Maç analizi yapılamadı' 
    });
  }
};

// AI durumunu kontrol et
exports.getAIStatus = async (req, res) => {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    
    res.json({
      success: true,
      aiEnabled: hasApiKey,
      message: hasApiKey ? 'AI servisi aktif' : 'AI servisi için API key gerekli'
    });
  } catch (error) {
    console.error('AI durum kontrolü hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI durumu kontrol edilemiyor' 
    });
  }
}; 