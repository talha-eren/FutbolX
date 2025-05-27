const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Yorumları getir (post veya video için)
router.get('/:contentType/:contentId', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
    console.log('📝 Yorumlar isteniyor:', { contentType, contentId });
    
    // İçerik tipini kontrol et
    if (!['post', 'video'].includes(contentType)) {
      return res.status(400).json({ message: 'Geçersiz içerik tipi' });
    }
    
    // İçeriğin var olup olmadığını kontrol et
    let content;
    if (contentType === 'post') {
      content = await Post.findById(contentId);
    } else {
      content = await Video.findById(contentId);
    }
    
    if (!content) {
      return res.status(404).json({ message: 'İçerik bulunamadı' });
    }
    
    // Yorumları getir
    const comments = await Comment.find({ 
      contentId, 
      contentType 
    })
    .sort({ createdAt: -1 }) // En yeni yorumlar önce
    .limit(50); // Maksimum 50 yorum
    
    console.log(`✅ ${comments.length} yorum bulundu`);
    res.json(comments);
  } catch (err) {
    console.error('Yorumları getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Post için yorumları getir (yeni format)
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    console.log('📝 Post yorumları isteniyor:', postId);
    
    // Yorumları getir ve User bilgilerini populate et
    const comments = await Comment.find({ 
      contentId: postId, 
      contentType: 'post' 
    })
    .populate('user', 'username name profilePicture') // User bilgilerini getir
    .sort({ createdAt: -1 }) // En yeni yorumlar önce
    .limit(50); // Maksimum 50 yorum
    
    console.log(`✅ ${comments.length} yorum bulundu`);
    
    // Frontend formatına dönüştür
    const formattedComments = comments.map(comment => {
      const user = comment.user || {};
      const displayName = user.name || user.username || comment.username || 'Kullanıcı';
      
      console.log('👤 Yorum kullanıcı bilgisi:', {
        userId: user._id,
        name: user.name,
        username: user.username,
        displayName: displayName
      });
      
      return {
        _id: comment._id,
        contentId: comment.contentId,
        contentType: comment.contentType,
        user: {
          _id: user._id || comment.user,
          username: displayName, // Gerçek isim veya username kullan
          profilePicture: user.profilePicture || comment.userImage
        },
        text: comment.text,
        likes: comment.likes,
        createdAt: comment.createdAt
      };
    });
    
    console.log('📤 Formatted comments örneği:', formattedComments[0]);
    
    res.json(formattedComments);
  } catch (err) {
    console.error('Post yorumları getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorum ekle
router.post('/', auth, async (req, res) => {
  try {
    const { contentId, contentType, text } = req.body;
    const userId = req.userId || req.user.id;
    
    console.log('📝 Yorum ekleniyor (eski route):', {
      contentId,
      contentType,
      text: text?.substring(0, 50) + '...',
      userId
    });
    
    // Gerekli alanları kontrol et
    if (!contentId || !contentType || !text) {
      console.log('❌ Eksik alanlar:', { contentId, contentType, text: !!text });
      return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
    }
    
    if (!userId) {
      console.log('❌ UserId bulunamadı');
      return res.status(401).json({ message: 'Kullanıcı kimliği bulunamadı' });
    }
    
    // İçerik tipini kontrol et
    if (!['post', 'video'].includes(contentType)) {
      return res.status(400).json({ message: 'Geçersiz içerik tipi' });
    }
    
    // Kullanıcı bilgilerini çek
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı:', userId);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    console.log('👤 Kullanıcı bulundu:', {
      id: user._id,
      username: user.username,
      name: user.name
    });
    
    // İçeriğin var olup olmadığını kontrol et
    let content;
    if (contentType === 'post') {
      content = await Post.findById(contentId);
    } else {
      content = await Video.findById(contentId);
    }
    
    if (!content) {
      console.log('❌ İçerik bulunamadı:', contentId);
      return res.status(404).json({ message: 'İçerik bulunamadı' });
    }
    
    console.log('📄 İçerik bulundu:', contentId);
    
    // Yeni yorum oluştur
    const newComment = new Comment({
      contentId,
      contentType,
      user: userId,
      username: user.name || user.username,
      userImage: user.profilePicture || '',
      text: text.trim()
    });
    
    console.log('💾 Yorum kaydediliyor...');
    // Yorumu kaydet
    await newComment.save();
    console.log('✅ Yorum kaydedildi:', newComment._id);
    
    // İçeriğin yorum sayısını güncelle
    if (contentType === 'post') {
      await Post.findByIdAndUpdate(contentId, { $inc: { comments: 1 } });
    } else {
      await Video.findByIdAndUpdate(contentId, { $inc: { comments: 1 } });
    }
    
    console.log('📤 Yorum döndürülüyor');
    
    // Frontend formatında döndür
    const formattedComment = {
      _id: newComment._id,
      contentId: newComment.contentId,
      contentType: newComment.contentType,
      user: {
        _id: newComment.user,
        username: user.name || user.username,
        profilePicture: newComment.userImage
      },
      text: newComment.text,
      likes: newComment.likes,
      createdAt: newComment.createdAt
    };
    
    res.status(201).json(formattedComment);
  } catch (err) {
    console.error('❌ Yorum ekleme hatası (detaylı):', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

// Yorum sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Yorumun sahibi olup olmadığını kontrol et
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Yetkiniz yok' });
    }
    
    // Yorumu sil
    await comment.remove();
    
    // İçeriğin yorum sayısını güncelle
    if (comment.contentType === 'post') {
      await Post.findByIdAndUpdate(comment.contentId, { $inc: { comments: -1 } });
    } else {
      await Video.findByIdAndUpdate(comment.contentId, { $inc: { comments: -1 } });
    }
    
    res.json({ message: 'Yorum silindi' });
  } catch (err) {
    console.error('Yorum silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorumu beğen/beğenmekten vazgeç
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Yorumu beğen
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id, 
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    res.json({ 
      success: true,
      likes: updatedComment.likes 
    });
  } catch (err) {
    console.error('Yorum beğenme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
