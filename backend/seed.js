const mongoose = require('mongoose');
const Player = require('./models/Player');
const Venue = require('./models/Venue');
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

// Veritabanını temizle ve yeni verileri ekle
const seedDatabase = async () => {
  try {
    // Koleksiyonları temizle
    await Player.deleteMany({});
    await Venue.deleteMany({});
    
    // Yeni verileri ekle
    await Player.insertMany(playerData);
    await Venue.insertMany(venueData);
    
    console.log('Veritabanı başarıyla dolduruldu!');
    process.exit(0);
  } catch (error) {
    console.error('Seed hatası:', error);
    process.exit(1);
  }
};

seedDatabase(); 