// .env dosyasını test etmek için script
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// .env dosyasının yolunu belirle
const envPath = path.resolve(__dirname, '.env');

// .env dosyasının varlığını kontrol et
console.log(`.env dosyası var mı: ${fs.existsSync(envPath)}`);

// Varsa içeriğini oku (güvenlik için maskeleyerek)
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const maskedContent = envContent
      .replace(/MONGODB_URI=.*/, 'MONGODB_URI=***MASKED***')
      .replace(/JWT_SECRET=.*/, 'JWT_SECRET=***MASKED***');
    
    console.log('.env dosyası içeriği (maskelenmiş):');
    console.log(maskedContent);
    
    // Dosyayı manuel olarak yükle
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('.env dosyası yüklenirken hata oluştu:', result.error);
    } else {
      console.log('.env dosyası başarıyla yüklendi');
      console.log('Çevre değişkenleri:');
      console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'Tanımlanmış' : 'Tanımlanmamış'}`);
      console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Tanımlanmış' : 'Tanımlanmamış'}`);
      console.log(`PORT: ${process.env.PORT || 'Tanımlanmamış'}`);
    }
  } catch (error) {
    console.error('.env dosyası okunurken hata oluştu:', error);
  }
} else {
  console.log('.env dosyası bulunamadı. Yeni bir .env dosyası oluşturalım.');
  
  // Örnek .env içeriği
  const sampleEnvContent = `MONGODB_URI=mongodb+srv://kullaniciadi:sifre@cluster.mongodb.net/veritabani?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=futbolx-secret-key`;
  
  console.log('Oluşturulacak örnek .env içeriği:');
  console.log(sampleEnvContent);
  
  console.log('\nBu dosyayı manuel olarak oluşturmanız gerekiyor.');
}
