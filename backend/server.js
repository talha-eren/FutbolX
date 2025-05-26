// .env dosyasını yükle - en üste olmalı
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('Server başlatılıyor...');

// Modelleri içe aktar
const Post = require('./models/Post');
const Player = require('./models/Player');
const Venue = require('./models/Venue');

// Rotaları içe aktar
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const matchRoutes = require('./routes/matchRoutes');
const playerRoutes = require('./routes/playerRoutes');
const venueRoutes = require('./routes/venueRoutes');
const teamRoutes = require('./routes/teamRoutes');
const { protect } = require('./middleware/authMiddleware');

console.log('Modüller yüklendi');

// .env dosyası zaten en üstte yüklendi

const app = express();

// Uploads dizinini oluştur (yoksa)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads klasörü oluşturuldu');
}

// Middleware
// CORS ayarları - tüm kaynaklardan gelen isteklere izin ver
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Video yüklemeleri için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB bağlantısı
// .env dosyasından MongoDB URI'yi çek
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://talhaeren:talhaeren@cluster0.86ovh.mongodb.net/futbolx?retryWrites=true&w=majority&appName=Cluster0';
console.log('MongoDB URI:', mongoURI);

// MongoDB URI'nin doğru şekilde yüklenip yüklenmediğini kontrol et
if (!mongoURI) {
  console.error('.env dosyasından MONGODB_URI yüklenemedi!');
  process.exit(1); // Hata durumunda uygulamayı sonlandır
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    
    // Index'leri kontrol et ve düzelt
    fixReservationIndexes();
    
    // Veritabanı durumunu logla
    checkDatabaseStatus();
    
    // Örnek verileri ekle
    initSampleData();
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
  });

// Reservation koleksiyonundaki index'leri düzelt
const fixReservationIndexes = async () => {
  try {
    const Reservation = require('./models/Reservation');
    const collection = Reservation.collection;
    
    console.log('Reservation indexleri kontrol ediliyor...');
    
    // Mevcut indexleri listele
    const indexes = await collection.indexes();
    console.log('Mevcut indexler:', indexes);
    
    // Tüm indexleri kontrol et
    const problematicIndexNames = [
      'field_1_date_1_startTime_1_endTime_1',
      'venue_1_date_1_startTime_1_endTime_1'
    ];
    
    for (const index of indexes) {
      if (problematicIndexNames.includes(index.name)) {
        console.log(`Sorunlu index bulundu: ${index.name}, kaldırılıyor...`);
        try {
          await collection.dropIndex(index.name);
          console.log(`Index '${index.name}' başarıyla kaldırıldı`);
        } catch (dropError) {
          console.error(`Index '${index.name}' kaldırılırken hata:`, dropError);
        }
      }
    }
    
    // Yeni, doğru bir unique index oluştur
    console.log('Yeni index oluşturuluyor...');
    try {
      await collection.createIndex(
        { venue: 1, date: 1, startTime: 1, endTime: 1, field: 1 },
        { unique: true, name: 'unique_reservation_time_slot_field' }
      );
      console.log('Yeni index başarıyla oluşturuldu');
    } catch (createError) {
      console.error('Yeni index oluşturulurken hata:', createError);
    }
    
  } catch (error) {
    console.error('Index düzeltme hatası:', error);
  }
};

