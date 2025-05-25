const mongoose = require('mongoose');
const Player = require('./models/Player');
const Venue = require('./models/Venue');
const Team = require('./models/Team');
const Match = require('./models/Match');
const User = require('./models/User');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/futbolx', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Oyuncu verileri
const playerData = [
  {
    name: 'Erling Haaland',
    position: 'Forvet',
    age: 23,
    height: 194,
    weight: 88,
    preferredFoot: 'Sol',
    rating: 4.8,
    ratingCount: 245,
    matches: 24,
    goals: 18,
    assists: 5,
    yellowCards: 2,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/418560-1695021323.jpg',
    bio: 'Manchester City\'nin yıldız forveti',
    favoriteTeam: 'Manchester City',
    skills: [
      { name: 'Bitiricilik', value: 95 },
      { name: 'Fiziksel Güç', value: 94 },
      { name: 'Hız', value: 89 }
    ]
  },
  {
    name: 'Kevin De Bruyne',
    position: 'Orta Saha',
    age: 31,
    height: 181,
    weight: 76,
    preferredFoot: 'Sağ',
    rating: 4.7,
    ratingCount: 312,
    matches: 30,
    goals: 12,
    assists: 20,
    yellowCards: 5,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/88755-1695021291.jpg',
    bio: 'Premier Lig\'in en iyi orta sahalarından biri',
    favoriteTeam: 'Manchester City',
    skills: [
      { name: 'Pas', value: 96 },
      { name: 'Vizyon', value: 95 },
      { name: 'Şut', value: 88 }
    ]
  },
  {
    name: 'Virgil van Dijk',
    position: 'Defans',
    age: 31,
    height: 193,
    weight: 92,
    preferredFoot: 'Sağ',
    rating: 4.6,
    ratingCount: 278,
    matches: 28,
    goals: 3,
    assists: 1,
    yellowCards: 4,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/139208-1692877595.jpg',
    bio: 'Liverpool\'un kaptan stoper oyuncusu',
    favoriteTeam: 'Liverpool',
    skills: [
      { name: 'Hava Topu', value: 95 },
      { name: 'Müdahale', value: 92 },
      { name: 'Liderlik', value: 90 }
    ]
  },
  {
    name: 'Alisson Becker',
    position: 'Kaleci',
    age: 30,
    height: 191,
    weight: 91,
    preferredFoot: 'Sağ',
    rating: 4.9,
    ratingCount: 198,
    matches: 22,
    goals: 0,
    assists: 1,
    yellowCards: 1,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/105470-1692877790.jpg',
    bio: 'Liverpool\'un Brezilyalı kalecisi',
    favoriteTeam: 'Liverpool',
    skills: [
      { name: 'Refleks', value: 94 },
      { name: 'Pozisyon Alma', value: 93 },
      { name: 'Ayak Tekniği', value: 89 }
    ]
  },
  {
    name: 'Jude Bellingham',
    position: 'Orta Saha',
    age: 20,
    height: 186,
    weight: 75,
    preferredFoot: 'Her İkisi',
    rating: 4.7,
    ratingCount: 156,
    matches: 26,
    goals: 10,
    assists: 8,
    yellowCards: 6,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/581678-1694590326.jpg',
    bio: 'Real Madrid\'in genç yıldızı',
    favoriteTeam: 'Real Madrid',
    skills: [
      { name: 'Teknik', value: 90 },
      { name: 'Dayanıklılık', value: 88 },
      { name: 'Pas', value: 87 }
    ]
  },
  {
    name: 'Kylian Mbappé',
    position: 'Forvet',
    age: 24,
    height: 178,
    weight: 73,
    preferredFoot: 'Sağ',
    rating: 4.9,
    ratingCount: 345,
    matches: 32,
    goals: 28,
    assists: 10,
    yellowCards: 3,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/342229-1694590409.jpg',
    bio: 'Real Madrid\'in Fransız yıldızı',
    favoriteTeam: 'Real Madrid',
    skills: [
      { name: 'Hız', value: 97 },
      { name: 'Bitiricilik', value: 93 },
      { name: 'Dribling', value: 92 }
    ]
  },
  {
    name: 'Rodri',
    position: 'Orta Saha',
    age: 27,
    height: 191,
    weight: 82,
    preferredFoot: 'Sağ',
    rating: 4.6,
    ratingCount: 187,
    matches: 29,
    goals: 5,
    assists: 7,
    yellowCards: 8,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/357565-1695021243.jpg',
    bio: 'Manchester City\'nin İspanyol orta sahası',
    favoriteTeam: 'Manchester City',
    skills: [
      { name: 'Pas', value: 91 },
      { name: 'Pozisyon Alma', value: 94 },
      { name: 'Top Kazanma', value: 90 }
    ]
  },
  {
    name: 'Vinicius Jr.',
    position: 'Forvet',
    age: 23,
    height: 176,
    weight: 73,
    preferredFoot: 'Sağ',
    rating: 4.8,
    ratingCount: 276,
    matches: 30,
    goals: 16,
    assists: 14,
    yellowCards: 5,
    redCards: 1,
    image: 'https://img.a.transfermarkt.technology/portrait/big/371998-1694590349.jpg',
    bio: 'Real Madrid\'in Brezilyalı yıldızı',
    favoriteTeam: 'Real Madrid',
    skills: [
      { name: 'Hız', value: 95 },
      { name: 'Dribling', value: 94 },
      { name: 'Teknik', value: 92 }
    ]
  },
  {
    name: 'Lautaro Martinez',
    position: 'Forvet',
    age: 26,
    height: 174,
    weight: 72,
    preferredFoot: 'Sağ',
    rating: 4.5,
    ratingCount: 165,
    matches: 28,
    goals: 22,
    assists: 6,
    yellowCards: 7,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/406625-1691520477.jpg',
    bio: 'Inter\'in Arjantinli forveti',
    favoriteTeam: 'Inter',
    skills: [
      { name: 'Bitiricilik', value: 90 },
      { name: 'Pozisyon Alma', value: 88 },
      { name: 'Fiziksel Güç', value: 85 }
    ]
  },
  {
    name: 'Joshua Kimmich',
    position: 'Orta Saha',
    age: 28,
    height: 177,
    weight: 73,
    preferredFoot: 'Sağ',
    rating: 4.6,
    ratingCount: 201,
    matches: 31,
    goals: 4,
    assists: 11,
    yellowCards: 6,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/161056-1696529124.jpg',
    bio: 'Bayern Münih\'in Alman yıldızı',
    favoriteTeam: 'Bayern Münih',
    skills: [
      { name: 'Pas', value: 92 },
      { name: 'Vizyon', value: 91 },
      { name: 'Çok Yönlülük', value: 93 }
    ]
  },
  {
    name: 'Trent Alexander-Arnold',
    position: 'Defans',
    age: 25,
    height: 180,
    weight: 69,
    preferredFoot: 'Sağ',
    rating: 4.5,
    ratingCount: 189,
    matches: 27,
    goals: 2,
    assists: 14,
    yellowCards: 3,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/314353-1692877723.jpg',
    bio: 'Liverpool\'un ofansif sağ beki',
    favoriteTeam: 'Liverpool',
    skills: [
      { name: 'Pas', value: 93 },
      { name: 'Orta', value: 92 },
      { name: 'Serbest Vuruş', value: 87 }
    ]
  },
  {
    name: 'Phil Foden',
    position: 'Orta Saha',
    age: 23,
    height: 171,
    weight: 70,
    preferredFoot: 'Sol',
    rating: 4.7,
    ratingCount: 178,
    matches: 29,
    goals: 14,
    assists: 9,
    yellowCards: 2,
    redCards: 0,
    image: 'https://img.a.transfermarkt.technology/portrait/big/406635-1695021347.jpg',
    bio: 'Manchester City\'nin İngiliz yeteneği',
    favoriteTeam: 'Manchester City',
    skills: [
      { name: 'Teknik', value: 92 },
      { name: 'Dribling', value: 90 },
      { name: 'Şut', value: 87 }
    ]
  }
];

