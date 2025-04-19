const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını başlat
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB veritabanına başarıyla bağlandı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ana sayfa rotası
app.get('/', (req, res) => {
  res.send('FutbolX API çalışıyor');
});

// Port ayarı
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
