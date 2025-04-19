const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// Video yükleme
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir video dosyası yükleyin' });
    }

    const { title, description, category, tags, isPublic, duration } = req.body;
    
    console.log('Video süresi:', duration);
    
    // Etiketleri diziye çevir
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Yeni video oluştur
    const newVideo = new Video({
      title,
      description,
      fileName: req.file.filename,
      filePath: `/uploads/videos/${req.file.filename}`,
      uploadedBy: req.user._id,
      category: category || 'diğer',
      tags: tagArray,
      duration: duration || '0:00',
      isPublic: isPublic === 'true'
    });

    // Videoyu kaydet
    await newVideo.save();
    
    res.status(201).json({
      success: true,
      video: newVideo
    });
  } catch (error) {
    console.error('Video yükleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Tüm videoları getir
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username profilePicture');
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Videoları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir videoyu getir
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // İzlenme sayısını artır
    video.views += 1;
    await video.save();
    
    res.status(200).json(video);
  } catch (error) {
    console.error('Video getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Videoyu güncelle
exports.updateVideo = async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;
    
    // Videoyu bul
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // Video sahibi kontrolü
    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu videoyu düzenleme yetkiniz yok' });
    }
    
    // Etiketleri diziye çevir
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : video.tags;
    
    // Videoyu güncelle
    video.title = title || video.title;
    video.description = description || video.description;
    video.category = category || video.category;
    video.tags = tagArray;
    video.isPublic = isPublic === 'true';
    
    await video.save();
    
    res.status(200).json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Video güncelleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Videoyu sil
exports.deleteVideo = async (req, res) => {
  try {
    // Videoyu bul
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // Video sahibi kontrolü
    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu videoyu silme yetkiniz yok' });
    }
    
    // Dosyayı fiziksel olarak sil
    const filePath = path.join(__dirname, '..', 'public', video.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Veritabanından sil
    await Video.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Video başarıyla silindi'
    });
  } catch (error) {
    console.error('Video silme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Videoya yorum ekle
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Yorum metni gereklidir' });
    }
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    const comment = {
      user: req.user._id,
      text
    };
    
    video.comments.push(comment);
    await video.save();
    
    // Yeni yorumu kullanıcı bilgileriyle birlikte döndür
    const populatedVideo = await Video.findById(req.params.id)
      .populate('comments.user', 'username profilePicture');
    
    const newComment = populatedVideo.comments[populatedVideo.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Videoya beğeni ekle/kaldır
exports.toggleLike = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // Beğeni sayısını artır
    video.likes += 1;
    await video.save();
    
    res.status(200).json({
      success: true,
      likes: video.likes
    });
  } catch (error) {
    console.error('Beğeni hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcının kendi videolarını getir
exports.getMyVideos = async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Videoları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kategoriye göre video getir
exports.getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const videos = await Video.find({ 
      category, 
      isPublic: true 
    })
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'username profilePicture');
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Kategoriye göre video getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Etiketlere göre video ara
exports.searchVideosByTags = async (req, res) => {
  try {
    const { tag } = req.params;
    
    const videos = await Video.find({ 
      tags: { $in: [tag] }, 
      isPublic: true 
    })
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'username profilePicture');
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Etiketlere göre video arama hatası:', error);
    res.status(500).json({ message: error.message });
  }
};
