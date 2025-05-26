const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB bağlantısı - farklı seçenekleri dene
const connectDB = async () => {
  try {
    // Önce mevcut bağlantıyı dene
    await mongoose.connect('mongodb://localhost:27017/futbolx', {
      serverSelectionTimeoutMS: 5000, // 5 saniye timeout
    });
    console.log('✅ MongoDB bağlantısı başarılı (localhost)');
  } catch (error) {
    console.log('❌ Localhost MongoDB bağlantısı başarısız:', error.message);
    console.log('💡 MongoDB kurulu değil veya çalışmıyor.');
    console.log('📋 Çözüm önerileri:');
    console.log('   1. MongoDB Community Server indirin: https://www.mongodb.com/try/download/community');
    console.log('   2. MongoDB Compass kullanın');
    console.log('   3. MongoDB Atlas (bulut) kullanın');
    process.exit(1);
  }
};

// Mevcut kullanıcıları güncelleme verileri
const userUpdates = [
  {
    username: "test",
    updates: {
      position: "Kaleci",
      footballExperience: "Orta",
      preferredFoot: "Sağ",
      height: 185,
      weight: 80,
      location: "Kadıköy",
      phone: "05551234567",
      bio: "Deneyimli kaleci, refleksleri çok iyi.",
      favoriteTeam: "Fenerbahçe"
    }
  },
  {
    username: "erentalhal",
    updates: {
      position: "Orta Saha",
      footballExperience: "İleri",
      preferredFoot: "Her İkisi",
      height: 175,
      weight: 72,
      location: "Beşiktaş",
      phone: "05552345678",
      bio: "Yaratıcı orta saha oyuncusu, pas kalitesi yüksek.",
      favoriteTeam: "Beşiktaş"
    }
  }
];

// Yeni kullanıcılar (eğer MongoDB çalışırsa)
const newUsers = [
  {
    username: "mehmet_kaleci",
    email: "mehmet.kaleci@gmail.com",
    password: "$2a$10$example", // Örnek hash
    firstName: "Mehmet",
    lastName: "Yılmaz",
    position: "Kaleci",
    footballExperience: "İleri",
    preferredFoot: "Sağ",
    height: 188,
    weight: 82,
    location: "Kadıköy",
    phone: "05551234567",
    bio: "Deneyimli kaleci, refleksleri çok iyi.",
    favoriteTeam: "Fenerbahçe"
  },
  {
    username: "ahmet_defans",
    email: "ahmet.defans@gmail.com",
    firstName: "Ahmet",
    lastName: "Kaya",
    position: "Defans",
    footballExperience: "İleri",
    preferredFoot: "Sol",
    height: 183,
    weight: 79,
    location: "Beşiktaş",
    phone: "05552345678",
    bio: "Güçlü defans oyuncusu, hava toplarında etkili.",
    favoriteTeam: "Beşiktaş"
  },
  {
    username: "can_defans",
    email: "can.defans@gmail.com",
    firstName: "Can",
    lastName: "Özkan",
    position: "Defans",
    footballExperience: "Orta",
    preferredFoot: "Sağ",
    height: 180,
    weight: 76,
    location: "Şişli",
    phone: "05553456789",
    bio: "Hızlı ve çevik defans oyuncusu.",
    favoriteTeam: "Galatasaray"
  },
  {
    username: "burak_ortasaha",
    email: "burak.ortasaha@gmail.com",
    firstName: "Burak",
    lastName: "Demir",
    position: "Orta Saha",
    footballExperience: "İleri",
    preferredFoot: "Her İkisi",
    height: 176,
    weight: 73,
    location: "Üsküdar",
    phone: "05554567890",
    bio: "Yaratıcı orta saha oyuncusu, pas kalitesi yüksek.",
    favoriteTeam: "Trabzonspor"
  },
  {
    username: "arda_forvet",
    email: "arda.forvet@gmail.com",
    firstName: "Arda",
    lastName: "Çelik",
    position: "Forvet",
    footballExperience: "Orta",
    preferredFoot: "Sol",
    height: 181,
    weight: 77,
    location: "Kartal",
    phone: "05556789012",
    bio: "Gol yeteneği yüksek forvet, bitiricilik konusunda yetenekli.",
    favoriteTeam: "Galatasaray"
  }
];

async function updateUsers() {
  try {
    console.log('Kullanıcılar güncelleniyor...');
    
    // Mevcut kullanıcıları güncelle
    for (let userUpdate of userUpdates) {
      const user = await User.findOne({ username: userUpdate.username });
      if (user) {
        Object.assign(user, userUpdate.updates);
        await user.save();
        console.log(`✅ ${user.username} güncellendi (${userUpdate.updates.position})`);
      } else {
        console.log(`❌ ${userUpdate.username} bulunamadı`);
      }
    }
    
    // Yeni kullanıcıları ekle (isteğe bağlı)
    console.log('\nYeni kullanıcılar ekleniyor...');
    for (let userData of newUsers) {
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
    }
    
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
    console.error('❌ Hata:', error);
    mongoose.connection.close();
  }
}

connectDB().then(() => updateUsers()); 