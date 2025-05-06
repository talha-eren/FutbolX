const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const router = express.Router();

// Uploads klasörü oluştur
const uploadsDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Video uploads klasörü oluşturuldu');
}

// Dosya sistemi için storage ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Dosya adını temizle ve benzersiz yap
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname) || '.mp4';
    cb(null, uniqueSuffix + extension);
  }
});

// Multer ayarları
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    console.log('Video yükleme isteği alındı:', file.originalname);
    console.log('Kullanıcı bilgisi:', req.user);
    console.log('Dosya tipi:', file.mimetype);
    
    // Sadece video dosyalarına izin ver
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece video dosyaları yüklenebilir'), false);
    }
  }
});

// Multer hata yakalama middleware'i
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer hatası
    console.error('Multer hatası:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya boyutu çok büyük. Maksimum 100MB yüklenebilir.' });
    }
    return res.status(400).json({ message: `Dosya yükleme hatası: ${err.message}` });
  } else if (err) {
    // Diğer hatalar
    console.error('Video yükleme hatası:', err);
    return res.status(500).json({ message: `Video yüklenemedi: ${err.message}` });
  }
  next();
};

// Video upload endpoint
router.post('/upload', auth, (req, res, next) => {
  console.log('Video yükleme isteği alındı');
  console.log('Authorization header:', req.headers.authorization);
  console.log('Content-Type:', req.headers['content-type']);
  next();
}, upload.single('video'), handleMulterError, async (req, res) => {
  try {
    console.log('Video dosyası yüklendi, meta bilgileri kaydediliyor...');
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      console.error('Dosya bulunamadı');
      return res.status(400).json({ message: 'Video dosyası gerekli.' });
    }
    
    console.log('Yüklenen dosya bilgileri:', {
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    });

    // Video URL'sini oluştur
    const videoUrl = `/uploads/videos/${file.filename}`;

    // Video meta bilgisini kaydet
    const video = new Video({
      filename: file.filename,
      contentType: file.mimetype,
      length: file.size,
      uploadDate: new Date(),
      user: req.user.id,
      title: title || 'Untitled',
      description: description || '',
      url: videoUrl
    });
    
    await video.save();
    console.log('Video meta bilgileri başarıyla kaydedildi');
    res.status(201).json({ message: 'Video yüklendi.', video });
  } catch (err) {
    console.error('Video meta bilgisi kaydedilemedi:', err);
    res.status(500).json({ message: 'Video yüklenemedi.', error: err.message });
  }
});

// Video listeleme endpointi
router.get('/', async (req, res) => {
  try {
    console.log('Video listeleme isteği alındı');
    console.log('İstek başlıkları:', req.headers);
    
    // CORS başlıklarını ayarla
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    const videos = await Video.find().populate('user', 'username email');
    console.log(`${videos.length} video bulundu`);
    console.log('Videolar:', JSON.stringify(videos, null, 2));
    res.json(videos);
  } catch (err) {
    console.error('Videolar alınamadı:', err);
    res.status(500).json({ message: 'Videolar alınamadı.', error: err.message });
  }
});

// Belirli bir video endpoint'i
router.get('/:id', async (req, res) => {
  try {
    console.log(`Video detay isteği alındı: ${req.params.id}`);
    const video = await Video.findById(req.params.id).populate('user', 'username email');
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı.' });
    }
    // Görüntülenme sayısını artır
    video.views = (video.views || 0) + 1;
    await video.save();
    res.json(video);
  } catch (err) {
    console.error('Video detayı alınamadı:', err);
    res.status(500).json({ message: 'Video detayı alınamadı.', error: err.message });
  }
});

// Video silme endpointi (sadece sahibi silebilir)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`Video silme isteği alındı: ${req.params.id}`);
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      console.log('Video bulunamadı');
      return res.status(404).json({ message: 'Video bulunamadı.' });
    }
    
    if (video.user.toString() !== req.user.id) {
      console.log('Yetkilendirme hatası: Kullanıcı kendi olmayan videoyu silmeye çalışıyor');
      return res.status(403).json({ message: 'Sadece kendi videonu silebilirsin.' });
    }
    
    // Dosya sisteminden videoyu sil
    const filePath = path.join(uploadsDir, video.filename);
    console.log(`Dosya siliniyor: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Video dosyası silindi');
    } else {
      console.log('Video dosyası bulunamadı, sadece veritabanı kaydı silinecek');
    }
    
    // Veritabanından video kaydını sil
    await Video.deleteOne({ _id: req.params.id });
    console.log('Video veritabanından silindi');
    
    res.json({ message: 'Video silindi.' });
  } catch (err) {
    console.error('Video silinemedi:', err);
    res.status(500).json({ message: 'Video silinemedi.', error: err.message });
  }
});

// Video beğenme endpointi
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video bulunamadı.' });
    if (video.likes.includes(req.user.id)) {
      // Zaten beğenmişse kaldırsın (toggle)
      video.likes.pull(req.user.id);
    } else {
      video.likes.push(req.user.id);
    }
    await video.save();
    res.json({ message: 'Beğeni güncellendi.', likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Beğeni güncellenemedi.', error: err.message });
  }
});

// Video yorumu ekleme endpointi
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Yorum metni gerekli.' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video bulunamadı.' });
    video.comments.push({ user: req.user.id, text });
    await video.save();
    res.json({ message: 'Yorum eklendi.', comments: video.comments });
  } catch (err) {
    res.status(500).json({ message: 'Yorum eklenemedi.', error: err.message });
  }
});

// Video indirme endpointi
router.get('/download/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'videos' });
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', () => res.status(404).json({ message: 'Video bulunamadı.' }));
    res.set('Content-Type', 'video/mp4');
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Video indirilemedi.', error: err.message });
  }
});

module.exports = router;
