// Otomatik Backend Algılama ve Bağlantı Scripti
const { exec, spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');

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

// networkConfig.js dosyasının yolu
const networkConfigPath = path.join(__dirname, '..', 'services', 'networkConfig.js');
// api.ts dosyasının yolu
const apiTsPath = path.join(__dirname, '..', 'services', 'api.ts');
// Backend klasörünün yolu
const backendPath = path.join(__dirname, '..', 'backend');

// Backend sunucu port
const BACKEND_PORT = 5000;

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

// Yerel IP adresini tespit et
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let ipAddress = null;

  // Tüm ağ arayüzlerini tara
  Object.keys(interfaces).forEach(devName => {
    const iface = interfaces[devName];
    iface.forEach(info => {
      // IPv4 ve lokal olmayan adresleri kontrol et
      if (info.family === 'IPv4' && !info.internal) {
        console.log(`${colors.cyan}📡 IP Adresi Bulundu: ${info.address} (${devName})${colors.reset}`);
        // Wi-Fi arayüzünü tercih et
        if (devName.toLowerCase().includes('wi-fi') || devName.toLowerCase().includes('wifi') || devName.toLowerCase().includes('wlan')) {
          ipAddress = info.address;
        } else if (!ipAddress) {
          // Eğer Wi-Fi bulunamazsa ilk bulunan IP'yi kullan
          ipAddress = info.address;
        }
      }
    });
  });

  if (ipAddress) {
    console.log(`${colors.green}✅ Kullanılacak IP: ${ipAddress}${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ IP adresi bulunamadı!${colors.reset}`);
  }

  return ipAddress;
}