// Halı saha verileri
const venueData = [
  {
    name: 'FutbolX Merkez',
    location: 'İstanbul, Kadıköy',
    address: 'Caferağa Mah. Moda Cad. No:120',
    city: 'İstanbul',
    district: 'Kadıköy',
    rating: 4.5,
    ratingCount: 87,
    price: 250,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    contact: '0216 123 45 67',
    email: 'info@futbolxmerkez.com',
    description: 'Kadıköy\'ün merkezinde profesyonel halı saha tesisi',
    amenities: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya'],
    workingHours: '10:00 - 00:00',
    size: '25x40',
    capacity: 14,
    indoor: false
  },
  {
    name: 'FutbolX Arena',
    location: 'İstanbul, Beşiktaş',
    address: 'Sinanpaşa Mah. Ortabahçe Cad. No:55',
    city: 'İstanbul',
    district: 'Beşiktaş',
    rating: 4.3,
    ratingCount: 65,
    price: 300,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    contact: '0212 987 65 43',
    email: 'info@futbolxarena.com',
    description: 'Beşiktaş\'ta lüks halı saha kompleksi',
    amenities: ['Duş', 'Kafeterya', 'Otopark', 'Soyunma Odası'],
    workingHours: '09:00 - 23:00',
    size: '30x45',
    capacity: 14,
    indoor: false
  },
  {
    name: 'Gol Stadyumu',
    location: 'İstanbul, Şişli',
    address: 'Mecidiyeköy Mah. Büyükdere Cad. No:78',
    city: 'İstanbul',
    district: 'Şişli',
    rating: 4.8,
    ratingCount: 112,
    price: 280,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    contact: '0212 456 78 90',
    email: 'iletisim@golstadyumu.com',
    description: 'Şişli\'nin en kaliteli halı saha tesisi',
    amenities: ['Duş', 'Soyunma Odası', 'Wi-Fi', 'Otopark', 'Kafeterya'],
    workingHours: '10:00 - 02:00',
    size: '28x42',
    capacity: 14,
    indoor: true
  },
  {
    name: 'Yıldız Sahası',
    location: 'İstanbul, Ümraniye',
    address: 'Atatürk Mah. Alemdağ Cad. No:150',
    city: 'İstanbul',
    district: 'Ümraniye',
    rating: 4.4,
    ratingCount: 58,
    price: 220,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    contact: '0216 333 22 11',
    email: 'info@yildizsahasi.com',
    description: 'Ümraniye\'de uygun fiyatlı halı saha',
    amenities: ['Duş', 'Otopark', 'Soyunma Odası'],
    workingHours: '10:00 - 23:00',
    size: '25x38',
    capacity: 12,
    indoor: false
  },
  {
    name: 'Futbol Akademi',
    location: 'İstanbul, Maltepe',
    address: 'Cevizli Mah. D-100 Yan Yol No:25',
    city: 'İstanbul',
    district: 'Maltepe',
    rating: 4.6,
    ratingCount: 76,
    price: 260,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80',
    contact: '0216 444 33 22',
    email: 'iletisim@futbolakademi.com',
    description: 'Maltepe\'de profesyonel antrenman sahası',
    amenities: ['Duş', 'Soyunma Odası', 'Kafeterya', 'Otopark', 'Antrenman Ekipmanları'],
    workingHours: '09:00 - 23:30',
    size: '28x40',
    capacity: 14,
    indoor: false
  },
  {
    name: 'Spor Vadisi',
    location: 'İstanbul, Kartal',
    address: 'Kordonboyu Mah. Ankara Cad. No:90',
    city: 'İstanbul',
    district: 'Kartal',
    rating: 4.2,
    ratingCount: 45,
    price: 230,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
    contact: '0216 555 66 77',
    email: 'info@sporvadisi.com',
    description: 'Kartal\'da deniz manzaralı halı saha',
    amenities: ['Duş', 'Soyunma Odası', 'Otopark'],
    workingHours: '10:00 - 22:00',
    size: '25x40',
    capacity: 12,
    indoor: false
  },
  {
    name: 'Yeşil Vadi',
    location: 'İstanbul, Bahçelievler',
    address: 'Bahçelievler Mah. Adnan Kahveci Bulvarı No:45',
    city: 'İstanbul',
    district: 'Bahçelievler',
    rating: 4.3,
    ratingCount: 62,
    price: 240,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    contact: '0212 642 13 57',
    email: 'info@yesilvadi.com',
    description: 'Bahçelievler\'de yeşillikler içinde halı saha',
    amenities: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya'],
    workingHours: '09:00 - 23:00',
    size: '26x40',
    capacity: 14,
    indoor: false
  },
  {
    name: 'Kapalı Arena',
    location: 'İstanbul, Bakırköy',
    address: 'Ataköy 7-8-9-10. Kısım Mah. Çobançeşme E-5 Yan Yol No:12',
    city: 'İstanbul',
    district: 'Bakırköy',
    rating: 4.7,
    ratingCount: 94,
    price: 320,
    priceUnit: 'TL/saat',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    contact: '0212 559 78 45',
    email: 'info@kapaliarena.com',
    description: 'Bakırköy\'de tam donanımlı kapalı halı saha',
    amenities: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya', 'Wi-Fi', 'Masaj Servisi'],
    workingHours: '08:00 - 00:00',
    size: '30x45',
    capacity: 14,
    indoor: true
  }
];

