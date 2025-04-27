const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dosya yüklemeleri için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/posts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Hata: Sadece resim ve video dosyaları yüklenebilir!');
    }
  }
});

// Tüm gönderileri getir
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Gönderi getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ID'ye göre gönderi getir
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    res.json(post);
  } catch (error) {
    console.error('Gönderi detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni gönderi ekle
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const newPost = new Post({
      user: req.user.id,
      username: user.username,
      userImage: user.profilePicture,
      content: req.body.content
    });

    // Eğer medya yüklendiyse
    if (req.file) {
      const isVideo = /mp4|mov|avi/.test(path.extname(req.file.filename).toLowerCase());
      
      if (isVideo) {
        newPost.video = `/uploads/posts/${req.file.filename}`;
      } else {
        newPost.image = `/uploads/posts/${req.file.filename}`;
      }
    }

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Gönderi ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gönderiyi beğen
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    post.likes += 1;
    await post.save();
    
    res.json({ message: 'Gönderi beğenildi', likes: post.likes });
  } catch (error) {
    console.error('Gönderi beğenme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gönderiyi sil (sadece gönderiyi oluşturan kullanıcı)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    // Sadece gönderiyi oluşturan kullanıcı silebilir
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Eğer gönderi bir resim veya video içeriyorsa, dosyayı da sil
    if (post.image) {
      const imagePath = path.join(__dirname, '..', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    if (post.video) {
      const videoPath = path.join(__dirname, '..', post.video);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gönderi başarıyla silindi' });
  } catch (error) {
    console.error('Gönderi silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
