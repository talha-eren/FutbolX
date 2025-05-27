const mongoose = require('mongoose');
const User = require('./models/User');

async function deleteAllTestUsers() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect('mongodb://localhost:27017/futbolx');
    console.log('✅ MongoDB bağlantısı başarılı');
    
    // Tüm test kullanıcılarını sil
    const deleteResult = await User.deleteMany({
      $or: [
        // Username'e göre test kullanıcıları
        { username: { $regex: /(guest|deneme|test|ahmet_kaleci|mehmet_defans|ali_defans|emre_ortasaha|burak_ortasaha|cem_ortasaha|serkan_forvet)/i } },
        // Name'e göre test kullanıcıları
        { name: { $regex: /(guest|deneme|test)/i } },
        // Email'e göre test kullanıcıları
        { email: { $regex: /(test\.com|example\.com)/i } }
      ]
    });
    
    console.log(`🗑️ ${deleteResult.deletedCount} test kullanıcısı silindi`);
    
    // Kalan gerçek kullanıcıları göster
    const remainingUsers = await User.find({}).select('username name email position');
    console.log(`\n📊 Kalan kullanıcı sayısı: ${remainingUsers.length}`);
    
    if (remainingUsers.length > 0) {
      console.log('\n👥 Kalan kullanıcılar:');
      remainingUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} | ${user.name || 'İsim yok'} | ${user.position || 'Pozisyon yok'} | ${user.email}`);
      });
      
      // Pozisyonlu kullanıcıları say
      const usersWithPosition = remainingUsers.filter(user => user.position && user.position.trim() !== '');
      console.log(`\n⚽ Pozisyonu olan kullanıcı sayısı: ${usersWithPosition.length}`);
      
      if (usersWithPosition.length > 0) {
        const positionCounts = usersWithPosition.reduce((acc, user) => {
          acc[user.position] = (acc[user.position] || 0) + 1;
          return acc;
        }, {});
        
        console.log('\n📊 Pozisyon dağılımı:');
        Object.entries(positionCounts).forEach(([position, count]) => {
          console.log(`   ${position}: ${count} kişi`);
        });
      }
    } else {
      console.log('⚠️ Hiç kullanıcı kalmadı!');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Temizlik tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

deleteAllTestUsers(); 