// Veritabanı durumunu kontrol et ve logla
const checkDatabaseStatus = async () => {
  try {
    const User = require('./models/User');
    const Team = require('./models/Team');
    
    const userCount = await User.countDocuments();
    const teamCount = await Team.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    console.log('=== Veritabanı Durumu ===');
    console.log(`Toplam Kullanıcı Sayısı: ${userCount}`);
    console.log(`Admin Kullanıcı Sayısı: ${adminCount}`);
    console.log(`Toplam Takım Sayısı: ${teamCount}`);
    
    if (teamCount > 0) {
      const teams = await Team.find().sort({ createdAt: -1 });
      console.log('Mevcut Takımlar:');
      teams.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name} (${team.isApproved ? 'Onaylı' : 'Onay Bekliyor'})`);
      });
    }
    
    console.log('=======================');
  } catch (error) {
    console.error('Veritabanı durum kontrolü sırasında hata:', error);
  }
};

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/posts', upload.single('video'), async (req, res) => {
  try {
    const post = new Post({
      username: req.body.username,
      videoUrl: `/uploads/${req.file.filename}`,
      description: req.body.description
    });
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.likes += 1;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({
      username: req.body.username,
      text: req.body.text
    });
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Auth rotalarını kullan
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Test endpoint - backend'in çalışıp çalışmadığını kontrol etmek için
app.get('/api/test', (req, res) => {
  console.log('Test endpoint çağrıldı');
  res.json({ 
    message: 'Backend çalışıyor!', 
    timestamp: new Date().toISOString(),
    routes: {
      teams: '/api/teams',
      matches: '/api/matches',
      venues: '/api/venues'
    }
  });
});

// Debug endpoint - route'ların yüklenip yüklenmediğini kontrol et
app.get('/api/debug/routes', (req, res) => {
  console.log('Debug routes endpoint çağrıldı');
  
  // Express app'in route'larını listele
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    message: 'Route debug bilgileri',
    totalRoutes: routes.length,
    routes: routes,
    teamRoutesLoaded: typeof teamRoutes !== 'undefined',
    venueRoutesLoaded: typeof venueRoutes !== 'undefined'
  });
});

// Rezervasyon rotalarını kullan - ÖNEMLİ: Bu rotaları doğru şekilde tanımla
app.use('/api/reservations', reservationRoutes);

// Maç rotalarını kullan
app.use('/api/matches', matchRoutes);

// Oyuncu rotalarını kullan
app.use('/api/players', playerRoutes);

// Halı saha rotalarını kullan
app.use('/api/venues', venueRoutes);

// Takım rotalarını kullan
app.use('/api/teams', teamRoutes);

// Oyuncu ve Halı Saha rotaları (fallback - sadece route'lar tanımlanmamışsa)
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find().limit(10);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const player = new Player({
      ...req.body
    });
    const savedPlayer = await player.save();
    res.status(201).json(savedPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Static dosyaları servis et
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Uploads klasörüne statik erişim sağla
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Örnek video dosya yollarını düzelt
const videoFiles = fs.readdirSync(path.join(__dirname, 'public/uploads/videos'));
if (videoFiles && videoFiles.length > 0) {
  console.log('Mevcut video dosyaları:', videoFiles);
} else {
  console.log('Video dosyası bulunamadı.');
}

// Public uploads klasörlerini kontrol et ve yoksa oluştur
const videosDir = path.join(__dirname, 'public/uploads/videos');
const imagesDir = path.join(__dirname, 'public/uploads/images');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log('Videos klasörü oluşturuldu');
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Images klasörü oluşturuldu');
}

// Örnek veriler
const samplePlayers = [
  { name: 'Mehmet Yılmaz', position: 'Forvet', rating: 4.8, matches: 24, goals: 18, assists: 7, image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Ali Kaya', position: 'Orta Saha', rating: 4.5, matches: 30, goals: 12, assists: 15, image: 'https://randomuser.me/api/portraits/men/55.jpg' },
  { name: 'Ahmet Demir', position: 'Defans', rating: 4.7, matches: 28, goals: 3, assists: 2, image: 'https://randomuser.me/api/portraits/men/68.jpg' },
  { name: 'Burak Şahin', position: 'Kaleci', rating: 4.9, matches: 22, goals: 0, assists: 0, image: 'https://randomuser.me/api/portraits/men/41.jpg' },
];

const sampleVenues = [
  { name: 'Yeşil Vadi Halı Saha', location: 'Kadıköy, İstanbul', rating: 4.6, price: '250 TL/saat', image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', contact: '0216 123 45 67', description: 'Modern tesislerle donatılmış profesyonel halı saha', amenities: ['Duş', 'Otopark', 'Kafeterya'], workingHours: '09:00-23:00' },
  { name: 'Gol Stadyumu', location: 'Beşiktaş, İstanbul', rating: 4.8, price: '300 TL/saat', image: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', contact: '0212 234 56 78', description: 'FIFA standartlarında profesyonel saha', amenities: ['Duş', 'Otopark', 'Soyunma Odası', 'Wi-Fi'], workingHours: '08:00-24:00' },
  { name: 'Futbol Arena', location: 'Şişli, İstanbul', rating: 4.5, price: '280 TL/saat', image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', contact: '0212 345 67 89', description: 'Kapalı ve açık saha seçenekleri', amenities: ['Duş', 'Kafeterya', 'Kondisyon Salonu'], workingHours: '10:00-22:00' },
  { name: 'Yıldız Sahası', location: 'Ümraniye, İstanbul', rating: 4.4, price: '220 TL/saat', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', contact: '0216 456 78 90', description: 'Uygun fiyatlı ve kaliteli saha', amenities: ['Otopark', 'Kafeterya'], workingHours: '09:00-23:00' },
];

// Başlangıçta örnek verilerin kontrolü ve eklenmesi
const initSampleData = async () => {
  try {
    // Oyuncu verilerini kontrol et ve ekle
    const playersCount = await Player.countDocuments();
    if (playersCount === 0) {
      console.log('Örnek oyuncu verileri ekleniyor...');
      await Player.insertMany(samplePlayers);
      console.log(`${samplePlayers.length} oyuncu kaydı eklendi.`);
    }
    
    // Halı saha verilerini kontrol et ve ekle
    const venuesCount = await Venue.countDocuments();
    if (venuesCount === 0) {
      console.log('Örnek halı saha verileri ekleniyor...');
      await Venue.insertMany(sampleVenues);
      console.log(`${sampleVenues.length} halı saha kaydı eklendi.`);
    }

    // Örnek takım ekle
    const Team = require('./models/Team');
    const User = require('./models/User');
    
    // Admin kullanıcısını bul (User modelinden)
    const adminUser = await User.findOne({ username: 'talhaeren' });
    
    if (adminUser) {
      console.log('Admin kullanıcısı bulundu:', adminUser.username);
      
      // Örnek takımlar var mı kontrol et
      const teamCount = await Team.countDocuments();
      
      if (teamCount === 0) {
        console.log('Örnek takımlar ekleniyor...');
        
        const sampleTeams = [
          {
            name: 'Şimşekler',
            level: 'İyi',
            neededPlayers: 2,
            preferredTime: '20:00',
            contactNumber: '05551234567',
            description: 'Sporyum 23\'ün yıldız takımı, hızlı hücum oyunuyla rakiplerini açık ara geçiyor.',
            regularPlayDays: ['Salı', 'Perşembe'],
            location: {
              city: 'İstanbul',
              district: 'Kadıköy'
            },
            isApproved: true,
            stats: {
              attack: 92,
              defense: 85,
              speed: 90,
              teamwork: 94
            },
            createdBy: adminUser._id,
            players: [{
              player: adminUser._id,
              isAdmin: true
            }]
          },
          {
            name: 'Aslanlar SK',
            level: 'Pro',
            neededPlayers: 0,
            preferredTime: '19:00',
            contactNumber: '05551234568',
            description: 'Disiplinli defans anlayışı ve kontra atak oyunuyla tanınan tecrübeli ekip.',
            regularPlayDays: ['Pazartesi', 'Çarşamba'],
            location: {
              city: 'İstanbul',
              district: 'Üsküdar'
            },
            isApproved: true,
            stats: {
              attack: 88,
              defense: 92,
              speed: 82,
              teamwork: 90
            },
            createdBy: adminUser._id,
            players: [{
              player: adminUser._id,
              isAdmin: true
            }]
          }
        ];
        
        await Team.insertMany(sampleTeams);
        console.log('Örnek takımlar başarıyla eklendi');
      } else {
        console.log(`Veritabanında zaten ${teamCount} takım bulunuyor, örnek takımlar eklenmedi.`);
      }
    } else {
      console.log('Admin kullanıcısı bulunamadı, örnek takımlar eklenemiyor.');
      
      // Admin kullanıcısını oluştur
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@futbolx.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      
      try {
        const savedAdmin = await newAdmin.save();
        console.log('Yeni admin kullanıcısı oluşturuldu:', savedAdmin.username);
        
        // Yeni admin kullanıcısı ile örnek takımlar oluştur
        const sampleTeams = [
          {
            name: 'Şimşekler',
            level: 'İyi',
            neededPlayers: 2,
            preferredTime: '20:00',
            contactNumber: '05551234567',
            description: 'Sporyum 23\'ün yıldız takımı, hızlı hücum oyunuyla rakiplerini açık ara geçiyor.',
            regularPlayDays: ['Salı', 'Perşembe'],
            location: {
              city: 'İstanbul',
              district: 'Kadıköy'
            },
            isApproved: true,
            stats: {
              attack: 92,
              defense: 85,
              speed: 90,
              teamwork: 94
            },
            createdBy: savedAdmin._id,
            players: [{
              player: savedAdmin._id,
              isAdmin: true
            }]
          }
        ];
        
        await Team.insertMany(sampleTeams);
        console.log('Yeni admin ile örnek takımlar başarıyla eklendi');
      } catch (error) {
        console.error('Admin kullanıcısı oluşturulurken hata:', error.message);
      }
    }
  } catch (error) {
    console.error('Örnek veri ekleme hatası:', error);
  }
};

// Sunucuyu başlat
const PORT = process.env.PORT || 5000; // 5000 portunu kullan
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log('API endpoint\'leri:');
  console.log('- GET /api/reservations/available-slots');
  console.log('- GET /api/reservations/venue/sporyum23');
  console.log('- POST /api/reservations');
});

// Hata yakalama middleware
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  
  // MongoDB ValidationError için özel mesaj
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ 
      message: 'Doğrulama hatası', 
      details: validationErrors 
    });
  }
  
  // Genel hata yanıtı
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Sunucu hatası',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});
