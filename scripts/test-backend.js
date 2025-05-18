// Backend Bağlantı Test Aracı
const http = require('http');
const { networkInterfaces } = require('os');
const readline = require('readline');

// Renk kodları
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Yerel IP adreslerini al
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
        });
      }
    }
  }

  return results;
}

// Backend bağlantısını test et
function testBackendConnection(ip, port, path, timeout = 3000) {
  return new Promise((resolve) => {
    const url = `http://${ip}:${port}${path}`;
    console.log(`${colors.blue}🔗 Bağlantı testi: ${url}${colors.reset}`);

    const req = http.get(url, { timeout }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`${colors.green}✅ Bağlantı başarılı! Durum kodu: ${res.statusCode}${colors.reset}`);
          console.log(`${colors.cyan}📋 Yanıt: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}${colors.reset}`);
          resolve(true);
        } else {
          console.log(`${colors.yellow}⚠️ Yanıt alındı ama durum kodu başarısız: ${res.statusCode}${colors.reset}`);
          console.log(`${colors.yellow}📋 Yanıt: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}${colors.reset}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}❌ Bağlantı hatası: ${error.message}${colors.reset}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`${colors.yellow}⏱️ Zaman aşımı: ${timeout}ms${colors.reset}`);
      req.destroy();
      resolve(false);
    });
  });
}

// Kullanıcıdan girdi al
function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Olası backend endpoint'lerini kontrol et
const commonEndpoints = [
  '/health',
  '/api/health',
  '/ping',
  '/api/ping',
  '/status',
  '/api/status',
  '/api'
];

// Ana fonksiyon
async function main() {
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.cyan}🔍 Backend Bağlantı Test Aracı${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}`);
  
  const localIPs = getLocalIPAddresses();
  
  if (localIPs.length === 0) {
    console.log(`${colors.red}❌ Hiçbir IP adresi bulunamadı! Ağ bağlantınızı kontrol edin.${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.cyan}📋 Bilgisayarınızın IP adresleri:${colors.reset}`);
  localIPs.forEach((iface, index) => {
    console.log(`${colors.white}${index + 1}) ${iface.address} (${iface.name})${colors.reset}`);
  });
  
  // Backend sunucusunun port bilgisi
  const PORT = 5000;
  console.log(`\n${colors.cyan}📌 Backend sunucu portu: ${PORT}${colors.reset}`);
  
  // Backend sunucusuyla HTTP bağlantıları test et
  console.log(`\n${colors.cyan}🧪 Backend bağlantı testleri başlıyor...${colors.reset}`);
  console.log(`${colors.cyan}----------------------------------------${colors.reset}`);
  
  // Tüm IP'leri ve ortak endpoint'leri dene
  let connectionSuccess = false;
  let successfulEndpoint = '';
  let successfulIP = '';
  
  for (const iface of localIPs) {
    const ip = iface.address;
    console.log(`\n${colors.magenta}🌐 IP testi: ${ip} (${iface.name})${colors.reset}`);
    
    for (const endpoint of commonEndpoints) {
      const success = await testBackendConnection(ip, PORT, endpoint);
      if (success) {
        connectionSuccess = true;
        successfulEndpoint = endpoint;
        successfulIP = ip;
        break;
      }
    }
    
    if (connectionSuccess) {
      break;
    }
  }
  
  // Localhost'u dene
  if (!connectionSuccess) {
    console.log(`\n${colors.magenta}🌐 IP testi: localhost${colors.reset}`);
    
    for (const endpoint of commonEndpoints) {
      const success = await testBackendConnection('localhost', PORT, endpoint);
      if (success) {
        connectionSuccess = true;
        successfulEndpoint = endpoint;
        successfulIP = 'localhost';
        break;
      }
    }
  }
  
  // Sonuçları göster
  console.log(`\n${colors.cyan}======================================${colors.reset}`);
  if (connectionSuccess) {
    console.log(`${colors.green}✅ Backend bağlantısı başarılı!${colors.reset}`);
    console.log(`${colors.green}🔗 Çalışan URL: http://${successfulIP}:${PORT}${successfulEndpoint}${colors.reset}`);
    
    // networkConfig.js'yi nasıl güncelleyeceğimiz hakkında bilgi ver
    console.log(`\n${colors.cyan}📝 Önerilen Yapılandırma:${colors.reset}`);
    console.log(`${colors.white}1. services/networkConfig.js dosyasını açın${colors.reset}`);
    console.log(`${colors.white}2. MANUAL_BACKEND_IP değişkenini şu şekilde güncelleyin: '${successfulIP}'${colors.reset}`);
    console.log(`${colors.white}3. BACKEND_PATH değişkenini şu şekilde güncelleyin: '${successfulEndpoint.replace('/health', '').replace('/ping', '').replace('/status', '')}'${colors.reset}`);
    console.log(`${colors.white}4. USE_MANUAL_IP değişkenini true olarak ayarlayın${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Backend bağlantısı kurulamadı!${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Lütfen şunları kontrol edin:${colors.reset}`);
    console.log(`${colors.white}1. Backend sunucusunun çalışıp çalışmadığını${colors.reset}`);
    console.log(`${colors.white}2. Backend sunucusunun doğru portta (5000) dinlediğini${colors.reset}`);
    console.log(`${colors.white}3. Backend sunucusunun ve istemcinizin aynı ağda olduğunu${colors.reset}`);
    console.log(`${colors.white}4. Güvenlik duvarı ayarlarınızı${colors.reset}`);
    
    // Manuel test seçeneği sun
    const manualTest = await getUserInput(`\n${colors.yellow}Manuel bir IP adresi test etmek ister misiniz? (e/h): ${colors.reset}`);
    
    if (manualTest.toLowerCase() === 'e') {
      const customIP = await getUserInput(`${colors.cyan}Test edilecek IP adresini girin: ${colors.reset}`);
      const customEndpoint = await getUserInput(`${colors.cyan}Test edilecek endpoint'i girin (varsayılan: /api/health): ${colors.reset}`) || '/api/health';
      
      const success = await testBackendConnection(customIP, PORT, customEndpoint);
      
      if (success) {
        console.log(`\n${colors.green}✅ Manuel bağlantı başarılı!${colors.reset}`);
        console.log(`${colors.green}🔗 Çalışan URL: http://${customIP}:${PORT}${customEndpoint}${colors.reset}`);
        
        console.log(`\n${colors.cyan}📝 Önerilen Yapılandırma:${colors.reset}`);
        console.log(`${colors.white}1. services/networkConfig.js dosyasını açın${colors.reset}`);
        console.log(`${colors.white}2. MANUAL_BACKEND_IP değişkenini şu şekilde güncelleyin: '${customIP}'${colors.reset}`);
        console.log(`${colors.white}3. BACKEND_PATH değişkenini şu şekilde güncelleyin: '${customEndpoint.replace('/health', '').replace('/ping', '').replace('/status', '')}'${colors.reset}`);
        console.log(`${colors.white}4. USE_MANUAL_IP değişkenini true olarak ayarlayın${colors.reset}`);
      } else {
        console.log(`\n${colors.red}❌ Manuel bağlantı başarısız!${colors.reset}`);
      }
    }
  }
}

// Scripti çalıştır
main(); 