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
    // Populate ile kullanıcı bilgilerini de getir
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username name profilePicture');
    
    // Kullanıcı bilgilerini ve içeriği içeren tam yanıt
    const enhancedPosts = posts.map(post => {
      return {
        _id: post._id,
        content: post.content,
        image: post.image,
        video: post.video,
        createdAt: post.createdAt,
        timestamp: post.createdAt, // timestamp alanını ekle
        username: post.author ? post.author.username : 'Bilinmeyen Kullanıcı',
        userImage: post.author ? post.author.profilePicture : '',
        user: post.author,
        likes: post.likes || 0
      };
    });
    
    res.json(enhancedPosts);
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
    console.log('Gönderi isteği alındı:', {
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'Medya dosyası yok'
    });
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Yeni gönderi oluştur
    const newPost = new Post({
      author: req.user.id,
      user: req.user.id,
      username: user.username,
      userImage: user.profilePicture || '',
      content: req.body.content,
      contentType: req.body.contentType || 'text'
    });

    // Medya dosyası yüklendiyse
    if (req.file) {
      // Mimetype'a göre video mu image mi kontrol et
      const isVideo = req.file.mimetype.includes('video') || 
                       /mp4|mov|avi/i.test(path.extname(req.file.filename));
      
      if (isVideo) {
        newPost.video = `/uploads/posts/${req.file.filename}`;
        newPost.contentType = 'video';
      } else {
        newPost.image = `/uploads/posts/${req.file.filename}`;
        newPost.contentType = 'image';
      }
      
      console.log('Medya türü:', isVideo ? 'Video' : 'Image');
      console.log('Medya dosya yolu:', isVideo ? newPost.video : newPost.image);
    }

    const savedPost = await newPost.save();
    
    // Gönderi nesnesini hazırla
    const enhancedPost = {
      ...savedPost.toObject(),
      user: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture || ''
      }
    };
    
    console.log('Gönderi kaydedildi:', {
      id: savedPost._id,
      contentType: savedPost.contentType,
      hasImage: !!savedPost.image,
      hasVideo: !!savedPost.video
    });
    
    res.status(201).json(enhancedPost);
  } catch (error) {
    console.error('Gönderi ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
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