// Örnek takım verileri
const teamData = [
  {
    name: 'Yıldızlar FC',
    level: 'Orta',
    neededPlayers: 2,
    preferredTime: '20:00',
    contactNumber: '05321234567',
    description: 'Haftada 2 kez halı sahada oynayan eğlence odaklı takım.',
    isActive: true,
    regularPlayDays: ['Salı', 'Perşembe'],
    rating: 4.5,
    location: {
      city: 'İstanbul',
      district: 'Kadıköy'
    }
  },
  {
    name: 'Kartallar Spor',
    level: 'İyi',
    neededPlayers: 1,
    preferredTime: '21:00',
    contactNumber: '05351234567',
    description: 'Rekabetçi, disiplinli ve kazanmaya odaklı takım.',
    isActive: true,
    regularPlayDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
    rating: 4.8,
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş'
    }
  },
  {
    name: 'Aslanlar Halı Saha',
    level: 'Pro',
    neededPlayers: 0,
    preferredTime: '19:00',
    contactNumber: '05371234567',
    description: 'Eski profesyonel oyunculardan oluşan ciddi takım.',
    isActive: true,
    regularPlayDays: ['Salı', 'Perşembe', 'Cumartesi'],
    rating: 4.9,
    location: {
      city: 'İstanbul',
      district: 'Ataşehir'
    }
  }
];

