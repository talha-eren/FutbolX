// Çevre değişkenlerini yükle
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
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const videoRoutes = require('./routes/video');

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

// Dosya yüklemeleri için multer konfigürasyonu
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

// API rotaları
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);

// Basit bir test endpoint'i
app.get('/api/test', (req, res) => {
  res.json({ message: 'FutbolX API çalışıyor!' });
});

// Statik dosyaları servis et
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Veritabanı içeriğini görüntüleme endpoint'i
app.get('/api/db-info', async (req, res) => {
  try {
    // Tüm koleksiyonları listele
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Her koleksiyondaki ilk 5 belgeyi getir
    const dbContent = {};
    
    for (const collName of collectionNames) {
      const documents = await mongoose.connection.db.collection(collName).find({}).limit(5).toArray();
      dbContent[collName] = documents;
    }
    
    res.json({
      status: 'success',
      message: 'Veritabanı bağlantısı başarılı',
      databaseName: mongoose.connection.db.databaseName,
      collections: collectionNames,
      sampleData: dbContent
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Veritabanı bilgileri alınamadı',
      error: error.message
    });
  }
});

// Fields koleksiyonunu görüntüleme endpoint'i
app.get('/api/fields', async (req, res) => {
  try {
    // Fields koleksiyonundaki tüm belgeleri getir
    const fieldsCollection = mongoose.connection.db.collection('fields');
    const fields = await fieldsCollection.find({}).toArray();
    
    res.json({
      status: 'success',
      count: fields.length,
      fields: fields
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Fields koleksiyonu bilgileri alınamadı',
      error: error.message
    });
  }
});

// Port ayarı
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
