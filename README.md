# FutbolX - Futbol Tutkunu Sosyal Platform

<div align="center">
  <img src="https://placehold.co/600x400/4CAF50/FFFFFF/png?text=FutbolX+Logo" alt="FutbolX Logo" width="300"/>
  
  <p style="font-size: 20px; margin-top: 20px;">Futbol tutkunlarını buluşturan modern sosyal platform</p>
</div>

<br>

## 📱 Proje Hakkında

FutbolX, futbol severlerin bir araya gelerek içerik paylaşabilecekleri, halı saha maçı organize edebilecekleri ve futbol topluluğuna dahil olabilecekleri çok platformlu (web ve mobil) bir sosyal medya uygulamasıdır. 

<br>

## ✨ Özellikler

<br>

### 🔄 Temel Özellikler

- **Kullanıcı Profil Sistemi:** Futbol profilleri, beceri seviyeleri ve pozisyon tercihleri

- **Video Paylaşımı:** Maç, antrenman ve futbol beceri videoları

- **Sosyal Etkileşim:** Beğenme, yorum yapma ve içerik paylaşma

<br>

### ⚽ Futbol Odaklı Özellikler

- **Halı Saha Rezervasyon:** En yakın halı sahaları bulma ve rezervasyon yapma

- **Oyuncu Eşleştirme:** Eksik oyuncuları maçlar için bulma

- **Takım Oluşturma:** Yeni takımlar kurma ve turnuvalar organize etme

- **Konum Bazlı Öneriler:** Yakınınızdaki halı sahalar ve oyuncular

<br>

### 🌐 Çok Platformlu Deneyim

- **Web Uygulaması:** Masaüstü bilgisayarlar için optimize edilmiş arayüz

- **Mobil Uygulama:** iOS ve Android cihazlar için native deneyim

- **Duyarlı Tasarım:** Tüm ekran boyutlarına uygun tasarım

<br>

## 🚀 Teknoloji Yığını

- **Frontend:** React Native (Mobil), React (Web)

- **State Yönetimi:** React Context ve Hooks

- **Stilizasyon:** StyleSheet, CSS

- **Navigasyon:** Expo Router

- **Platformlar:** iOS, Android, Web

<br>

## 🏗️ Proje Yapısı

```
FutbolX/
├── app/              # Expo Router yapısı
│   ├── (auth)/       # Giriş ve kayıt ekranları
│   ├── (tabs)/       # Ana uygulama sekmeleri
│   └── [...]         # Diğer sayfalar
├── components/       # Yeniden kullanılabilir bileşenler
│   ├── ui/           # Temel UI bileşenleri
│   └── [...]         # Diğer bileşen kategorileri
├── hooks/            # Custom React hooks
├── constants/        # Sabitler ve yapılandırma
├── services/         # API ve veri işleme servisleri
└── assets/           # Resimler, fontlar ve diğer statik dosyalar
```

<br>

## 📋 Geliştirme Zaman Çizelgesi

- **Hafta 1:** Temel Araştırma (Pazar araştırmaları, benzer uygulamaların incelenmesi)

- **Hafta 2-3:** Geliştirme Başlangıcı ✅ (Geliştirme ortamı, kütüphaneler, temel ekranlar)

- **Hafta 4-5:** Temel Özellikler (Kullanıcı profili, video yükleme, veritabanı bağlantıları)

- **Hafta 6-7:** Sosyal Özellikler (Rezervasyon sistemi, beğeni ve yorum sistemi)

- **Hafta 8-9:** Veri İşlemleri (Kullanıcı verileri, filtreleme, konum tabanlı öneriler)

- **Hafta 10-11:** Eşleştirme Sistemi (Oyuncu eşleştirme, takım oluşturma)

- **Hafta 12-14:** Test ve Yayın (Hata ayıklama, performans iyileştirmeleri, yayınlama)

<br>

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Expo CLI (`npm install -g expo-cli`)

<br>

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/username/futbolx.git
cd futbolx

# Bağımlılıkları yükleyin
npm install
# veya
yarn install

# Uygulamayı başlatın
npm start
# veya
yarn start
```

<br>

### Platformlara Göre Çalıştırma

```bash
# Web için
npm run web
# veya
yarn web

# iOS için (MacOS gerektirir)
npm run ios
# veya
yarn ios

