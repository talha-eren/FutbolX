// Backend Sunucu IP Bulucu
const { networkInterfaces } = require('os');
const fs = require('fs');
const path = require('path');

// Bilgisayarın tüm IP adreslerini bul
function getLocalIPAddresses() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // IPv4 adreslerini ve localhost olmayan adresleri al
      if (net.family === 'IPv4' && !net.internal) {
        results.push({
          name,
          address: net.address,
          netmask: net.netmask,
          cidr: net.cidr,
        });
      }
    }
  }

  return results;
}

// IP adresini networkConfig.js dosyasında güncelle
function updateConfigFile(ipAddress) {
  const configFilePath = path.join(__dirname, '..', 'services', 'networkConfig.js');
  
  try {
    // Dosya içeriğini oku
    let content = fs.readFileSync(configFilePath, 'utf8');
    
    // IP adresi satırını güncelle
    content = content.replace(
      /const MANUAL_BACKEND_IP = (['"])(.+)\1;/,
      `const MANUAL_BACKEND_IP = $1${ipAddress}$1;`
    );
    
    // Manuel bağlantıyı aktifleştir
    content = content.replace(
      /const USE_MANUAL_IP = (false|true);/,
      'const USE_MANUAL_IP = true;'
    );
    
    // Dosyayı yaz
    fs.writeFileSync(configFilePath, content);
    
    console.log(`✅ Backend IP adresi ${ipAddress} olarak güncellendi!`);
    console.log(`📄 Dosya güncellendi: ${configFilePath}`);
    console.log('🚀 Şimdi uygulamayı yeniden başlatın: npx expo start --clear');
    
    return true;
  } catch (error) {
    console.error('❌ Dosya güncellenirken hata oluştu:', error);
    return false;
  }
}

// Ana işlev
function main() {
  console.log('🔍 Backend sunucusu için IP adresleri aranıyor...');
  
  const ipAddresses = getLocalIPAddresses();
  
  if (ipAddresses.length === 0) {
    console.error('❌ Hiçbir IP adresi bulunamadı! Ağ bağlantınızı kontrol edin.');
    return;
  }
  
  console.log('\n📋 Bulunan IP adresleri:');
  ipAddresses.forEach((iface, index) => {
    console.log(`${index + 1}) ${iface.address} (${iface.name})`);
  });
  
  // En yaygın kullanılan IP adresini seç (genellikle WiFi)
  const wifiInterface = ipAddresses.find(iface => 
    iface.name.toLowerCase().includes('wi-fi') || 
    iface.name.toLowerCase().includes('wifi') ||
    iface.name.toLowerCase().includes('wlan')
  );
  
  const bestIP = wifiInterface ? wifiInterface.address : ipAddresses[0].address;
  
  console.log(`\n✅ En uygun IP adresi: ${bestIP}`);
  console.log('⚙️ Bu IP adresi, backend sunucunuzun IP adresi olarak kullanılacak.');
  
  const isSuccess = updateConfigFile(bestIP);
  
  if (isSuccess) {
    console.log('\n🔌 Backend bağlantı bilgileri:');
    console.log(`🌐 IP Adresi: ${bestIP}`);
    console.log('🔌 Port: 5000');
    console.log('🔗 API Yolu: /api');
    console.log('📱 Tam URL: http://' + bestIP + ':5000/api');
  }
}

// Betiği çalıştır
main(); 