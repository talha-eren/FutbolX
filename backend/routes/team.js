const express = require('express');
const router = express.Router();

// Örnek takım verileri
const teams = [
  {
    id: 1,
    name: 'Galatasaray',
    logo: '/api/images/galatasaray-logo.png',
    city: 'İstanbul',
    founded: 1905,
    stadium: 'Türk Telekom Stadyumu',
    description: 'Türkiye\'nin en köklü kulüplerinden biri'
  },
  {
    id: 2,
    name: 'Fenerbahçe',
    logo: '/api/images/fenerbahce-logo.png',
    city: 'İstanbul',
    founded: 1907,
    stadium: 'Ülker Stadyumu',
    description: 'Sarı-lacivertli takım'
  },
  {
    id: 3,
    name: 'Beşiktaş',
    logo: '/api/images/besiktas-logo.png',
    city: 'İstanbul',
    founded: 1903,
    stadium: 'Vodafone Park',
    description: 'Siyah-beyazlı kartallar'
  },
  {
    id: 4,
    name: 'Trabzonspor',
    logo: '/api/images/trabzonspor-logo.png',
    city: 'Trabzon',
    founded: 1967,
    stadium: 'Medical Park Stadyumu',
    description: 'Karadeniz\'in yıldızı'
  },
  {
    id: 5,
    name: 'Başakşehir',
    logo: '/api/images/basaksehir-logo.png',
    city: 'İstanbul',
    founded: 1990,
    stadium: 'Başakşehir Fatih Terim Stadyumu',
    description: 'Turuncu-lacivert takım'
  },
  {
    id: 6,
    name: 'Antalyaspor',
    logo: '/api/images/antalyaspor-logo.png',
    city: 'Antalya',
    founded: 1966,
    stadium: 'Antalya Stadyumu',
    description: 'Akdeniz\'in takımı'
  },
  {
    id: 7,
    name: 'Konyaspor',
    logo: '/api/images/konyaspor-logo.png',
    city: 'Konya',
    founded: 1922,
    stadium: 'Konya Büyükşehir Stadyumu',
    description: 'Anadolu\'nun kalbi'
  },
  {
    id: 8,
    name: 'Sivasspor',
    logo: '/api/images/sivasspor-logo.png',
    city: 'Sivas',
    founded: 1967,
    stadium: 'Sivas 4 Eylül Stadyumu',
    description: 'Kırmızı-beyazlı takım'
  }
];

// Tüm takımları getir
router.get('/', (req, res) => {
  try {
    console.log('Takımlar listesi istendi');
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
router.get('/:id', (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const team = teams.find(t => t.id === teamId);
    
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
router.get('/city/:city', (req, res) => {
  try {
    const city = req.params.city;
    const cityTeams = teams.filter(t => t.city.toLowerCase() === city.toLowerCase());
    
    console.log(`${city} şehrindeki takımlar istendi`);
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

module.exports = router; 