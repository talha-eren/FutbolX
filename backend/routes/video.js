const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const router = express.Router();

// GridFS Storage setup
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/futbolx',
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'videos',
      metadata: {
        user: req.user ? req.user.id : 'guest',
        title: req.body ? req.body.title : 'Untitled',
        description: req.body ? req.body.description : '',
      },
    };
  },
});
const upload = multer({ storage });

// Video upload endpoint
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Video dosyası gerekli.' });

    // Video meta bilgisini kaydet
    const video = new Video({
      filename: file.filename,
      contentType: file.contentType,
      length: file.size,
      uploadDate: file.uploadDate,
      user: req.user.id,
      title,
      description,
      fileId: file.id,
    });
    await video.save();
    res.status(201).json({ message: 'Video yüklendi.', video });
  } catch (err) {
    res.status(500).json({ message: 'Video yüklenemedi.', error: err.message });
  }
});

// Video listeleme endpointi
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('user', 'username email');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Videolar alınamadı.', error: err.message });
  }
});

// Video silme endpointi (sadece sahibi silebilir)
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video bulunamadı.' });
    if (video.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Sadece kendi videonu silebilirsin.' });
    }
    await Video.deleteOne({ _id: req.params.id });
    // GridFS dosyasını da sil
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'videos' });
    await bucket.delete(video.fileId);
    res.json({ message: 'Video silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Video silinemedi.', error: err.message });
  }
});

// Video beğenme endpointi
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video bulunamadı.' });
    if (video.likes.includes(req.user.id)) {
      // Zaten beğenmişse kaldırsın (toggle)
      video.likes.pull(req.user.id);
    } else {
      video.likes.push(req.user.id);
    }
    await video.save();
    res.json({ message: 'Beğeni güncellendi.', likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Beğeni güncellenemedi.', error: err.message });
  }
});

// Video yorumu ekleme endpointi
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Yorum metni gerekli.' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video bulunamadı.' });
    video.comments.push({ user: req.user.id, text });
    await video.save();
    res.json({ message: 'Yorum eklendi.', comments: video.comments });
  } catch (err) {
    res.status(500).json({ message: 'Yorum eklenemedi.', error: err.message });
  }
});

// Video indirme endpointi
router.get('/download/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'videos' });
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', () => res.status(404).json({ message: 'Video bulunamadı.' }));
    res.set('Content-Type', 'video/mp4');
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Video indirilemedi.', error: err.message });
  }
});

module.exports = router;
