// Çevre değişkenlerini yükle
require('dotenv').config();

// JWT Secret'i ayarla (yalnızca eğer tanımlanmamışsa)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'futbolxapikey123';

// Çevre değişkenlerini kontrol et
if (!process.env.MONGODB_URI) {
  console.error('HATA: MONGODB_URI çevre değişkeni tanımlanmamış!');
  console.error('Lütfen .env dosyasını oluşturun ve MONGODB_URI değişkenini tanımlayın.');
  process.exit(1); // Hata kodu ile çık
}

// Diğer çevre değişkenleri için varsayılan değerler
process.env.PORT = process.env.PORT || 5000;

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
const teamRoutes = require('./routes/team');
const venueRoutes = require('./routes/venue');

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token', 
    'x-token', 
    'Accept', 
    'X-Requested-With'
  ],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Authorization', 'x-auth-token']
}));

// OPTIONS isteklerini ön işlemden geçir
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token, x-token');
  
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
const mongoURI = process.env.MONGODB_URI;

// MongoDB URI'nin doğru şekilde yüklenip yüklenmediğini kontrol et
// (Bu kontrol daha önce yapıldı, ancak güvenlik için burada da bırakıyoruz)
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
app.use('/api/teams', teamRoutes);
app.use('/api/venues', venueRoutes);

// Basit bir test endpoint'i
app.get('/api/test', (req, res) => {
  res.json({ message: 'FutbolX API çalışıyor!' });
});

// Statik dosyaları servis et - tüm yollar için
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// API yolunu /api olarak ayarla
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/public', express.static(path.join(__dirname, 'public')));

// Video dosyaları için özel static serving
app.use('/public/uploads/videos', express.static(path.join(__dirname, 'public/uploads/videos'), {
  setHeaders: (res, path) => {
    // Video dosyaları için uygun MIME type'ları ayarla
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.mov') || path.endsWith('.MOV')) {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (path.endsWith('.avi')) {
      res.setHeader('Content-Type', 'video/x-msvideo');
    } else if (path.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    }
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Resim dosyaları için özel route
app.get('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Önce uploads klasöründe kontrol et
  let filePath = path.join(__dirname, 'uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    // Eğer uploads klasöründe yoksa, public/uploads/images klasöründe ara
    filePath = path.join(__dirname, 'public/uploads/images', filename);
  }
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Dosya bulunamadı' });
  }
});

// Video dosyalarını servis et - geliştirilmiş versiyon
app.get('/public/uploads/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/uploads/videos', filename);
  
  console.log(`📹 Video dosyası isteği: ${filename}`);
  console.log(`📁 Dosya yolu: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ Video dosyası bulundu: ${filePath}`);
    
    // Dosya boyutunu al
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // CORS başlıklarını ayarla
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.header('Accept-Ranges', 'bytes');
    
    // MIME type'ı ayarla
    if (filename.toLowerCase().endsWith('.mp4')) {
      res.header('Content-Type', 'video/mp4');
    } else if (filename.toLowerCase().endsWith('.mov')) {
      res.header('Content-Type', 'video/quicktime');
    } else if (filename.toLowerCase().endsWith('.avi')) {
      res.header('Content-Type', 'video/x-msvideo');
    } else if (filename.toLowerCase().endsWith('.webm')) {
      res.header('Content-Type', 'video/webm');
    } else {
      res.header('Content-Type', 'video/mp4'); // Default
    }
    
    if (range) {
      // Range request - video streaming için gerekli
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const file = fs.createReadStream(filePath, { start, end });
      
      res.status(206);
      res.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.header('Content-Length', chunksize.toString());
      
      file.pipe(res);
    } else {
      // Normal request
      res.header('Content-Length', fileSize.toString());
      const file = fs.createReadStream(filePath);
      file.pipe(res);
    }
  } else {
    console.log(`❌ Video dosyası bulunamadı: ${filePath}`);
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
