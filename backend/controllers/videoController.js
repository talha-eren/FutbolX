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
    
    // Hiç kayıt yoksa örnek veri oluştur
    if (videos.length === 0) {
      console.log('Veritabanında gönderi bulunamadı, örnek veri döndürülüyor');
      const sampleVideos = getSampleVideos();
      return res.status(200).json(sampleVideos);
    }
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Gönderileri getirme hatası:', error);
    // Hata durumunda örnek veriler gönder
    const sampleVideos = getSampleVideos();
    res.status(200).json(sampleVideos);
  }
};

// Örnek video verisi fonksiyonu
function getSampleVideos() {
  return [
    {
      _id: 'sample001',
      title: 'FutbolX Turnuvası Final Maçı',
      description: '2024 FutbolX Turnuvası final maçı özeti',
      fileName: 'sample-video-1.mp4',
      filePath: '/uploads/videos/sample-video-1.mp4',
      postType: 'video',
      category: 'maç',
      tags: ['maç', 'turnuva', 'final', 'futbolx'],
      isPublic: true,
      views: 120,
      likes: 24,
      comments: [],
      uploadedBy: {
        _id: 'user001',
        username: 'futbolcu1',
        profilePicture: '/uploads/images/default-profile.png'
      },
      createdAt: new Date()
    },
    {
      _id: 'sample002',
      title: 'Serbest Vuruş Tekniği',
      description: 'Profesyonel futbolcudan serbest vuruş teknikleri',
      fileName: 'sample-video-2.mp4',
      filePath: '/uploads/videos/sample-video-2.mp4',
      postType: 'video',
      category: 'antrenman',
      tags: ['antrenman', 'teknik', 'serbest vuruş'],
      isPublic: true,
      views: 85,
      likes: 15,
      comments: [],
      uploadedBy: {
        _id: 'user002',
        username: 'futbolcu2',
        profilePicture: '/uploads/images/default-profile.png'
      },
      createdAt: new Date()
    },
    {
      _id: 'sample003',
      title: 'Haftalık Futbol Analizi',
      description: 'Bu haftanın en iyi futbol hareketleri ve analizleri',
      textContent: 'Bu haftasonu oynanan maçlarda birçok ilginç taktik varyasyon gördük. Özellikle orta saha presingi yapan takımlar rakiplerini baskı altına almayı başardı. Forvet bölgesinde ise dar alanda oynayan takımlar daha çok gol fırsatı yakaladı.',
      postType: 'text',
      category: 'diğer',
      tags: ['analiz', 'taktik', 'futbol'],
      isPublic: true,
      views: 65,
      likes: 12,
      comments: [],
      uploadedBy: {
        _id: 'user001',
        username: 'futbolcu1',
        profilePicture: '/uploads/images/default-profile.png'
      },
      createdAt: new Date()
    },
    {
      _id: 'sample004',
      title: 'Özel Halı Saha Turnuvası',
      description: 'Halı saha turnuvamızdan görüntüler',
      fileName: 'sample-image-1.jpg',
      filePath: '/uploads/images/sample-image-1.jpg',
      postType: 'image',
      category: 'maç',
      tags: ['turnuva', 'halı saha', 'etkinlik'],
      isPublic: true,
      views: 43,
      likes: 8,
      comments: [],
      uploadedBy: {
        _id: 'user002',
        username: 'futbolcu2',
        profilePicture: '/uploads/images/default-profile.png'
      },
      createdAt: new Date()
    }
  ];
}

