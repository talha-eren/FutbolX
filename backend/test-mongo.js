// MongoDB bağlantı testi
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB URI'yi al
const mongoURI = process.env.MONGODB_URI;

// URI'yi maskele (güvenlik için)
const maskedURI = mongoURI ? mongoURI.replace(/:([^:@]+)@/, ':****@') : 'Tanımlanmamış';
console.log(`MongoDB URI: ${maskedURI}`);

// .env değişkenlerini kontrol et
console.log('Çevre değişkenleri:');
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Tanımlanmış' : 'Tanımlanmamış'}`);
console.log(`PORT: ${process.env.PORT || 'Tanımlanmamış'}`);

// MongoDB'ye bağlan
async function connectToMongoDB() {
  try {
    if (!mongoURI) {
      throw new Error('MONGODB_URI çevre değişkeni tanımlanmamış');
    }
    
    console.log('MongoDB\'ye bağlanmaya çalışılıyor...');
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB bağlantısı başarılı!');
    
    // Bağlantı durumunu kontrol et
    console.log(`Bağlantı durumu: ${mongoose.connection.readyState}`);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    // Veritabanı adını göster
    console.log(`Veritabanı adı: ${mongoose.connection.name}`);
    
    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('Bağlantı kapatıldı');
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('Hata kodu:', error.code);
      console.error('Hata mesajı:', error.errmsg || error.message);
    }
  }
}

// Bağlantıyı test et
connectToMongoDB();