// Çalışan backend kontrolü
async function checkRunningBackend(ip, port) {
  // Backend sağlık kontrolü
  try {
    const isRunning = await testBackendConnection(ip, port, '/api/health');
    if (isRunning) {
      console.log(`${colors.green}✅ Backend zaten çalışıyor! (${ip}:${port})${colors.reset}`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Config dosyalarını güncelle
function updateConfigFiles(ipAddress) {
  let updated = false;

  try {
    // 1. networkConfig.js dosyasını güncelle
    if (fs.existsSync(networkConfigPath)) {
      console.log(`${colors.cyan}📄 networkConfig.js dosyası güncelleniyor...${colors.reset}`);
      
      let content = fs.readFileSync(networkConfigPath, 'utf8');
      
      // Manuel IP adresini güncelle
      if (!content.includes(`const MANUAL_BACKEND_IP = '${ipAddress}'`)) {
        content = content.replace(
          /const MANUAL_BACKEND_IP = ['"](.+)['"]/,
          `const MANUAL_BACKEND_IP = '${ipAddress}'`
        );
        
        // Manuel IP kullanımını aktifleştir
        content = content.replace(
          /const USE_MANUAL_IP = (false|true)/,
          'const USE_MANUAL_IP = true'
        );
        
        // IP_PRIORITIES listelerini güncelle
        try {
          content = content.replace(
            /ios: \[[^\]]+\]/,
            `ios: ["${ipAddress}", "192.168.1.59", "192.168.1.49", "localhost", "127.0.0.1", "10.0.2.2"]`
          );
          
          content = content.replace(
            /android: \[[^\]]+\]/,
            `android: ["${ipAddress}", "192.168.1.59", "192.168.1.49", "10.0.2.2", "localhost", "127.0.0.1"]`
          );
          
          content = content.replace(
            /default: \[[^\]]+\]/,
            `default: ["${ipAddress}", "192.168.1.59", "192.168.1.49", "localhost", "127.0.0.1"]`
          );
        } catch (regexError) {
          console.log(`${colors.yellow}⚠️ IP listelerini güncellerken hata: ${regexError.message}${colors.reset}`);
          // Hata olursa devam et
        }
        
        fs.writeFileSync(networkConfigPath, content);
        console.log(`${colors.green}✅ networkConfig.js dosyası güncellendi!${colors.reset}`);
        updated = true;
      } else {
        console.log(`${colors.green}✅ networkConfig.js dosyası zaten güncel.${colors.reset}`);
      }
    }
    
    // 2. api.ts dosyasını güncelle
    if (fs.existsSync(apiTsPath)) {
      console.log(`${colors.cyan}📄 api.ts dosyası güncelleniyor...${colors.reset}`);
      
      let content = fs.readFileSync(apiTsPath, 'utf8');
      let apiUpdated = false;
      
      // METRO_IP değişkenlerini güncelle - bulunabilecek her iki yeri de güncelle
      if (content.includes(`const METRO_IP = '`) && !content.includes(`const METRO_IP = '${ipAddress}'`)) {
        content = content.replace(
          /const METRO_IP = ['"][^'"]+['"]/g,
          `const METRO_IP = '${ipAddress}'`
        );
        apiUpdated = true;
      }
      
      // ALTERNATIVE_IPS listesini güncelle
      if (!content.includes(`'${ipAddress}',`)) {
        try {
          content = content.replace(
            /const ALTERNATIVE_IPS = \[([^\]]*)\]/s,
            `const ALTERNATIVE_IPS = [\n  '${ipAddress}',    // Otomatik algılanan IP\n$1]`
          );
          apiUpdated = true;
        } catch (error) {
          console.log(`${colors.yellow}⚠️ ALTERNATIVE_IPS listesini güncellerken hata: ${error.message}${colors.reset}`);
        }
      }
      
      if (apiUpdated) {
        fs.writeFileSync(apiTsPath, content);
        console.log(`${colors.green}✅ api.ts dosyası güncellendi!${colors.reset}`);
        updated = true;
      } else {
        console.log(`${colors.green}✅ api.ts dosyası zaten güncel.${colors.reset}`);
      }
    }
    
    return updated;
  } catch (error) {
    console.error(`${colors.red}❌ Dosya güncelleme hatası: ${error.message}${colors.reset}`);
    return false;
  }
}

// Backend sunucusunu başlat
function startBackendServer() {
  console.log(`${colors.cyan}🚀 Backend sunucusu başlatılıyor...${colors.reset}`);
  
  // Backend klasörünün varlığını kontrol et
  if (!fs.existsSync(backendPath)) {
    console.log(`${colors.red}❌ Backend klasörü bulunamadı: ${backendPath}${colors.reset}`);
    return null;
  }
  
  try {
    // Backend klasörüne git ve server.js varlığını kontrol et
    const serverJsPath = path.join(backendPath, 'server.js');
    if (!fs.existsSync(serverJsPath)) {
      console.log(`${colors.red}❌ server.js dosyası bulunamadı: ${serverJsPath}${colors.reset}`);
      return null;
    }
    
    // Backend klasörüne git
    process.chdir(backendPath);
    console.log(`${colors.cyan}📂 Çalışma dizini değiştirildi: ${process.cwd()}${colors.reset}`);
    
    // Backend sunucusunu başlat
    console.log(`${colors.cyan}⚙️ "node server.js" komutu çalıştırılıyor...${colors.reset}`);
    
    // Detached modda sunucuyu başlat ve hemen dönüş yap
    const backendProcess = spawn('node', ['server.js'], {
      detached: true,
      stdio: 'ignore', // 'inherit' kullanmak yerine 'ignore' kullanarak arka planda çalışmasını sağla
      shell: true
    });
    
    // Ana işlemden ayır
    backendProcess.unref();
    
    console.log(`${colors.green}✅ Backend sunucusu arka planda başlatıldı (PID: ${backendProcess.pid})${colors.reset}`);
    return backendProcess.pid;
  } catch (error) {
    console.error(`${colors.red}❌ Backend sunucusu başlatılamadı: ${error.message}${colors.reset}`);
    return null;
  }
}

// Expo uygulamasını başlat
function startExpoApp() {
  try {
    // Ana dizine dön
    const rootPath = path.join(__dirname, '..');
    process.chdir(rootPath);
    console.log(`${colors.cyan}📂 Çalışma dizini değiştirildi: ${process.cwd()}${colors.reset}`);
    
    console.log(`${colors.cyan}🚀 Expo uygulaması başlatılıyor...${colors.reset}`);
    console.log(`${colors.cyan}⚙️ "npx expo start --clear" komutu çalıştırılıyor...${colors.reset}`);
    
    // Expo başlatıldıktan sonra script işlemini sonlandırmak için exec yerine execSync kullan
    execSync('npx expo start --clear', { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Expo başlatılamadı: ${error.message}${colors.reset}`);
    return false;
  }
}

// Ana fonksiyon
async function main() {
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.cyan}🔄 Otomatik Backend Algılama ve Bağlantı${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}`);
  
  // 1. Yerel IP adresini tespit et
  const localIP = getLocalIP();
  if (!localIP) {
    console.log(`${colors.red}❌ IP adresi tespit edilemedi! İşlem durduruluyor.${colors.reset}`);
    return;
  }
  
  // 2. Backend'in zaten çalışıp çalışmadığını kontrol et
  const isBackendRunning = await checkRunningBackend(localIP, BACKEND_PORT);
  
  // 3. Backend çalışmıyorsa başlat
  if (!isBackendRunning) {
    console.log(`${colors.yellow}⚠️ Backend sunucusu çalışmıyor, başlatılıyor...${colors.reset}`);
    const backendPID = startBackendServer();
    
    if (!backendPID) {
      console.log(`${colors.yellow}⚠️ Backend sunucusu başlatılamadı. Manuel olarak başlatmanız gerekebilir:${colors.reset}`);
      console.log(`${colors.white}cd backend && node server.js${colors.reset}`);
    } else {
      // Backend sunucusunun hazır olmasını bekle
      console.log(`${colors.cyan}⏳ Backend sunucusunun hazır olması bekleniyor (5 saniye)...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // 4. Config dosyalarını güncelle
  updateConfigFiles(localIP);
  
  // 5. Expo uygulamasını başlat
  console.log(`${colors.cyan}⏳ Expo uygulaması başlatılıyor...${colors.reset}`);
  startExpoApp();
}

// Uygulamayı çalıştır
main().catch(error => {
  console.error(`${colors.red}❌ Beklenmeyen hata: ${error.message}${colors.reset}`);
}); 