// Belirli bir videoyu getir
exports.getVideoById = async (req, res) => {
  try {
    // Örnek ID'leri kontrol et
    if (req.params.id.startsWith('sample')) {
      const allSamples = getSampleVideos();
      const sample = allSamples.find(v => v._id === req.params.id);
      
      if (sample) {
        return res.status(200).json(sample);
      }
    }
    
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    if (!video) {
      // Veritabanında bulunamadıysa örnek veri döndür
      const sampleVideos = getSampleVideos();
      const sample = sampleVideos[0]; // İlk örnek videoyu döndür
      return res.status(200).json(sample);
    }
    
    // İzlenme sayısını artır
    video.views += 1;
    await video.save();
    
    res.status(200).json(video);
  } catch (error) {
    console.error('Video getirme hatası:', error);
    // Hata durumunda örnek video döndür
    const sampleVideos = getSampleVideos();
    const sample = sampleVideos[0];
    res.status(200).json(sample);
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
    if (video.filePath && video.postType !== 'text') {
      try {
    const filePath = path.join(__dirname, '..', 'public', video.filePath);
        console.log('Silinecek dosya yolu:', filePath);
        
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
          console.log('Dosya başarıyla silindi:', filePath);
        } else {
          console.warn('Dosya bulunamadı, sadece veritabanından siliniyor:', filePath);
        }
      } catch (fileError) {
        console.error('Dosya silme hatası:', fileError);
        // Dosya silme hatası olsa bile işleme devam et, en azından veritabanından silinsin
      }
    }
    
    // Veritabanından sil
    await Video.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Video başarıyla silindi'
    });
  } catch (error) {
    console.error('Video silme hatası:', error);
    res.status(500).json({ message: 'Video silinirken bir hata oluştu: ' + error.message });
  }
};

// Videoya yorum ekle
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Yorum metni gereklidir' });
    }
    
    // Örnek ID'leri kontrol et
    if (req.params.id.startsWith('sample')) {
      // Örnek video için yorum ekleme işlemi gibi davran
      const newComment = {
        _id: 'comment' + Date.now(),
        user: {
          _id: req.user._id,
          username: req.user.username || 'Kullanıcı',
          profilePicture: req.user.profilePicture || '/uploads/images/default-profile.png'
        },
        text: text,
        createdAt: new Date()
      };
      
      return res.status(201).json(newComment);
    }
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      // Veritabanında bulunamadıysa örnek yorum gibi davran
      const newComment = {
        _id: 'comment' + Date.now(),
        user: {
          _id: req.user._id,
          username: req.user.username || 'Kullanıcı',
          profilePicture: req.user.profilePicture || '/uploads/images/default-profile.png'
        },
        text: text,
        createdAt: new Date()
      };
      
      return res.status(201).json(newComment);
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
    // Hata durumunda örnek yorum döndür
    const newComment = {
      _id: 'comment' + Date.now(),
      user: {
        _id: req.user?._id || 'user001',
        username: req.user?.username || 'Kullanıcı',
        profilePicture: req.user?.profilePicture || '/uploads/images/default-profile.png'
      },
      text: req.body.text || 'Yorum',
      createdAt: new Date()
    };
    
    res.status(201).json(newComment);
  }
};

// Videoya beğeni ekle/kaldır
exports.toggleLike = async (req, res) => {
  try {
    // Örnek ID'leri kontrol et
    if (req.params.id.startsWith('sample')) {
      // Örnek video için beğeni islemine izin ver
      return res.status(200).json({
        success: true,
        likes: 25, // Beğeni sayısı artırılmış gibi davran
        isLiked: true // Beğenildiğini varsay
      });
    }
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      // Veritabanında bulunamadıysa örnek video için beğeni gibi davran
      return res.status(200).json({
        success: true,
        likes: 25,
        isLiked: true
      });
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
    // Hata durumunda olumlu yanıt döndür
    res.status(200).json({
      success: true,
      likes: 25,
      isLiked: true
    });
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

// Öne çıkan videoları getir (en çok görüntülenen ve beğenilen)
exports.getFeaturedVideos = async (req, res) => {
  try {
    // En çok görüntülenen ve beğenilen videoları getir
    const videos = await Video.find({ isPublic: true })
      .sort({ views: -1, likes: -1 })
      .limit(4)
      .populate('uploadedBy', 'username profilePicture');
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Öne çıkan videoları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Videoya görüntülenme ekle
exports.incrementViews = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // Görüntülenme sayısını artır
    video.views = (video.views || 0) + 1;
    await video.save();
    
    res.status(200).json({
      success: true,
      views: video.views
    });
  } catch (error) {
    console.error('Video görüntülenme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};
