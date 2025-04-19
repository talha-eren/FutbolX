const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Video yükleme için klasörü oluştur
const videoUploadDir = path.join(__dirname, '../public/uploads/videos');
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

// Multer storage ayarları
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, videoUploadDir);
  },
  filename: function(req, file, cb) {
    // Dosya adını benzersiz yap
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Dosya filtreleme (sadece video dosyalarını kabul et)
const fileFilter = (req, file, cb) => {
  // Kabul edilen video formatları
  const allowedTypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
  
  // Dosya türünü kontrol et
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece video dosyaları yüklenebilir!'));
  }
};

// Multer upload ayarları
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Video yükleme rotası
router.post('/upload', protect, upload.single('video'), videoController.uploadVideo);

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

// Kullanıcının kendi videolarını getir
router.get('/user/my-videos', protect, videoController.getMyVideos);

// Kategoriye göre video getir
router.get('/category/:category', videoController.getVideosByCategory);

// Etiketlere göre video ara
router.get('/tags/:tag', videoController.searchVideosByTags);

module.exports = router;
