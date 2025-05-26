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
    // Dosya türüne göre klasör belirle
    let uploadDir;
    if (file.mimetype.includes('image')) {
      uploadDir = path.join(__dirname, '../public/uploads/images');
    } else if (file.mimetype.includes('video')) {
      uploadDir = path.join(__dirname, '../public/uploads/videos');
    } else {
      uploadDir = path.join(__dirname, '../public/uploads/files');
    }
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Upload klasörü oluşturuldu: ${uploadDir}`);
    } else {
      console.log(`Upload klasörü mevcut: ${uploadDir}`);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Dosya adını benzersiz yap
    const fileExtension = path.extname(file.originalname);
    const uniqueName = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
    console.log(`Yeni dosya adı: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    console.log('Dosya kontrol ediliyor:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    // Desteklenen dosya uzantıları
    const allowedExtensions = /\.(jpeg|jpg|png|gif|mp4|mov|avi|webm|mkv)$/i;
    // Desteklenen MIME türleri
    const allowedMimeTypes = /^(image\/(jpeg|jpg|png|gif)|video\/(mp4|quicktime|x-msvideo|webm|x-matroska))$/i;
    
    const extname = allowedExtensions.test(file.originalname);
    const mimetype = allowedMimeTypes.test(file.mimetype);
    
    console.log('Dosya kontrol sonucu:', {
      extname,
      mimetype,
      originalMimetype: file.mimetype
    });
    
    if (extname || mimetype) {
      console.log('✅ Dosya kabul edildi');
      return cb(null, true);
    } else {
      console.log('❌ Dosya reddedildi');
      cb(new Error('Sadece resim (JPEG, PNG, GIF) ve video (MP4, MOV, AVI, WebM) dosyaları yüklenebilir!'));
    }
  }
});

// Tüm gönderileri getir
router.get('/', async (req, res) => {
  try {
    console.log('📡 Tüm gönderiler isteniyor...');
    
    // Populate ile kullanıcı bilgilerini de getir
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username name profilePicture');
    
    console.log(`📊 Veritabanından ${posts.length} gönderi bulundu`);
    
    // Kullanıcı bilgilerini ve içeriği içeren tam yanıt
    const enhancedPosts = posts.map(post => {
      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        category: post.category,
        tags: post.tags,
        isPublic: post.isPublic,
        content: post.content,
        image: post.image,
        video: post.video,
        createdAt: post.createdAt,
        timestamp: post.createdAt, // timestamp alanını ekle
        username: post.author ? post.author.username : 'Bilinmeyen Kullanıcı',
        userImage: post.author ? post.author.profilePicture : '',
        user: post.author ? {
          _id: post.author._id,
          username: post.author.username,
          profilePicture: post.author.profilePicture || ''
        } : null,
        likes: post.likes || 0,
        comments: post.comments || 0, // Yorum sayısını ekle
        post_type: post.post_type,
        contentType: post.contentType || post.post_type
      };
    });
    
    console.log(`✅ ${enhancedPosts.length} gönderi frontend'e gönderiliyor`);
    console.log('📝 İlk 3 gönderi örneği:', enhancedPosts.slice(0, 3).map(p => ({
      id: p._id,
      title: p.title,
      hasImage: !!p.image,
      hasVideo: !!p.video,
      username: p.username
    })));
    
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
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('Gönderi yükleme isteği alındı.');
    console.log('Doğrulanmış kullanıcı ID:', req.user.id);
    console.log('Request fields:', req.body);
    console.log('Request files:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    } : 'Dosya yok');
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('Kullanıcı bulunamadı:', req.user.id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    console.log('Kullanıcı bulundu:', user.username);

    // Yeni gönderi oluştur
    const newPost = new Post({
      author: req.user.id,
      user: req.user.id,
      username: user.username,
      userImage: user.profilePicture || '',
      title: req.body.title || '',
      description: req.body.description || '',
      category: req.body.category || '',
      tags: req.body.tags || '',
      isPublic: req.body.isPublic === 'true',
      content: req.body.description || req.body.content || '',
      post_type: req.body.post_type || 'image',
      contentType: req.body.post_type || 'image'
    });

    // Medya dosyası yüklendiyse
    if (req.file) {
      // Mimetype'a göre video mu image mi kontrol et
      const isVideo = req.file.mimetype.includes('video') || 
                       req.file.mimetype === 'video/quicktime' ||
                       /\.(mp4|mov|avi|webm|mkv)$/i.test(req.file.originalname);
      
      console.log('Dosya türü analizi:', {
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        isVideo: isVideo
      });
      
      // Dosya yolu oluştur - burada /public/ ile başlayan yolu kullanıyoruz
      const fileDir = isVideo ? '/public/uploads/videos/' : '/public/uploads/images/';
      const filePath = fileDir + req.file.filename;
      
      if (isVideo) {
        newPost.video = filePath;
        newPost.contentType = 'video';
        newPost.post_type = 'video';
      } else {
        newPost.image = filePath;
        newPost.contentType = 'image';
        newPost.post_type = 'image';
      }
      
      console.log('Medya türü:', isVideo ? 'Video' : 'Image');
      console.log('Medya dosya yolu:', filePath);
      console.log('Tam dosya yolu:', path.join(__dirname, '..', filePath));
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
    
    console.log('Gönderi başarıyla kaydedildi:', {
      id: savedPost._id,
      contentType: savedPost.contentType,
      title: savedPost.title,
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
    
    // Beğeni sayısını artır
    post.likes = (post.likes || 0) + 1;
    await post.save();
    
    res.json({ message: 'Gönderi beğenildi', likes: post.likes });
  } catch (error) {
    console.error('Gönderi beğenme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gönderi beğenisini geri al
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    // Beğeni sayısını azalt (0'dan küçük olmamasını sağla)
    post.likes = Math.max(0, (post.likes || 0) - 1);
    await post.save();
    
    res.json({ message: 'Gönderi beğenisi geri alındı', likes: post.likes });
  } catch (error) {
    console.error('Gönderi beğeni geri alma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gönderiye yorum ekle
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Yeni yorum oluştur
    const Comment = require('../models/Comment');
    const newComment = new Comment({
      contentId: req.params.id,
      contentType: 'post',
      user: req.user.id,
      username: user.username,
      userImage: user.profilePicture || '',
      text: req.body.content
    });
    
    await newComment.save();
    
    // Gönderi yorum sayısını artır
    post.comments = (post.comments || 0) + 1;
    await post.save();
    
    res.status(201).json({ 
      message: 'Yorum eklendi', 
      comment: newComment,
      commentCount: post.comments 
    });
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gönderi yorumlarını getir
router.get('/:id/comments', async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ 
      contentId: req.params.id,
      contentType: 'post'
    })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePicture');
    
    res.json(comments);
  } catch (error) {
    console.error('Yorum getirme hatası:', error);
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
