const mongoose = require('mongoose');
const Player = require('../models/Player');

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/futbolx', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const players = [
  {
    name: "Kaleci Ali",
    position: "Kaleci",
    level: "orta",
    preferredTime: "20:00",
    contactNumber: "05551234567",
    description: "Deneyimli kaleci, refleksleri çok iyi. Takım oyununa önem verir.",
    stats: {
      attack: 20,
      defense: 95,
      speed: 60,
      teamwork: 85
    },
    location: {
      city: "İstanbul",
      district: "Kadıköy"
    },
    isActive: true,
    isApproved: true,
    regularPlayDays: ["Pazartesi", "Çarşamba", "Cuma"],
    rating: 0,
    matches: [],
    age: 28,
    height: 185,
    weight: 80,
    preferredFoot: "Sağ",
    favoriteTeam: "Fenerbahçe"
  },
  {
    name: "Defans Mehmet",
    position: "Defans",
    level: "ileri",
    preferredTime: "21:00",
    contactNumber: "05552345678",
    description: "Güçlü defans oyuncusu, hava toplarında etkili. Liderlik vasfı var.",
    stats: {
      attack: 40,
      defense: 90,
      speed: 70,
      teamwork: 88
    },
    location: {
      city: "İstanbul",
      district: "Beşiktaş"
    },
    isActive: true,
    isApproved: true,
    regularPlayDays: ["Salı", "Perşembe", "Cumartesi"],
    rating: 0,
    matches: [],
    age: 26,
    height: 182,
    weight: 78,
    preferredFoot: "Sol",
    favoriteTeam: "Beşiktaş"
  },
  {
    name: "Defans Emre",
    position: "Defans",
    level: "orta",
    preferredTime: "19:00",
    contactNumber: "05553456789",
    description: "Hızlı ve çevik defans oyuncusu. Ofansif katkıları da var.",
    stats: {
      attack: 55,
      defense: 85,
      speed: 80,
      teamwork: 75
    },
    location: {
      city: "İstanbul",
      district: "Şişli"
    },
    isActive: true,
    isApproved: true,
    regularPlayDays: ["Pazartesi", "Cuma", "Pazar"],
    rating: 0,
    matches: [],
    age: 24,
    height: 178,
    weight: 75,
    preferredFoot: "Sağ",
    favoriteTeam: "Galatasaray"
  },
  {
    name: "Orta Saha Burak",
    position: "Orta Saha",
    level: "ileri",
    preferredTime: "20:30",
    contactNumber: "05554567890",
    description: "Yaratıcı orta saha oyuncusu, pas kalitesi yüksek. Oyun kurma yeteneği var.",
    stats: {
      attack: 75,
      defense: 65,
      speed: 85,
      teamwork: 92
    },
    location: {
      city: "İstanbul",
      district: "Üsküdar"
    },
    isActive: true,
    isApproved: true,
    regularPlayDays: ["Çarşamba", "Cumartesi", "Pazar"],
    rating: 0,
    matches: [],
    age: 27,
    height: 175,
    weight: 72,
    preferredFoot: "Her İkisi",
    favoriteTeam: "Trabzonspor"
  },
  {
    name: "Orta Saha Kerem",
    position: "Orta Saha",
    level: "başlangıç",
    preferredTime: "18:00",
    contactNumber: "05555678901",
    description: "Genç ve hırslı oyuncu, öğrenmeye açık. Koşu gücü yüksek.",
    stats: {
      attack: 60,
      defense: 55,
      speed: 90,
      teamwork: 70
    },
    location: {
      city: "İstanbul",
      district: "Maltepe"
    },
    isActive: true,
    isApproved: true,
    regularPlayDays: ["Salı", "Perşembe", "Cumartesi"],
    rating: 0,
    matches: [],
    age: 22,
    height: 172,
    weight: 68,
    preferredFoot: "Sağ",
    favoriteTeam: "Fenerbahçe"
  },
  {
    name: "Forvet Arda",
    position: "Forvet",
    level: "orta",
    preferredTime: "21:30",
    contactNumber: "05556789012",
    description: "Gol yeteneği yüksek forvet, bitiricilik konusunda yetenekli. Hızlı ve çevik.",
    stats: {
      attack: 95,
      defense: 30,
      speed: 88,
      teamwork: 80
    },
    location: {
      city: "İstanbul",
      district: "Kartal"
    },
    isActive: true,
    isApproved: true,
    regularPlayDays: ["Pazartesi", "Çarşamba", "Cuma"],
    rating: 0,
    matches: [],
    age: 25,
    height: 180,
    weight: 76,
    preferredFoot: "Sol",
    favoriteTeam: "Galatasaray"
  }
];

async function addPlayers() {
  try {
    console.log('Oyuncular ekleniyor...');
    
    // Önce mevcut oyuncuları kontrol et
    const existingPlayers = await Player.find({});
    console.log(`Mevcut oyuncu sayısı: ${existingPlayers.length}`);
    
    // Yeni oyuncuları ekle
    const result = await Player.insertMany(players);
    console.log(`${result.length} oyuncu başarıyla eklendi!`);
    
    // Eklenen oyuncuları listele
    result.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} - ${player.position} - ${player.level}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Hata:', error);
    mongoose.connection.close();
  }
}

addPlayers(); 