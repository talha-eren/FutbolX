// Veritabanını örnek verilerle doldurmak için script
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Model importları - kendi modellerimizi kullan
const User = require('./models/User');
const Field = require('./models/Field');
const Event = require('./models/Event');
const Post = require('./models/Post');
const Video = require('./models/Video');
const Match = require('./models/Match');

// MongoDB bağlantısı
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://bilikcitalha:talhaeren@cluster0.86ovh.mongodb.net/futbolx?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
  });

// Örnek veri setleri
// Halı saha veri seti
const fields = [
  {
    name: 'Yeşil Vadi Halı Saha',
    location: 'Kadıköy, İstanbul',
    price: 600,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Son teknoloji suni çim ve aydınlatma sistemine sahip halı saha',
    features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya']
  },
  {
    name: 'Fenerbahçe Spor Kompleksi',
    location: 'Ataşehir, İstanbul',
    price: 750,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1555069410-a10268d6ffab?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'FIFA standartlarında profesyonel halı saha tesisi',
    features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya', 'VIP Salon']
  },
  {
    name: 'Göztepe Park Halı Saha',
    location: 'Göztepe, İstanbul',
    price: 500,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1525764644133-21f28ea7c83b?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Şehir parkı içerisinde, doğayla iç içe halı saha',
    features: ['Duş', 'Soyunma Odası', 'Kafeterya']
  },
  {
    name: 'Beşiktaş Arena',
    location: 'Beşiktaş, İstanbul',
    price: 650,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1565116150218-321b5dca7fb7?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Sınırsız su, havlu ve spor malzemesi hizmeti ile lüks halı saha',
    features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya', 'Fitness Salonu']
  },
  {
    name: 'Galatasaray Futbol Akademisi',
    location: 'Florya, İstanbul',
    price: 800,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Profesyonel futbol akademisi sahaları',
    features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya', 'VIP Salon', 'Fitness Salonu']
  },
  {
    name: 'Bostancı Spor Tesisleri',
    location: 'Bostancı, İstanbul',
    price: 550,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1542853435-f94b56b3e8e1?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Geniş ve konforlu soyunma odaları olan halı saha',
    features: ['Duş', 'Soyunma Odası', 'Otopark']
  },
  {
    name: 'Maltepe Sahil Spor Kompleksi',
    location: 'Maltepe, İstanbul',
    price: 580,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=1474&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Deniz manzaralı, açık ve kapalı halı sahalar',
    features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya']
  },
  {
    name: 'Levent Futbol Center',
    location: 'Levent, İstanbul',
    price: 720,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1510051693265-dfb0e772337d?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'İş çıkışı vakit geçirmek için ideal merkezi konum',
    features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya', 'Fitness Salonu']
  },
  {
    name: 'Moda Spor Sahası',
    location: 'Moda, İstanbul',
    price: 620,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1536122985607-4fe00b283652?q=80&w=1474&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Tarihi semtte keyifli futbol deneyimi',
    features: ['Duş', 'Soyunma Odası', 'Kafeterya']
  },
  {
    name: 'Kartal Stadyum Tesisleri',
    location: 'Kartal, İstanbul',
    price: 520,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait',
    description: 'Farklı büyüklüklerde sahalar ve uygun fiyatlar',
    features: ['Duş', 'Soyunma Odası', 'Otopark']
  }
];

