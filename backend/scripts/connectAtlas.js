const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB Atlas bağlantısı
// Atlas connection string'inizi buraya yapıştırın
const ATLAS_URI = process.env.MONGODB_ATLAS_URI || 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/futbolx?retryWrites=true&w=majority';

// Yerel bağlantı alternatifi
const LOCAL_URI = 'mongodb://localhost:27017/futbolx';

async function connectToMongoDB() {
  try {
    // Atlas URI'sinin placeholder olup olmadığını kontrol et
    if (ATLAS_URI.includes('<username>') || ATLAS_URI.includes('xxxxx')) {
      console.log('⚠️ Atlas URI placeholder içeriyor, yerel MongoDB\'ye geçiliyor...');
      throw new Error('Atlas URI yapılandırılmamış');
    }
    
    // Atlas'a bağlanmayı dene
    console.log('🌐 MongoDB Atlas\'a bağlanmaya çalışılıyor...');
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Atlas bağlantısı başarılı!');
    return 'atlas';
  } catch (atlasError) {
    console.log('❌ Atlas bağlantısı başarısız:', atlasError.message);
    
    try {
      // Atlas başarısızsa yerel MongoDB'yi dene
      console.log('🏠 Yerel MongoDB\'ye bağlanmaya çalışılıyor...');
      await mongoose.connect(LOCAL_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Yerel MongoDB bağlantısı başarılı!');
      return 'local';
    } catch (localError) {
      console.log('❌ Yerel MongoDB bağlantısı başarısız:', localError.message);
      console.log('\n💡 Çözüm önerileri:');
      console.log('   1. Atlas connection string\'ini güncelleyin');
      console.log('   2. MongoDB Community Server kurun: https://www.mongodb.com/try/download/community');
      console.log('   3. MongoDB Atlas hesabı oluşturun: https://www.mongodb.com/cloud/atlas');
      throw new Error('MongoDB bağlantısı kurulamadı');
    }
  }
}

// Test kullanıcıları ekleme fonksiyonu
async function addTestUsers() {
  const testUsers = [
    {
      username: "test_kaleci",
      email: "test.kaleci@example.com",
      firstName: "Test",
      lastName: "Kaleci",
      position: "Kaleci",
      footballExperience: "Orta",
      preferredFoot: "Sağ",
      height: 185,
      weight: 80,
      location: "Kadıköy",
      phone: "05551234567",
      bio: "Test kaleci kullanıcısı",
      favoriteTeam: "Fenerbahçe"
    },
    {
      username: "test_defans",
      email: "test.defans@example.com",
      firstName: "Test",
      lastName: "Defans",
      position: "Defans",
      footballExperience: "İleri",
      preferredFoot: "Sol",
      height: 183,
      weight: 79,
      location: "Beşiktaş",
      phone: "05552345678",
      bio: "Test defans kullanıcısı",
      favoriteTeam: "Beşiktaş"
    },
    {
      username: "test_ortasaha",
      email: "test.ortasaha@example.com",
      firstName: "Test",
      lastName: "Orta Saha",
      position: "Orta Saha",
      footballExperience: "İleri",
      preferredFoot: "Her İkisi",
      height: 176,
      weight: 73,
      location: "Üsküdar",
      phone: "05554567890",
      bio: "Test orta saha kullanıcısı",
      favoriteTeam: "Trabzonspor"
    },
    {
      username: "test_forvet",
      email: "test.forvet@example.com",
      firstName: "Test",
      lastName: "Forvet",
      position: "Forvet",
      footballExperience: "Orta",
      preferredFoot: "Sol",
      height: 181,
      weight: 77,
      location: "Kartal",
      phone: "05556789012",
      bio: "Test forvet kullanıcısı",
      favoriteTeam: "Galatasaray"
    }
  ];

  console.log('\n👥 Test kullanıcıları ekleniyor...');
  
  for (let userData of testUsers) {
    try {
      const existingUser = await User.findOne({ 
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });
      
      if (!existingUser) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`✅ ${userData.firstName} ${userData.lastName} (${userData.position}) eklendi`);
      } else {
        console.log(`⚠️ ${userData.username} zaten mevcut`);
      }
    } catch (error) {
      console.log(`❌ ${userData.username} eklenirken hata:`, error.message);
    }
  }
}

// Ana fonksiyon
async function main() {
  try {
    const connectionType = await connectToMongoDB();
    
    console.log(`\n🎯 Bağlantı türü: ${connectionType === 'atlas' ? 'MongoDB Atlas (Bulut)' : 'Yerel MongoDB'}`);
    
    // Test kullanıcılarını ekle
    await addTestUsers();
    
    // Pozisyon dağılımını göster
    const positions = await User.aggregate([
      { $match: { position: { $exists: true, $ne: '' } } },
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n🎯 Pozisyon Dağılımı:');
    positions.forEach(pos => {
      console.log(`   ${pos._id}: ${pos.count} oyuncu`);
    });
    
    mongoose.connection.close();
    console.log('\n✅ İşlem tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { connectToMongoDB, addTestUsers }; 