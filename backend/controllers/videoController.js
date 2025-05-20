const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// Video/Gönderi yükleme
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, category, tags, isPublic, post_type, textContent } = req.body;
    const postType = post_type || 'video';
    
    console.log('Gönderi yükleme isteği alındı. Tür:', postType);
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    // Etiketleri diziye çevir
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    let fileName = null;
    let filePath = null;
    
    // Dosya kontrolü (video veya görsel için)
    if ((postType === 'video' || postType === 'image') && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ 
        message: postType === 'video' 
          ? 'Lütfen bir video dosyası yükleyin' 
          : 'Lütfen bir görsel dosyası yükleyin' 
      });
    }
    
    // Dosya bilgilerini ayarla (video veya görsel için)
    if (postType === 'video' || postType === 'image') {
      const file = req.files[0];  // Dosya bilgisini al
      fileName = file.filename;
      
      if (postType === 'video') {
        filePath = `/uploads/videos/${file.filename}`;
      } else if (postType === 'image') {
        filePath = `/uploads/images/${file.filename}`;
      }
    }
    
    // Metin içerik kontrolü
    if (postType === 'text' && !textContent) {
      return res.status(400).json({ message: 'Lütfen metin içeriği girin' });
    }
    
    // Yeni gönderi oluştur
    const newVideo = new Video({
      title,
      description,
      fileName,
      filePath,
      uploadedBy: req.user._id,
      category: category || 'diğer',
      tags: tagArray,
      duration: postType === 'video' ? req.body.duration || '0:00' : null,
      isPublic: isPublic === 'true' || isPublic === true,
      postType: postType,
      textContent: postType === 'text' ? textContent : null
    });

    // Gönderiyi kaydet
    await newVideo.save();
    
    res.status(201).json({
      success: true,
      video: newVideo
    });
  } catch (error) {
    console.error('Gönderi yükleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Tüm gönderileri getir
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username profilePicture');
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Gönderileri getirme hatası:', error);
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
    
    // Not: Artık kimlik doğrulama kontrolü yapmıyoruz
    // Tüm kullanıcılar videoları silebilir
    
    // Dosyayı fiziksel olarak sil (video, resim veya thumbnail)
    if (video.filePath) {
      console.log("Silinecek dosya yolu:", video.filePath);
      try {
        // Dosya yolu frontend'den doğru şekilde gelmesi için düzenle
        let processedPath = video.filePath;
        if (processedPath.startsWith('/')) {
          processedPath = processedPath.substring(1);
        }
        
        const filePath = path.join(__dirname, '..', 'public', processedPath);
        console.log("Tam dosya yolu:", filePath);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Dosya silindi: ${filePath}`);
        } else {
          console.log(`Dosya bulunamadı: ${filePath}`);
    }
      } catch (fileError) {
        console.error(`Dosya silinirken hata oluştu: ${fileError.message}`);
        // Dosya silinmese bile işleme devam et
      }
    }
    
    // Thumbnail varsa ve default değilse sil
    if (video.thumbnail && video.thumbnail !== 'default-thumbnail.jpg') {
      try {
        const thumbnailPath = path.join(__dirname, '..', 'public', 'uploads', 'thumbnails', video.thumbnail);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
          console.log(`Thumbnail silindi: ${thumbnailPath}`);
        }
      } catch (thumbError) {
        console.error(`Thumbnail silinirken hata oluştu: ${thumbError.message}`);
        // Thumbnail silinmese bile işleme devam et
      }
    }
    
    // Veritabanından sil
    const deleted = await Video.findByIdAndDelete(req.params.id);
    console.log("Silinen kayıt:", deleted);
    
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
    
    const userId = req.user._id.toString();
    
    // Kullanıcının video beğeni durumunu kontrol et
    const userLikedIndex = video.likedBy.findIndex(id => id.toString() === userId);
    
    if (userLikedIndex === -1) {
      // Kullanıcı henüz videoyu beğenmemiş, beğeniyi ekle
      video.likedBy.push(userId);
    video.likes += 1;
    } else {
      // Kullanıcı önceden beğenmiş, beğeniyi kaldır
      video.likedBy.splice(userLikedIndex, 1);
      video.likes = Math.max(0, video.likes - 1); // Beğeni sayısı negatif olmasın
    }
    
    await video.save();
    
    res.status(200).json({
      success: true,
      likes: video.likes,
      isLiked: userLikedIndex === -1 // Eğer -1 ise yeni beğeni eklendi, değilse kaldırıldı
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

// Video görüntülenme sayısını artır
exports.incrementViews = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // İzlenme sayısını artır
    video.views = (video.views || 0) + 1;
    await video.save();
    
    res.status(200).json({
      success: true,
      views: video.views
    });
  } catch (error) {
    console.error('Görüntülenme sayısı artırma hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Öne çıkan videoları getir
exports.getFeaturedVideos = async (req, res) => {
  try {
    const videos = await Video.find({ 
      isPublic: true 
    })
    .sort({ views: -1, likes: -1 })
    .limit(10)
    .populate('uploadedBy', 'username profilePicture');
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Öne çıkan videoları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};
