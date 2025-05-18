const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Video yükleme için klasörü oluştur
const videoUploadDir = path.join(__dirname, '../public/uploads/videos');
const imageUploadDir = path.join(__dirname, '../public/uploads/images');

// Yükleme klasörlerini oluştur
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// Multer storage ayarları
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const postType = req.body.post_type || 'video';
    
    if (postType === 'image') {
      cb(null, imageUploadDir);
    } else {
    cb(null, videoUploadDir);
    }
  },
  filename: function(req, file, cb) {
    // Dosya adını benzersiz yap
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Dosya filtreleme (video ve görsel dosyalarını kabul et)
const fileFilter = (req, file, cb) => {
  const postType = req.body.post_type || 'video';
  
  if (postType === 'video') {
  // Kabul edilen video formatları
  const allowedTypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
  
  // Dosya türünü kontrol et
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
      return cb(new Error('Sadece video dosyaları yüklenebilir!'));
  }
  } else if (postType === 'image') {
    // Kabul edilen görsel formatları
    const allowedTypes = /jpeg|jpg|png|gif|webp/;

    // Dosya türünü kontrol et
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image/.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Sadece görsel dosyaları (JPEG, PNG, GIF, WEBP) yüklenebilir!'));
    }
  } else {
    // Text içerik için dosya gerekmez
    return cb(null, true);
  }
};

// Upload ayarlarını yapılandır - daha esnek olması için any() kullanıyoruz
const postUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
}).any();

// Post yükleme rotası
router.post('/upload', protect, (req, res, next) => {
  postUpload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer dosya yükleme hatası
      return res.status(400).json({ 
        message: `Dosya yükleme hatası: ${err.message}` 
      });
    } else if (err) {
      // Diğer hatalar
      return res.status(400).json({ 
        message: `Dosya yükleme hatası: ${err.message}` 
      });
    }
    // Her şey yolunda
    next();
  });
}, videoController.uploadVideo);

// Tüm videoları getir
router.get('/', videoController.getAllVideos);

// Belirli bir videoyu getir
router.get('/:id', videoController.getVideoById);

// Videoyu güncelle
router.put('/:id', protect, videoController.updateVideo);

// Videoyu sil
router.delete('/:id', protect, videoController.deleteVideo);

// Videoya yorum ekle
router.post('/:id/comment', protect, videoController.addComment);

// Videoya beğeni ekle/kaldır
router.post('/:id/like', protect, videoController.toggleLike);

// Videoya görüntülenme ekle
router.post('/:id/view', videoController.incrementViews);

// Kullanıcının kendi videolarını getir
router.get('/user/my-videos', protect, videoController.getMyVideos);

// Öne çıkan videoları getir
router.get('/featured', videoController.getFeaturedVideos);

// Kategoriye göre video getir
router.get('/category/:category', videoController.getVideosByCategory);

// Etiketlere göre video ara
router.get('/tags/:tag', videoController.searchVideosByTags);

module.exports = router;