// Etkinlik veri setine görseller ekle
const events = [
  {
    title: 'Halı Saha Turnuvası',
    description: 'Amatör takımlar arası dostluk turnuvası. Kazanan takıma kupa ve madalya verilecektir.',
    location: 'Kadıköy, İstanbul',
    date: '15.12.2025',
    time: '14:00',
    image: 'https://images.unsplash.com/photo-1577849304893-c33978a71975?q=80&w=1470&auto=format&fit=crop',
    participants: 24,
    maxParticipants: 40
  },
  {
    title: 'Yaz Futbol Kampı',
    description: 'Genç futbolseverler için 1 haftalık teknik ve taktik kampı',
    location: 'Kartal, İstanbul',
    date: '05.08.2025',
    time: '09:00',
    image: 'https://images.unsplash.com/photo-1611741385819-a12d56e4a07d?q=80&w=1470&auto=format&fit=crop',
    participants: 18,
    maxParticipants: 30
  },
  {
    title: 'Kadınlar Futbol Günü',
    description: 'Kadın futbol takımlarının buluşması ve gösteri maçları',
    location: 'Maltepe, İstanbul',
    date: '08.03.2026',
    time: '13:00',
    image: 'https://images.unsplash.com/photo-1623944889288-3f8580a973e3?q=80&w=1470&auto=format&fit=crop',
    participants: 32,
    maxParticipants: 50
  },
  {
    title: 'Şirketler Ligi',
    description: 'Kurumlar arası 2 aylık futbol turnuvası',
    location: 'Levent, İstanbul',
    date: '01.10.2025',
    time: '18:00',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
    participants: 60,
    maxParticipants: 80
  },
  {
    title: 'Veteranlar Kupası',
    description: '35 yaş üstü futbolseverler için özel turnuva',
    location: 'Bostancı, İstanbul',
    date: '25.11.2025',
    time: '10:00',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1593&auto=format&fit=crop',
    participants: 40,
    maxParticipants: 60
  },
  {
    title: 'Çocuk Futbol Festivali',
    description: '8-12 yaş arası çocuklar için eğlenceli futbol etkinliği',
    location: 'Göztepe, İstanbul',
    date: '23.04.2026',
    time: '11:00',
    image: 'https://images.unsplash.com/photo-1560272564-c83b665f16be?q=80&w=1449&auto=format&fit=crop',
    participants: 25,
    maxParticipants: 50
  },
  {
    title: 'Freestyle Futbol Yarışması',
    description: 'En iyi futbol numaralarını sergileyin ve ödülleri kazanın',
    location: 'Beşiktaş, İstanbul',
    date: '17.07.2025',
    time: '16:30',
    image: 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?q=80&w=1473&auto=format&fit=crop',
    participants: 15,
    maxParticipants: 25
  },
  {
    title: 'Üniversiteler Futbol Şöleni',
    description: 'İstanbul üniversiteleri arasında dostluk turnuvası',
    location: 'Florya, İstanbul',
    date: '02.05.2026',
    time: '12:00',
    image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?q=80&w=1470&auto=format&fit=crop',
    participants: 48,
    maxParticipants: 64
  }
];

