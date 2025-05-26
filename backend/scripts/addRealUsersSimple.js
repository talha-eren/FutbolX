const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB bağlantısı - Atlas kullan
const mongoURI = 'mongodb+srv://talhaeren:talhaeren@cluster0.86ovh.mongodb.net/futbolx?retryWrites=true&w=majority&appName=Cluster0';

const newUsers = [
  {
    username: "mehmet_kaleci",
    email: "mehmet.kaleci@gmail.com",
    password: "123456",
    firstName: "Mehmet",
    lastName: "Yılmaz",
    position: "Kaleci",
    footballExperience: "İleri",
    preferredFoot: "Sağ",
    height: 188,
    weight: 82,
    location: "Kadıköy",
    phone: "05551234567",
    bio: "Deneyimli kaleci, refleksleri çok iyi. Takım oyununa önem verir.",
    favoriteTeam: "Fenerbahçe"
  },
  {
    username: "ahmet_defans",
    email: "ahmet.defans@gmail.com", 
    password: "123456",
    firstName: "Ahmet",
    lastName: "Kaya",
    position: "Defans",
    footballExperience: "İleri",
    preferredFoot: "Sol",
    height: 183,
    weight: 79,
    location: "Beşiktaş",
    phone: "05552345678",
    bio: "Güçlü defans oyuncusu, hava toplarında etkili. Liderlik vasfı var.",
    favoriteTeam: "Beşiktaş"
  },
  {
    username: "can_defans",
    email: "can.defans@gmail.com",
    password: "123456", 
    firstName: "Can",
    lastName: "Özkan",
    position: "Defans",
    footballExperience: "Orta",
    preferredFoot: "Sağ",
    height: 180,
    weight: 76,
    location: "Şişli",
    phone: "05553456789",
    bio: "Hızlı ve çevik defans oyuncusu. Ofansif katkıları da var.",
    favoriteTeam: "Galatasaray"
  },
  {
    username: "burak_ortasaha",
    email: "burak.ortasaha@gmail.com",
    password: "123456",
    firstName: "Burak",
    lastName: "Demir",
    position: "Orta Saha", 
    footballExperience: "İleri",
    preferredFoot: "Her İkisi",
    height: 176,
    weight: 73,
    location: "Üsküdar",
    phone: "05554567890",
    bio: "Yaratıcı orta saha oyuncusu, pas kalitesi yüksek. Oyun kurma yeteneği var.",
    favoriteTeam: "Trabzonspor"
  },
  {
    username: "kerem_ortasaha",
    email: "kerem.ortasaha@gmail.com",
    password: "123456",
    firstName: "Kerem", 
    lastName: "Aktaş",
    position: "Orta Saha",
    footballExperience: "Başlangıç",
    preferredFoot: "Sağ",
    height: 174,
    weight: 69,
    location: "Maltepe",
    phone: "05555678901",
    bio: "Genç ve hırslı oyuncu, öğrenmeye açık. Koşu gücü yüksek.",
    favoriteTeam: "Fenerbahçe"
  },
  {
    username: "arda_forvet",
    email: "arda.forvet@gmail.com",
    password: "123456",
    firstName: "Arda",
    lastName: "Çelik",
    position: "Forvet",
    footballExperience: "Orta",
    preferredFoot: "Sol", 
    height: 181,
    weight: 77,
    location: "Kartal",
    phone: "05556789012",
    bio: "Gol yeteneği yüksek forvet, bitiricilik konusunda yetenekli. Hızlı ve çevik.",
    favoriteTeam: "Galatasaray"
  },
  {
    username: "emre_forvet",
    email: "emre.forvet@gmail.com",
    password: "123456",
    firstName: "Emre",
    lastName: "Arslan", 
    position: "Forvet",
    footballExperience: "İleri",
    preferredFoot: "Sağ",
    height: 179,
    weight: 74,
    location: "Bağcılar",
    phone: "05557890123",
    bio: "Tecrübeli forvet oyuncusu, takım oyununa uyumlu. Gol ve asist dengesi iyi.",
    favoriteTeam: "Beşiktaş"
  }
];

async function addRealUsers() {
  try {
    console.log('MongoDB Atlas\'a bağlanılıyor...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB bağlantısı başarılı');
    
    console.log('Gerçek kullanıcılar ekleniyor...');
    
    // Mevcut kullanıcı sayısını kontrol et
    const existingUsers = await User.find({});
    console.log(`Mevcut kullanıcı sayısı: ${existingUsers.length}`);
    
    // Şifreleri hashle ve kullanıcıları ekle
    for (let userData of newUsers) {
      // Kullanıcı zaten var mı kontrol et
      const existingUser = await User.findOne({ 
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });
      
      if (existingUser) {
        console.log(`${userData.username} zaten mevcut, atlanıyor...`);
        continue;
      }
      
      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      // Kullanıcıyı oluştur
      const newUser = new User(userData);
      await newUser.save();
      
      console.log(`✅ ${userData.firstName} ${userData.lastName} (${userData.position}) eklendi`);
    }
    
    // Güncel kullanıcı sayısını göster
    const updatedUsers = await User.find({});
    console.log(`\n📊 Toplam kullanıcı sayısı: ${updatedUsers.length}`);
    
    // Pozisyona göre dağılımı göster
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

addRealUsers(); 