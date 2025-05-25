// Çalıştırma betiği - Mevcut verileri koruyarak örnek verileri ekler
require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase } = require('./seed');

// MongoDB bağlantısı
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://talhaeren:talhaeren@cluster0.86ovh.mongodb.net/futbolx?retryWrites=true&w=majority&appName=Cluster0';

// Veritabanını doldur
async function runSeed() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB bağlantısı başarılı');
    
    console.log('Veritabanı kontrol ediliyor ve eksik veriler ekleniyor...');
    console.log('NOT: Bu işlem mevcut verilerinizi SİLMEZ, sadece eksik verileri ekler.');
    await seedDatabase();
    
    console.log('İşlem tamamlandı.');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

// Betiği çalıştır
runSeed(); 