// Veritabanını temizle ve örnek verilerle doldur
async function seedDatabase() {
  try {
    // Mevcut verileri temizle
    console.log('Mevcut verileri temizliyorum...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Field.deleteMany({});
    await Post.deleteMany({});
    await Video.deleteMany({});
    await Match.deleteMany({});
    console.log('Mevcut veriler temizlendi.');

    console.log('Veritabanına örnek veriler ekleniyor...');

    // Örnek kullanıcılar ekle
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        username: 'ahmet123',
        email: 'ahmet@example.com',
        password: hashedPassword,
        name: 'Ahmet Yılmaz',
        bio: 'Futbol tutkunu, orta saha oyuncusu',
        profilePicture: 'https://randomuser.me/api/portraits/men/41.jpg',
        level: 'Orta',
        position: 'Orta Saha',
        footPreference: 'Sağ'
      },
      {
        username: 'mehmet456',
        email: 'mehmet@example.com',
        password: hashedPassword,
        name: 'Mehmet Kaya',
        bio: 'Amatör kaleci, futbol antrenörü',
        profilePicture: 'https://randomuser.me/api/portraits/men/42.jpg',
        level: 'İleri',
        position: 'Kaleci',
        footPreference: 'Sol'
      },
      {
        username: 'ayse789',
        email: 'ayse@example.com',
        password: hashedPassword,
        name: 'Ayşe Demir',
        bio: 'Kadın futbol takımı kaptanı',
        profilePicture: 'https://randomuser.me/api/portraits/women/65.jpg',
        level: 'İleri',
        position: 'Forvet',
        footPreference: 'Sağ'
      },
      {
        username: 'can_futbolcu',
        email: 'can@example.com',
        password: hashedPassword,
        name: 'Can Yıldız',
        bio: 'Profesyonel futbolcu, forvet',
        profilePicture: 'https://randomuser.me/api/portraits/men/43.jpg',
        level: 'İleri',
        position: 'Forvet',
        footPreference: 'Sağ'
      },
      {
        username: 'emre_kral',
        email: 'emre@example.com',
        password: hashedPassword,
        name: 'Emre Şahin',
        bio: 'Hafta sonları halı saha kralı',
        profilePicture: 'https://randomuser.me/api/portraits/men/44.jpg',
        level: 'Orta',
        position: 'Defans',
        footPreference: 'Sağ'
      },
      {
        username: 'merve_futbol',
        email: 'merve@example.com',
        password: hashedPassword,
        name: 'Merve Aksoy',
        bio: 'Futbolu hayat tarzı olarak benimsemiş',
        profilePicture: 'https://randomuser.me/api/portraits/women/66.jpg',
        level: 'Orta',
        position: 'Orta Saha',
        footPreference: 'Sağ'
      },
      {
        username: 'selim_10',
        email: 'selim@example.com',
        password: hashedPassword,
        name: 'Selim Öztürk',
        bio: 'Yerel ligde forma giyiyorum',
        profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg',
        level: 'İleri',
        position: 'Orta Saha',
        footPreference: 'Sol'
      },
      {
        username: 'zeynep_fut',
        email: 'zeynep@example.com',
        password: hashedPassword,
        name: 'Zeynep Koç',
        bio: 'Hem futbol oynar hem antrenörlük yaparım',
        profilePicture: 'https://randomuser.me/api/portraits/women/67.jpg',
        level: 'İleri',
        position: 'Kanat',
        footPreference: 'Sağ'
      },
      {
        username: 'kerem_stoper',
        email: 'kerem@example.com',
        password: hashedPassword,
        name: 'Kerem Aydın',
        bio: 'Defansın son kalesi',
        profilePicture: 'https://randomuser.me/api/portraits/men/46.jpg',
        level: 'Orta',
        position: 'Defans',
        footPreference: 'Sağ'
      },
      {
        username: 'deniz_futbolcu',
        email: 'deniz@example.com',
        password: hashedPassword,
        name: 'Deniz Yılmaz',
        bio: 'Yeni başladım ama hızlı öğreniyorum',
        profilePicture: 'https://randomuser.me/api/portraits/men/47.jpg',
        level: 'Amatör',
        position: 'Orta Saha',
        footPreference: 'Sağ'
      }
    ]);
    
    console.log(`${users.length} kullanıcı eklendi`);

    // Örnek halı sahalar ekle
    const createdFields = await Field.create(fields);
    console.log(`${createdFields.length} halı saha eklendi`);

    // Örnek etkinlikler ekle
    const createdEvents = await Event.create(events.map(event => ({
      ...event,
      organizer: users[Math.floor(Math.random() * users.length)]._id
    })));
    console.log(`${createdEvents.length} etkinlik eklendi`);

    // Örnek maçlar ekle
    const matchData = [
      {
        fieldName: 'Yeşil Vadi Halı Saha',
        location: 'Kadıköy, İstanbul',
        date: '20.12.2025',
        time: '18:00',
        price: 50,
        organizer: users[0]._id,
        totalPlayers: 14,
        playersJoined: 1,
        level: 'Orta',
        image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
        isPrivate: false,
        players: [users[0]._id]
      },
      {
        fieldName: 'Fenerbahçe Spor Kompleksi',
        location: 'Ataşehir, İstanbul',
        date: '22.12.2025',
        time: '20:00',
        price: 60,
        organizer: users[1]._id,
        totalPlayers: 10,
        playersJoined: 1,
        level: 'İleri',
        image: 'https://images.unsplash.com/photo-1555069410-a10268d6ffab?q=80&w=1470&auto=format&fit=crop',
        isPrivate: true,
        players: [users[1]._id]
      },
      {
        fieldName: 'Göztepe Park Halı Saha',
        location: 'Göztepe, İstanbul',
        date: '24.12.2025',
        time: '19:30',
        price: 45,
        organizer: users[2]._id,
        totalPlayers: 12,
        playersJoined: 1,
        level: 'Amatör',
        image: 'https://images.unsplash.com/photo-1525764644133-21f28ea7c83b?q=80&w=1470&auto=format&fit=crop',
        isPrivate: false,
        players: [users[2]._id]
      },
      {
        fieldName: 'Beşiktaş Arena',
        location: 'Beşiktaş, İstanbul',
        date: '28.12.2025',
        time: '17:00',
        price: 55,
        organizer: users[3]._id,
        totalPlayers: 16,
        playersJoined: 1,
        level: 'Orta',
        image: 'https://images.unsplash.com/photo-1565116150218-321b5dca7fb7?q=80&w=1470&auto=format&fit=crop',
        isPrivate: false,
        players: [users[3]._id]
      },
      {
        fieldName: 'Galatasaray Futbol Akademisi',
        location: 'Florya, İstanbul',
        date: '03.01.2026',
        time: '16:00',
        price: 70,
        organizer: users[4]._id,
        totalPlayers: 14,
        playersJoined: 5,
        level: 'İleri',
        image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
        isPrivate: false,
        players: [users[4]._id, users[6]._id, users[8]._id, users[1]._id, users[3]._id]
      },
      {
        fieldName: 'Bostancı Spor Tesisleri',
        location: 'Bostancı, İstanbul',
        date: '05.01.2026',
        time: '19:00',
        price: 40,
        organizer: users[5]._id,
        totalPlayers: 10,
        playersJoined: 4,
        level: 'Amatör',
        image: 'https://images.unsplash.com/photo-1542853435-f94b56b3e8e1?q=80&w=1470&auto=format&fit=crop',
        isPrivate: false,
        players: [users[5]._id, users[9]._id, users[7]._id, users[2]._id]
      },
      {
        fieldName: 'Maltepe Sahil Spor Kompleksi',
        location: 'Maltepe, İstanbul',
        date: '10.01.2026',
        time: '15:30',
        price: 50,
        organizer: users[6]._id,
        totalPlayers: 12,
        playersJoined: 1,
        level: 'Orta',
        image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=1474&auto=format&fit=crop',
        isPrivate: true,
        players: [users[6]._id]
      },
      {
        fieldName: 'Levent Futbol Center',
        location: 'Levent, İstanbul',
        date: '15.01.2026',
        time: '21:00',
        price: 65,
        organizer: users[7]._id,
        totalPlayers: 14,
        playersJoined: 7,
        level: 'Orta',
        image: 'https://images.unsplash.com/photo-1510051693265-dfb0e772337d?q=80&w=1470&auto=format&fit=crop',
        isPrivate: false,
        players: [users[7]._id, users[0]._id, users[4]._id, users[5]._id, users[6]._id, users[8]._id, users[9]._id]
      },
      {
        fieldName: 'Moda Spor Sahası',
        location: 'Moda, İstanbul',
        date: '21.01.2026',
        time: '18:30',
        price: 55,
        organizer: users[8]._id,
        totalPlayers: 10,
        playersJoined: 3,
        level: 'İleri',
        image: 'https://images.unsplash.com/photo-1536122985607-4fe00b283652?q=80&w=1474&auto=format&fit=crop',
        isPrivate: false,
        players: [users[8]._id, users[1]._id, users[3]._id]
      },
      {
        fieldName: 'Kartal Stadyum Tesisleri',
        location: 'Kartal, İstanbul',
        date: '25.01.2026',
        time: '17:30',
        price: 45,
        organizer: users[9]._id,
        totalPlayers: 12,
        playersJoined: 6,
        level: 'Amatör',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470&auto=format&fit=crop',
        isPrivate: false,
        players: [users[9]._id, users[0]._id, users[2]._id, users[4]._id, users[5]._id, users[7]._id]
      }
    ];
    
    const createdMatches = await Match.create(matchData);
    console.log(`${createdMatches.length} maç eklendi`);

    // Örnek gönderiler ekle
    const createdPosts = await Post.create([
      {
        content: 'Bugün harika bir antrenman yaptık!',
        author: users[0]._id,
        user: users[0]._id,
        username: users[0].username,
        userAvatar: users[0].profilePicture
      },
      {
        content: 'Yeni kramponlarımı denedim, çok rahatlar',
        author: users[1]._id,
        user: users[1]._id,
        username: users[1].username,
        userAvatar: users[1].profilePicture
      },
      {
        content: 'Hafta sonu maçı için hazırlıklar tamam',
        author: users[2]._id,
        user: users[2]._id,
        username: users[2].username,
        userAvatar: users[2].profilePicture
      },
      {
        content: 'Galatasaray Futbol Akademisi\'nde harika bir oyun oldu. 5-3 kazandık!',
        author: users[3]._id,
        user: users[3]._id,
        username: users[3].username,
        userAvatar: users[3].profilePicture,
        image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop'
      },
      {
        content: 'Yarın Kadıköy\'de maç var. Katılmak isteyen?',
        author: users[4]._id,
        user: users[4]._id,
        username: users[4].username,
        userAvatar: users[4].profilePicture
      },
      {
        content: 'Yeni formamız geldi, çok güzel olmuş!',
        author: users[5]._id,
        user: users[5]._id,
        username: users[5].username,
        userAvatar: users[5].profilePicture,
        image: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?q=80&w=1470&auto=format&fit=crop'
      },
      {
        content: 'Son antrenman tekniklerimi uyguladım, sonuçlar harika!',
        author: users[6]._id,
        user: users[6]._id,
        username: users[6].username,
        userAvatar: users[6].profilePicture
      },
      {
        content: 'Antrenmanım süresince fitness salonunda çalıştım. Kondisyon çok önemli.',
        author: users[7]._id,
        user: users[7]._id,
        username: users[7].username,
        userAvatar: users[7].profilePicture,
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop'
      },
      {
        content: 'İzlediğim Barcelona maçından çok şey öğrendim. Tiki-taka harikaydı!',
        author: users[8]._id,
        user: users[8]._id,
        username: users[8].username,
        userAvatar: users[8].profilePicture
      },
      {
        content: 'Futbol topu koleksiyonum büyümeye devam ediyor. Yeni eklemelerim.',
        author: users[9]._id,
        user: users[9]._id,
        username: users[9].username,
        userAvatar: users[9].profilePicture,
        image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?q=80&w=1470&auto=format&fit=crop'
      },
      {
        content: 'Dün akşamki maçta harika bir gol attım! Köşeden ağlara...',
        author: users[0]._id,
        user: users[0]._id,
        username: users[0].username,
        userAvatar: users[0].profilePicture
      },
      {
        content: 'Haftalık halı saha maçımızı dün yaptık. Çekişmeli bir mücadeleydi!',
        author: users[1]._id,
        user: users[1]._id,
        username: users[1].username,
        userAvatar: users[1].profilePicture,
        image: 'https://images.unsplash.com/photo-1577849304893-c33978a71975?q=80&w=1470&auto=format&fit=crop'
      },
      {
        content: 'Yeni başlayanlar için şut çekme teknikleri. Yorumlarda paylaşabilirsiniz.',
        author: users[2]._id,
        user: users[2]._id,
        username: users[2].username,
        userAvatar: users[2].profilePicture
      },
      {
        content: 'Taktiksel analiz: Modern futbolda savunma hatları nasıl kurulmalı?',
        author: users[3]._id,
        user: users[3]._id,
        username: users[3].username,
        userAvatar: users[3].profilePicture
          },
          {
        content: 'Beslenme düzenim ve futbolcu olarak performansıma etkileri hakkında düşüncelerim...',
        author: users[4]._id,
        user: users[4]._id,
        username: users[4].username,
        userAvatar: users[4].profilePicture
      }
    ]);
    
    console.log(`${createdPosts.length} gönderi eklendi`);

    // Örnek videolar ekle
    const createdVideos = await Video.create([
      {
        title: 'Gol Antrenmani',
        description: 'Şut ve gol çalışması',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-dribbling-a-ball-in-a-stadium-42520-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1565116150218-321b5dca7fb7?q=80&w=1470&auto=format&fit=crop',
        user: users[0]._id,
        username: users[0].username,
        filename: 'soccer-player-dribbling-a-ball.mp4',
        contentType: 'video/mp4'
      },
      {
        title: 'Maç Özeti',
        description: 'Geçen haftaki maçın özeti',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-scoring-a-goal-42524-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
        user: users[1]._id,
        username: users[1].username,
        filename: 'soccer-player-scoring-a-goal.mp4',
        contentType: 'video/mp4'
      },
      {
        title: 'Şut Teknikleri',
        description: 'Farklı şut teknikleri ve uygulaması',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-doing-a-bicycle-kick-42525-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
        user: users[2]._id,
        username: users[2].username,
        filename: 'soccer-player-bicycle-kick.mp4',
        contentType: 'video/mp4'
      },
      {
        title: 'Kaleci Antrenmanı',
        description: 'Kaleciler için temel savunma hareketleri',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-doing-a-bicycle-kick-42525-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1542852869-ecc293ff89c0?q=80&w=1470&auto=format&fit=crop',
        user: users[3]._id,
        username: users[3].username,
        filename: 'goalkeeper-training.mp4',
        contentType: 'video/mp4'
      },
      {
        title: 'Pas Çalışması',
        description: 'Takım arkadaşlarımla pas çalışması',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-dribbling-a-ball-in-a-stadium-42520-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1555069410-a10268d6ffab?q=80&w=1470&auto=format&fit=crop',
        user: users[4]._id,
        username: users[4].username,
        filename: 'passing-practice.mp4',
        contentType: 'video/mp4'
      },
      {
        title: 'Penaltı Atış Teknikleri',
        description: 'Farklı penaltı atış stillerini uygulama',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-scoring-a-goal-42524-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1605979308412-eca24a6fba77?q=80&w=1470&auto=format&fit=crop',
        user: users[5]._id,
        username: users[5].username,
        filename: 'penalty-kicks.mp4',
        contentType: 'video/mp4'
      },
      {
        title: 'Köşe Vuruşu Taktikleri',
        description: 'Etkili köşe vuruşu organizasyonları',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-doing-a-bicycle-kick-42525-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1470&auto=format&fit=crop',
        user: users[6]._id,
        username: users[6].username,
        filename: 'corner-kicks.mp4',
        contentType: 'video/mp4'
      },
      {
        title: 'Fitness Rutini',
        description: 'Futbolcular için günlük fitness rutini',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-dribbling-a-ball-in-a-stadium-42520-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop',
        user: users[7]._id,
        username: users[7].username,
        filename: 'fitness-routine.mp4',
        contentType: 'video/mp4'
      }
    ]);
    
    console.log(`${createdVideos.length} video eklendi`);

    console.log('Veritabanı başarıyla dolduruldu!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Veritabanı doldurma hatası:', error);
    mongoose.connection.close();
  }
}