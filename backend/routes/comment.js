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
    
    res.json(comments);
  } catch (err) {
    console.error('Yorumları getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorum ekle
router.post('/', auth, async (req, res) => {
  try {
    const { contentId, contentType, text } = req.body;
    
    // Gerekli alanları kontrol et
    if (!contentId || !contentType || !text) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
    }
    
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
    
    // Yeni yorum oluştur
    const newComment = new Comment({
      contentId,
      contentType,
      user: req.user.id,
      username: req.user.username,
      userImage: req.user.profilePicture || '',
      text
    });
    
    // Yorumu kaydet
    await newComment.save();
    
    // İçeriğin yorum sayısını güncelle
    if (contentType === 'post') {
      await Post.findByIdAndUpdate(contentId, { $inc: { comments: 1 } });
    } else {
      await Video.findByIdAndUpdate(contentId, { $inc: { comments: 1 } });
    }
    
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Yorum ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
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
router.put('/like/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Yorumu beğen
    await Comment.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    
    res.json({ message: 'Yorum beğenildi' });
  } catch (err) {
    console.error('Yorum beğenme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
