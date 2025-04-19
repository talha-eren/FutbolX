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

// Static dosyaları servis et
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Uploads klasörüne statik erişim sağla
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
