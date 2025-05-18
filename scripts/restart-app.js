// Uygulama Yeniden Başlatma ve Bağlantı Test Aracı
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
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

// networkConfig.js dosyasının yolu
const networkConfigPath = path.join(__dirname, '..', 'services', 'networkConfig.js');
// api.ts dosyasının yolu
const apiTsPath = path.join(__dirname, '..', 'services', 'api.ts');

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

// AsyncStorage temizleme komutunu çalıştır
function clearExpoStorage() {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}🧹 Expo önbelleğini temizleniyor...${colors.reset}`);
    
    exec('npx expo-cli start --clear', (error) => {
      if (error) {
        console.log(`${colors.yellow}⚠️ Expo önbellek temizleme uyarısı (önemli değil): ${error.message}${colors.reset}`);
      }
      resolve();
    });
  });
}

// Ana fonksiyon
async function main() {
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.cyan}🔄 Uygulama Yeniden Başlatma ve Bağlantı Test Aracı${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}`);
  
  // Backend IP adresi
  const BACKEND_IP = '192.168.1.90';
  const BACKEND_PORT = 5000;
  
  // Backend bağlantısını test et
  console.log(`${colors.cyan}🧪 Backend bağlantı testleri başlıyor...${colors.reset}`);
  console.log(`${colors.cyan}----------------------------------------${colors.reset}`);
  
  // Health endpointi testi
  const isHealthEndpointWorking = await testBackendConnection(BACKEND_IP, BACKEND_PORT, '/api/health');
  
  if (!isHealthEndpointWorking) {
    console.log(`${colors.red}❌ Backend sunucu çalışmıyor veya erişilemiyor!${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Lütfen backend sunucunuzun çalıştığından emin olun.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.green}✅ Backend sunucusu çalışıyor!${colors.reset}`);
  
  // networkConfig.js dosyasını kontrol et
  if (fs.existsSync(networkConfigPath)) {
    console.log(`${colors.cyan}📄 networkConfig.js dosyası kontrol ediliyor...${colors.reset}`);
    
    let content = fs.readFileSync(networkConfigPath, 'utf8');
    
    // Manuel IP adresini güncelle
    if (!content.includes(`const MANUAL_BACKEND_IP = '${BACKEND_IP}'`)) {
      content = content.replace(
        /const MANUAL_BACKEND_IP = ['"](.+)['"]/,
        `const MANUAL_BACKEND_IP = '${BACKEND_IP}'`
      );
      
      // Manuel IP kullanımını aktifleştir
      content = content.replace(
        /const USE_MANUAL_IP = (false|true)/,
        'const USE_MANUAL_IP = true'
      );
      
      fs.writeFileSync(networkConfigPath, content);
      console.log(`${colors.green}✅ networkConfig.js dosyası güncellendi!${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ networkConfig.js dosyası zaten güncel!${colors.reset}`);
    }
  }
  
  // api.ts dosyasını kontrol et
  if (fs.existsSync(apiTsPath)) {
    console.log(`${colors.cyan}📄 api.ts dosyası kontrol ediliyor...${colors.reset}`);
    
    let content = fs.readFileSync(apiTsPath, 'utf8');
    
    // Metro IP'yi güncelle
    let updated = false;
    
    if (content.includes(`const METRO_IP = '192.168.1.49'`)) {
      content = content.replace(
        /const METRO_IP = ['"]192\.168\.1\.49["']/g,
        `const METRO_IP = '${BACKEND_IP}'`
      );
      updated = true;
    }
    
    // ALTERNATIVE_IPS listesini güncelle
    if (!content.includes(`'${BACKEND_IP}',`)) {
      content = content.replace(
        /const ALTERNATIVE_IPS = \[/,
        `const ALTERNATIVE_IPS = [\n  '${BACKEND_IP}',    // Güncel doğru IP\n`
      );
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(apiTsPath, content);
      console.log(`${colors.green}✅ api.ts dosyası güncellendi!${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ api.ts dosyası zaten güncel!${colors.reset}`);
    }
  }
  
  // Expo önbelleğini temizle
  await clearExpoStorage();
  
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.green}✅ Tüm gerekli dosyalar güncellendi!${colors.reset}`);
  console.log(`${colors.cyan}----------------------------------------${colors.reset}`);
  console.log(`${colors.magenta}🚀 Şimdi uygulamayı şu komutla yeniden başlatın:${colors.reset}`);
  console.log(`${colors.white}npx expo start --clear${colors.reset}`);
  console.log(`${colors.cyan}----------------------------------------${colors.reset}`);
  console.log(`${colors.yellow}📱 iPhone'unuzla bağlanmak için, QR kodu okutun!${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}`);
}

// Uygulamayı çalıştır
main(); 