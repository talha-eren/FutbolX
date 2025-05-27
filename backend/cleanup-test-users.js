const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanupTestUsers() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect('mongodb://localhost:27017/futbolx', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB bağlantısı başarılı');
    
    // Test kullanıcı username'lerini tanımla
    const testUsernames = [
      'ahmet_kaleci', 
      'mehmet_defans', 
      'ali_defans', 
      'emre_ortasaha', 
      'burak_ortasaha', 
      'cem_ortasaha', 
      'serkan_forvet'
    ];
    
    console.log('🗑️ Test kullanıcıları siliniyor...');
    
    // Test kullanıcılarını sil
    const deleteResult = await User.deleteMany({
      username: { $in: testUsernames }
    });
    
    console.log(`✅ ${deleteResult.deletedCount} test kullanıcısı silindi`);
    
    // Test email'leri de sil
    const testEmails = [
      'ahmet@test.com',
      'mehmet@test.com', 
      'ali@test.com',
      'emre@test.com',
      'burak@test.com',
      'cem@test.com',
      'serkan@test.com'
    ];
    
    const deleteByEmailResult = await User.deleteMany({
      email: { $in: testEmails }
    });
    
    console.log(`✅ ${deleteByEmailResult.deletedCount} test email'li kullanıcı silindi`);
    
    // Kalan gerçek kullanıcıları göster
    const remainingUsers = await User.find({}).select('username name email position');
    console.log(`\n📊 Kalan gerçek kullanıcı sayısı: ${remainingUsers.length}`);
    
    if (remainingUsers.length > 0) {
      console.log('\n👥 Gerçek kullanıcılar:');
      remainingUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} | ${user.name || 'İsim yok'} | ${user.position || 'Pozisyon yok'} | ${user.email}`);
      });
      
      // Pozisyon dağılımını göster
      const positionCounts = remainingUsers.reduce((acc, user) => {
        const position = user.position || 'Tanımsız';
        acc[position] = (acc[position] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Pozisyon dağılımı:');
      Object.entries(positionCounts).forEach(([position, count]) => {
        console.log(`   ${position}: ${count} kişi`);
      });
    } else {
      console.log('⚠️ Hiç gerçek kullanıcı bulunamadı!');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Temizlik tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

cleanupTestUsers(); 