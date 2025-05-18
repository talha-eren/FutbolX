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

// Rotaları içe aktar
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const { protect } = require('./middleware/authMiddleware');

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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
const mongoURI = process.env.MONGODB_URI;

// MongoDB URI'nin doğru şekilde yüklenip yüklenmediğini kontrol et
if (!mongoURI) {
  console.error('.env dosyasından MONGODB_URI yüklenemedi!');
  process.exit(1); // Hata durumunda uygulamayı sonlandır
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    initSampleData(); // Örnek verileri ekle
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
  });

// Post modeli
const postSchema = new mongoose.Schema({
  username: String,
  videoUrl: String,
  description: String,
  likes: { type: Number, default: 0 },
  comments: [{ 
    username: String, 
    text: String, 
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Futbolcu modeli
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  rating: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  image: { type: String, default: 'default-player.jpg' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Player = mongoose.model('Player', playerSchema);

// Halı Saha modeli
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  price: { type: String, required: true },
  image: { type: String, default: 'default-venue.jpg' },
  contact: { type: String },
  description: { type: String },
  amenities: [String],
  workingHours: { type: String }
});

const Venue = mongoose.model('Venue', venueSchema);

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

// Oyuncu ve Halı Saha rotaları
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

app.get('/api/venues', async (req, res) => {
  try {
    const venues = await Venue.find().limit(10);
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/venues', async (req, res) => {
  try {
    const venue = new Venue(req.body);
    const savedVenue = await venue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Auth rotalarını kullan
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

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
  } catch (err) {
    console.error('Örnek veri eklenirken hata oluştu:', err);
  }
};

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