// Örnek maç verileri (seedDatabase fonksiyonunda kullanıcı ve saha verileri oluşturulduktan sonra doldurulacak)
const matchData = [];

// Veritabanını doldur
const seedDatabase = async () => {
  try {
    console.log('Veritabanına örnek veriler ekleniyor...');
    
    // Mevcut koleksiyonları kontrol et ve boşsa doldur
    const playerCount = await Player.countDocuments();
    const venueCount = await Venue.countDocuments();
    
    // Oyuncuları ekle (sadece boşsa)
    if (playerCount === 0) {
      const players = await Player.insertMany(playerData);
      console.log(`${players.length} oyuncu eklendi`);
    } else {
      console.log(`Zaten ${playerCount} oyuncu var, yeni oyuncu eklenmedi`);
    }
    
    // Halı sahaları ekle (sadece boşsa)
    if (venueCount === 0) {
      const venues = await Venue.insertMany(venueData);
      console.log(`${venues.length} halı saha eklendi`);
    } else {
      console.log(`Zaten ${venueCount} halı saha var, yeni halı saha eklenmedi`);
    }
    
    // Takım ve Maç modellerini kontrol et
    const Team = mongoose.models.Team || require('./models/Team');
    const Match = mongoose.models.Match || require('./models/Match');
    const User = mongoose.models.User || require('./models/User');
    
    // Sadece Team ve Match modelleri ve en az bir kullanıcı varsa örnek takım ve maç ekle
    if (Team && Match && User) {
      const teamCount = await Team.countDocuments();
      const matchCount = await Match.countDocuments();
      
      // Eğer henüz takım yoksa örnek takımlar ekle
      if (teamCount === 0) {
        try {
          // Varsayılan bir kullanıcı al
          const user = await User.findOne();
          
          if (user) {
            // Halı sahaları bul
            const venues = await Venue.find().limit(5);
            
            if (venues.length > 0) {
              // Takımları ekle
              const teams = [];
              
              for (const team of teamData) {
                const newTeam = new Team({
                  ...team,
                  createdBy: user._id,
                  players: [{
                    player: user._id,
                    position: 'Orta Saha',
                    isAdmin: true
                  }],
                  venue: venues[Math.floor(Math.random() * venues.length)]._id
                });
                
                const savedTeam = await newTeam.save();
                teams.push(savedTeam);
              }
              
              console.log(`${teams.length} takım eklendi`);
              
              // Eğer henüz maç yoksa örnek maçlar ekle
              if (matchCount === 0 && teams.length > 0) {
                const matchesToAdd = [];
                
                for (let i = 0; i < 5; i++) {
                  const venue = venues[Math.floor(Math.random() * venues.length)];
                  const today = new Date();
                  
                  // Gelecekteki veya geçmişteki bir tarih oluştur
                  const matchDate = new Date(today);
                  matchDate.setDate(today.getDate() + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 7));
                  
                  const startHour = 18 + Math.floor(Math.random() * 5); // 18-22 arası
                  
                  const match = {
                    title: `${teams[0].name} vs ${teams[1 % teams.length].name}`,
                    venue: venue._id,
                    date: matchDate,
                    startTime: `${startHour}:00`,
                    endTime: `${startHour + 1}:00`,
                    organizer: user._id,
                    players: [{
                      player: user._id,
                      position: 'Orta Saha',
                      team: 'A'
                    }],
                    maxPlayers: 14,
                    price: venue.price || 450,
                    status: 'açık',
                    description: 'Herkes katılabilir, seviyeler karışık.',
                    isPublic: true
                  };
                  
                  matchesToAdd.push(match);
                }
                
                const matches = await Match.insertMany(matchesToAdd);
                console.log(`${matches.length} maç eklendi`);
                
                // Maçları takımlara ekle
                for (let i = 0; i < Math.min(teams.length, matches.length); i++) {
                  const team = teams[i];
                  const match = matches[i];
                  
                  team.matches.push({
                    match: match._id,
                    result: ['Galibiyet', 'Beraberlik', 'Mağlubiyet'][Math.floor(Math.random() * 3)],
                    score: {
                      goals: Math.floor(Math.random() * 5),
                      conceded: Math.floor(Math.random() * 3)
                    }
                  });
                  
                  await team.save();
                }
                
                console.log('Takımlara maçlar eklendi');
              } else {
                console.log(`Zaten ${matchCount} maç var, yeni maç eklenmedi`);
              }
            } else {
              console.log('Halı saha bulunamadığı için takım ve maç verileri eklenemedi');
            }
          } else {
            console.log('Kullanıcı bulunamadığı için takım ve maç verileri eklenemedi');
          }
        } catch (error) {
          console.error('Takım ve maç verileri eklenirken hata:', error);
        }
      } else {
        console.log(`Zaten ${teamCount} takım var, yeni takım eklenmedi`);
      }
    }
    
    console.log('Örnek veriler başarıyla eklendi');
  } catch (error) {
    console.error('Veritabanı doldurulurken hata:', error);
  }
};

// Veritabanını doldur - İlk çalıştırmada tetikle
seedDatabase(); 

// Diğer uygulamalardan erişilebilmesi için dışa aktar
module.exports = { seedDatabase }; 