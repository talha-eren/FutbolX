// Gemini AI Test Scripti
require('dotenv').config();

// API key'i manuel olarak ayarla (test için)
process.env.GEMINI_API_KEY = 'AIzaSyDdUEyJVbyjFEZdWHZTi7WD2Xd74db5Mh';

const geminiService = require('./services/geminiService');

async function testGeminiAI() {
  console.log('🤖 Gemini AI Test Başlatılıyor...\n');

  // Test 1: Oyuncu Önerileri
  console.log('📋 Test 1: Oyuncu Önerileri');
  try {
    const testUser = {
      position: 'Orta Saha',
      footballExperience: 'İleri',
      preferredFoot: 'Sağ',
      location: 'Kadıköy',
      favoriteTeam: 'Fenerbahçe'
    };

    const recommendations = await geminiService.getPlayerRecommendations(testUser);
    console.log('✅ Başarılı!');
    console.log('Öneri:', recommendations.substring(0, 100) + '...\n');
  } catch (error) {
    console.log('❌ Hata:', error.message, '\n');
  }

  // Test 2: AI Chat
  console.log('💬 Test 2: AI Chat');
  try {
    const response = await geminiService.chatWithAI(
      'Futbolda en iyi antrenman yöntemleri nelerdir?',
      { position: 'Forvet', footballExperience: 'Orta' }
    );
    console.log('✅ Başarılı!');
    console.log('Yanıt:', response.substring(0, 100) + '...\n');
  } catch (error) {
    console.log('❌ Hata:', error.message, '\n');
  }

  // Test 3: Antrenman Önerileri
  console.log('🏃‍♂️ Test 3: Antrenman Önerileri');
  try {
    const testUser = {
      position: 'Kaleci',
      footballExperience: 'Başlangıç',
      height: 185,
      weight: 80,
      preferredFoot: 'Sağ'
    };

    const training = await geminiService.getTrainingRecommendations(testUser);
    console.log('✅ Başarılı!');
    console.log('Antrenman:', training.substring(0, 100) + '...\n');
  } catch (error) {
    console.log('❌ Hata:', error.message, '\n');
  }

  console.log('🎉 Test tamamlandı!');
}

// Test'i çalıştır
testGeminiAI().catch(console.error); 