# Android için
npm run android
# veya
yarn android
```

<br>

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

<br>

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

<br>

## 📧 İletişim

**Proje Sahibi:** Talha Eren Bilikci  

**E-posta:** [bilikcitalha@gmail.com](mailto:bilikcitalha@gmail.com)  

**Proje E-posta:** [info@futbolx.com](mailto:info@futbolx.com)

<br>

---

<div align="center">
  <p style="font-size: 18px; margin-top: 20px;">FutbolX - Futbolun yeni sosyal deneyimi</p>
</div>

# FutbolX - Halı Saha Rezervasyon Sistemi

FutbolX, futbol severlerin halı saha rezervasyonu yapabileceği, oyuncu bulabileceği ve maç organize edebileceği kapsamlı bir web uygulamasıdır.

## 🆕 Yeni Özellik: AI Asistan

FutbolX artık yapay zeka destekli bir asistan ile geliyor! 🤖

### AI Asistan Özellikleri:

- **Akıllı Rezervasyon Önerileri**: Kullanıcı profiline ve geçmiş rezervasyonlara göre kişiselleştirilmiş öneriler
- **Oyuncu Eşleştirme**: Seviye ve pozisyona uygun oyuncu bulma yardımı
- **Dinamik Fiyat Hesaplama**: Gerçek zamanlı fiyat hesaplama ve indirim bilgileri
- **Sayfa Bazlı Yardım**: Bulunduğunuz sayfaya özel akıllı öneriler
- **Hızlı Eylemler**: Sık kullanılan işlemler için hızlı erişim butonları
- **Doğal Dil İşleme**: Türkçe sorularınızı anlayıp uygun yanıtlar verme

### AI Asistan Nasıl Kullanılır:

1. **Erişim**: Sayfanın sağ alt köşesindeki 🤖 simgesine tıklayın
2. **Soru Sorma**: Doğal dil ile sorularınızı yazın
3. **Hızlı Eylemler**: Önceden tanımlanmış butonları kullanın
4. **Akıllı Öneriler**: Size özel önerileri inceleyin

### Örnek Sorular:

- "Bugün 19:00 için hangi sahalar müsait?"
- "Hafta sonu fiyatları nedir?"
- "Benim seviyemde oyuncu var mı?"
- "En popüler saatler hangileri?"
- "Saha rezervasyonu nasıl yapılır?"

## 🚀 Özellikler

### Temel Özellikler
- **Kullanıcı Yönetimi**: Kayıt, giriş, profil yönetimi
- **Saha Rezervasyonu**: Tarih/saat seçimi, online ödeme
- **Oyuncu Eşleştirme**: Seviye bazlı oyuncu bulma
- **Takım Yönetimi**: Takım oluşturma ve yönetimi
- **Maç Organizasyonu**: Maç planlama ve katılımcı yönetimi
- **İstatistik Takibi**: Kişisel performans analizi

### Gelişmiş Özellikler
- **AI Destekli Asistan**: 7/24 akıllı yardım
- **Video Paylaşımı**: Maç anları paylaşma
- **Sosyal Feed**: Topluluk etkileşimi
- **Çoklu Dil Desteği**: Türkçe ve İngilizce
- **Responsive Tasarım**: Mobil uyumlu arayüz
- **Admin Paneli**: Sistem yönetimi

## 🛠️ Teknolojiler

### Frontend
- **React.js**: Modern kullanıcı arayüzü
- **Material-UI**: Profesyonel tasarım bileşenleri
- **React Router**: Sayfa yönlendirme
- **Axios**: API iletişimi

### AI Asistan
- **Doğal Dil İşleme**: Türkçe soru-cevap sistemi
- **Akıllı Öneriler**: Kullanıcı davranış analizi
- **Dinamik İçerik**: Sayfa bazlı kişiselleştirme
- **Gerçek Zamanlı Yanıtlar**: Hızlı ve akıllı cevaplar

### Backend
- **Node.js**: Sunucu tarafı geliştirme
- **Express.js**: Web framework
- **MongoDB**: Veritabanı
- **JWT**: Güvenli kimlik doğrulama

## 📦 Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/username/futbolx-web.git
cd futbolx-web
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm start
```

4. **AI Asistan Test Etme**
   - Uygulamayı açın (http://localhost:3000)
   - Sağ alt köşedeki 🤖 simgesine tıklayın
   - "Merhaba" yazarak AI asistanı test edin

## 🎯 AI Asistan Kullanım Örnekleri

### Rezervasyon Yardımı
```
Kullanıcı: "Yarın akşam saha rezerve etmek istiyorum"
AI: "Yarın akşam için müsait saatler: 18:00, 19:00, 20:00, 21:00. 
     Hangi saati tercih edersiniz? Ayrıca hafta içi fiyatı 150₺/saat."
```

### Oyuncu Bulma
```
Kullanıcı: "Orta seviyede forvet arıyorum"
AI: "Orta seviyede 12 forvet oyuncusu bulundu! Yakınınızda 5 aktif 
     oyuncu var. Onlarla iletişime geçmek ister misiniz?"
```

### Fiyat Bilgisi
```
Kullanıcı: "Hafta sonu fiyatları nedir?"
AI: "Hafta sonu fiyatlarımız: 200₺/saat. Öğrenci iseniz %20 indirim 
     kazanabilirsiniz. Erken rezervasyon için ek indirimler mevcut!"
```

## 🔧 AI Asistan Konfigürasyonu

AI Asistan ayarları `src/services/aiService.js` dosyasında yapılandırılabilir:

```javascript
// Özel yanıt ekleme
const customResponses = {
  'özel_anahtar': {
    keywords: ['anahtar1', 'anahtar2'],
    response: 'Özel yanıt metni'
  }
};

// Dinamik fiyat hesaplama
const pricingConfig = {
  basePrice: 150,
  weekendSurcharge: 50,
  studentDiscount: 0.2
};
```

## 📱 Responsive Tasarım

AI Asistan tüm cihazlarda mükemmel çalışır:
- **Desktop**: Tam özellikli chat arayüzü
- **Tablet**: Optimize edilmiş layout
- **Mobil**: Dokunmatik dostu tasarım

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/ai-improvement`)
3. Değişikliklerinizi commit edin (`git commit -am 'AI asistan geliştirmeleri'`)
4. Branch'inizi push edin (`git push origin feature/ai-improvement`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **E-posta**: bilikcitalha@gmail.com
- **GitHub**: [FutbolX Repository](https://github.com/username/futbolx-web)

## 🎉 AI Asistan ile Yeni Deneyim

FutbolX AI Asistanı ile:
- ⚡ Daha hızlı rezervasyon yapın
- 🎯 Uygun oyuncuları kolayca bulun
- 💡 Akıllı önerilerden faydalanın
- 🤖 7/24 yardım alın

**Hemen deneyin ve farkı yaşayın!** 🚀

![Ekran görüntüsü 2025-06-09 154106](https://github.com/user-attachments/assets/cd558e5b-5b9f-4669-84de-d9875050a7e2)

