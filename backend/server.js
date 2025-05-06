// Çevre değişkenlerini yükle
require('dotenv').config();

// Çevre değişkenlerini manuel olarak ayarla (eğer .env dosyasından okunamazsa)
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://talhaeren:talhaeren@cluster0.86ovh.mongodb.net/futbolx?retryWrites=true&w=majority&appName=Cluster0';
process.env.PORT = process.env.PORT || 5000;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'futbolx-secret-key';

console.log('Çevre değişkenleri ayarlandı');
console.log(`PORT: ${process.env.PORT}`);
// Güvenlik için MongoDB URI'yi maskele
const maskedURI = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
console.log(`MongoDB URI: ${maskedURI}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Ayarlandı' : 'Ayarlanmadı'}`);


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
const fieldRoutes = require('./routes/field');
const eventRoutes = require('./routes/event');
const postRoutes = require('./routes/post');
const matchRoutes = require('./routes/match');
const commentRoutes = require('./routes/comment');
const reservationRoutes = require('./routes/reservation');

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

// OPTIONS isteklerini ön işlemden geçir
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // OPTIONS istekleri için hemen yanıt dön
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
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
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://bilikcitalha:talhaeren@cluster0.86ovh.mongodb.net/futbolx?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB URI'nin doğru şekilde yüklenip yüklenmediğini kontrol et
if (!mongoURI) {
  console.error('.env dosyasından MONGODB_URI yüklenemedi!');
  process.exit(1); // Hata kodu ile çık
}

console.log('MongoDB URI:', mongoURI.substring(0, 20) + '...');

// Veritabanına bağlan
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    
    // MongoDB bağlantı bilgilerini göster
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Veritabanı adı: ${dbName}`);
    
    // Veritabanı durumunu kontrol et
    mongoose.connection.db.admin().serverStatus()
      .then(info => {
        console.log('MongoDB sunucu durumu: OK');
        console.log(`MongoDB versiyonu: ${info.version}`);
      })
      .catch(err => {
        console.log('MongoDB sunucu durum kontrolü yapılamadı:', err.message);
      });
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1); // Hata kodu ile çık
  });

// Health check endpoint'i
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API rotaları
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reservations', reservationRoutes);

// Basit bir test endpoint'i
app.get('/api/test', (req, res) => {
  res.json({ message: 'FutbolX API çalışıyor!' });
});

// Statik dosyaları servis et - tüm yollar için
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Alternatif yol - /api/uploads için de aynı klasörü servis et
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Video dosyalarını servis et
app.get('/api/uploads/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads/videos', filename);
  
  console.log(`Video dosyası isteği: ${filename}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`Video dosyası bulundu: ${filePath}`);
    // Video dosyasını gönderirken CORS başlıklarını ayarla
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Content-Type', 'video/mp4');
    res.sendFile(filePath);
  } else {
    console.log(`Video dosyası bulunamadı: ${filePath}`);
    res.status(404).json({ message: 'Video bulunamadı' });
  }
});

// Doğrudan video dosyalarına erişim için alternatif yol
app.get('/uploads/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads/videos', filename);
  
  console.log(`Alternatif yoldan video dosyası isteği: ${filename}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`Video dosyası bulundu: ${filePath}`);
    // Video dosyasını gönderirken CORS başlıklarını ayarla
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Content-Type', 'video/mp4');
    res.sendFile(filePath);
  } else {
    console.log(`Video dosyası bulunamadı: ${filePath}`);
    res.status(404).json({ message: 'Video bulunamadı' });
  }
});

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
