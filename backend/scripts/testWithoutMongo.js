// MongoDB olmadan test için basit simülasyon

// Örnek kullanıcı verileri
const mockUsers = [
  {
    _id: "test_id_1",
    username: "test",
    firstName: "Test",
    lastName: "User",
    position: "Kaleci",
    footballExperience: "Orta",
    preferredFoot: "Sağ",
    height: 185,
    weight: 80,
    location: "Kadıköy",
    phone: "05551234567",
    bio: "Deneyimli kaleci, refleksleri çok iyi.",
    favoriteTeam: "Fenerbahçe"
  },
  {
    _id: "test_id_2",
    username: "erentalhal",
    firstName: "Eren",
    lastName: "Talha",
    position: "Orta Saha",
    footballExperience: "İleri",
    preferredFoot: "Her İkisi",
    height: 175,
    weight: 72,
    location: "Beşiktaş",
    phone: "05552345678",
    bio: "Yaratıcı orta saha oyuncusu, pas kalitesi yüksek.",
    favoriteTeam: "Beşiktaş"
  },
  {
    _id: "test_id_3",
    username: "mehmet_kaleci",
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
    _id: "test_id_4",
    username: "ahmet_defans",
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
    _id: "test_id_5",
    username: "burak_ortasaha",
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
    _id: "test_id_6",
    username: "arda_forvet",
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

// Eşleştirme fonksiyonu simülasyonu
function simulatePlayerMatching(userId, filters = {}) {
  console.log('🎯 Oyuncu Eşleştirme Simülasyonu');
  console.log('================================');
  
  const { position, level, location } = filters;
  
  // Kullanıcının kendisini hariç tut
  let availableUsers = mockUsers.filter(user => user._id !== userId);
  
  console.log(`📊 Toplam kullanıcı sayısı: ${mockUsers.length}`);
  console.log(`🔍 Eşleştirme için uygun kullanıcılar: ${availableUsers.length}`);
  
  // Filtreleri uygula
  if (position && position !== 'Hepsi') {
    availableUsers = availableUsers.filter(user => user.position === position);
    console.log(`🎯 Pozisyon filtresi (${position}): ${availableUsers.length} kullanıcı`);
  }
  
  if (level && level !== 'Hepsi') {
    const levelMap = {
      'başlangıç': 'Başlangıç',
      'orta': 'Orta', 
      'ileri': 'İleri'
    };
    availableUsers = availableUsers.filter(user => user.footballExperience === levelMap[level]);
    console.log(`📈 Seviye filtresi (${level}): ${availableUsers.length} kullanıcı`);
  }
  
  if (location && location.district) {
    availableUsers = availableUsers.filter(user => 
      user.location.toLowerCase().includes(location.district.toLowerCase())
    );
    console.log(`📍 Lokasyon filtresi (${location.district}): ${availableUsers.length} kullanıcı`);
  }
  
  // Kullanıcıları player formatına dönüştür
  const formattedUsers = availableUsers.map(user => ({
    _id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    position: user.position,
    level: user.footballExperience === 'Başlangıç' ? 'başlangıç' : 
           user.footballExperience === 'Orta' ? 'orta' : 
           user.footballExperience === 'İleri' ? 'ileri' : 'başlangıç',
    contactNumber: user.phone || 'Belirtilmemiş',
    description: user.bio || `${user.position} pozisyonunda oynayan gerçek oyuncu`,
    location: {
      city: 'İstanbul',
      district: user.location || 'Belirtilmemiş'
    },
    isActive: true,
    isApproved: true,
    favoriteTeam: user.favoriteTeam || '',
    createdBy: {
      username: user.username,
      email: `${user.username}@example.com`
    },
    stats: {
      attack: user.position === 'Forvet' ? 80 : user.position === 'Orta Saha' ? 70 : 40,
      defense: user.position === 'Kaleci' ? 90 : user.position === 'Defans' ? 85 : 50,
      speed: user.position === 'Forvet' ? 85 : user.position === 'Orta Saha' ? 80 : 60,
      teamwork: 75
    },
    preferredTime: '20:00',
    regularPlayDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
    rating: 0,
    matches: [],
    userType: 'real'
  }));
  
  console.log('\n✅ Eşleşen Oyuncular:');
  console.log('====================');
  
  if (formattedUsers.length === 0) {
    console.log('❌ Hiç eşleşme bulunamadı.');
  } else {
    formattedUsers.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name}`);
      console.log(`   📍 Pozisyon: ${player.position}`);
      console.log(`   📈 Seviye: ${player.level}`);
      console.log(`   📞 Telefon: ${player.contactNumber}`);
      console.log(`   🏠 Lokasyon: ${player.location.district}`);
      console.log(`   ⚽ Favori Takım: ${player.favoriteTeam}`);
      console.log(`   📝 Bio: ${player.description}`);
      console.log('   ─────────────────────────────');
    });
  }
  
  return {
    success: true,
    data: formattedUsers,
    message: `${formattedUsers.length} gerçek kullanıcı eşleşmesi bulundu`
  };
}

// Test senaryoları
console.log('🚀 FutbolX Oyuncu Eşleştirme Sistemi Test');
console.log('==========================================\n');

// Test 1: Tüm oyuncuları listele
console.log('📋 Test 1: Tüm Oyuncuları Listele');
simulatePlayerMatching('test_id_1', {});

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Kaleci pozisyonu filtresi
console.log('📋 Test 2: Kaleci Pozisyonu Filtresi');
simulatePlayerMatching('test_id_1', { position: 'Kaleci' });

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Orta Saha + İleri seviye filtresi
console.log('📋 Test 3: Orta Saha + İleri Seviye Filtresi');
simulatePlayerMatching('test_id_1', { position: 'Orta Saha', level: 'ileri' });

console.log('\n' + '='.repeat(50) + '\n');

// Test 4: Lokasyon filtresi
console.log('📋 Test 4: Beşiktaş Lokasyon Filtresi');
simulatePlayerMatching('test_id_1', { location: { district: 'Beşiktaş' } });

console.log('\n✅ Tüm testler tamamlandı!');
console.log('\n💡 MongoDB kurulduğunda gerçek veritabanı ile test edebilirsiniz.');
console.log('📋 MongoDB kurulum: https://www.mongodb.com/try/download/community'); 