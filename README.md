# FutbolX - Futbol Tutkunu Sosyal Platform

<div align="center">
  <img src="https://placehold.co/600x400/4CAF50/FFFFFF/png?text=FutbolX+Logo" alt="FutbolX Logo" width="300"/>
  
  <p style="font-size: 20px; margin-top: 20px;">Futbol tutkunlarını buluşturan modern sosyal platform</p>
</div>

<br>

## 📱 Proje Hakkında

FutbolX, futbol severlerin bir araya gelerek içerik paylaşabilecekleri, halı saha maçı organize edebilecekleri ve futbol topluluğuna dahil olabilecekleri çok platformlu (web ve mobil) bir sosyal medya uygulamasıdır. Akıllı oyuncu eşleştirme sistemi ve yapay zeka destekli asistan ile futbol deneyimini bir üst seviyeye taşır.

<br>

## ✨ Özellikler

<br>

### 🔄 Temel Özellikler

- **Kullanıcı Profil Sistemi:** Futbol profilleri, beceri seviyeleri ve pozisyon tercihleri
- **Video Paylaşımı:** Maç, antrenman ve futbol beceri videoları
- **Sosyal Etkileşim:** Beğenme, yorum yapma ve içerik paylaşma
- **Gerçek Zamanlı Yorumlar:** Her gönderi için ayrı yorum sistemi
- **Tam Ekran Medya:** Videolar ve resimler için optimize edilmiş görüntüleme

<br>

### ⚽ Futbol Odaklı Özellikler

- **Halı Saha Rezervasyon:** En yakın halı sahaları bulma ve rezervasyon yapma
- **Akıllı Oyuncu Eşleştirme:** 7 kişilik takım sistemi ile pozisyon bazlı eşleştirme
- **Uyumluluk Analizi:** Oyuncular arası uyumluluk skorlama sistemi
- **Takım Oluşturma:** Yeni takımlar kurma ve turnuvalar organize etme
- **Konum Bazlı Öneriler:** Yakınınızdaki halı sahalar ve oyuncular
- **Pozisyon Renk Kodlama:** Kaleci (🟠), Defans (🔵), Orta Saha (🟢), Forvet (🔴)

<br>

### 🤖 Yapay Zeka Özellikleri

- **FutbolX AI Asistan:** 🤖 15+ komut türü ile akıllı yardımcı
- **Saha Rezervasyon Yardımı:** Otomatik saha önerisi ve fiyat karşılaştırması
- **Maç Organizasyon:** Akıllı maç kurma ve oyuncu davetiye sistemi
- **İstatistik Analizi:** Performans takibi ve gelişim grafikleri
- **Antrenman Programı:** Kişiselleştirilmiş antrenman önerileri
- **Hava Durumu Entegrasyonu:** Maç için uygun hava koşulları analizi

<br>

### 💬 İletişim Özellikleri

- **WhatsApp Entegrasyonu:** Oyuncularla doğrudan WhatsApp iletişimi
- **E-posta İletişimi:** Profesyonel e-posta iletişim seçenekleri
- **Gerçek Kullanıcı Bilgileri:** Yorumlarda gerçek isim görüntüleme
- **Anlık Mesajlaşma:** Oyuncular arası hızlı iletişim

<br>

### 🌐 Çok Platformlu Deneyim

- **Web Uygulaması:** Masaüstü bilgisayarlar için optimize edilmiş arayüz
- **Mobil Uygulama:** iOS ve Android cihazlar için native deneyim
- **Duyarlı Tasarım:** Tüm ekran boyutlarına uygun tasarım
- **Çevrimdışı Mod:** İnternet bağlantısı olmadan temel özellikler

<br>

## 🚀 Teknoloji Yığını

### Frontend
- **React Native (Expo):** Mobil uygulama geliştirme
- **TypeScript:** Tip güvenli kod geliştirme
- **Expo Router:** Modern navigasyon sistemi
- **React Native SVG:** Vektör grafik desteği
- **Linear Gradient:** Gradient arka plan efektleri

### Backend
- **Node.js:** Sunucu tarafı JavaScript
- **Express.js:** Web framework
- **MongoDB:** NoSQL veritabanı
- **Mongoose:** MongoDB object modeling
- **JWT:** Güvenli kimlik doğrulama

### Özel Servisler
- **PlayerMatchingService:** Akıllı oyuncu eşleştirme algoritması
- **NetworkConfig:** Merkezi ağ yapılandırması
- **Haversine Formula:** Mesafe hesaplama algoritması
- **AsyncStorage:** Yerel veri depolama

<br>

## 🏗️ Proje Yapısı

```
FutbolX/
├── app/                    # Expo Router yapısı
│   ├── (auth)/            # Giriş ve kayıt ekranları
│   ├── (tabs)/            # Ana uygulama sekmeleri
│   │   ├── index.tsx      # Ana sayfa
│   │   ├── profile.tsx    # Profil sayfası
│   │   ├── player-matching.tsx # Oyuncu eşleştirme
│   │   └── [...]          # Diğer sekmeler
│   ├── comments/          # Yorum sistemi
│   │   └── [postId].tsx   # Post bazlı yorumlar
│   └── [...]              # Diğer sayfalar
├── components/            # Yeniden kullanılabilir bileşenler
│   ├── ui/                # Temel UI bileşenleri
│   ├── PlayerMatching/    # Oyuncu eşleştirme bileşenleri
│   │   ├── CompatibilityScore.tsx
│   │   ├── PlayerMatchCard.tsx
│   │   └── MatchingFilters.tsx
│   ├── ChatBot.tsx        # FutbolX AI Asistan
│   └── [...]              # Diğer bileşenler
├── services/              # API ve veri işleme servisleri
│   ├── PlayerMatchingService.ts # Akıllı eşleştirme servisi
│   ├── networkConfig.js   # Ağ yapılandırması
│   └── [...]              # Diğer servisler
├── backend/               # Backend API
│   ├── models/            # Veritabanı modelleri
│   ├── routes/            # API rotaları
│   │   ├── comment.js     # Yorum API'si
│   │   ├── user.js        # Kullanıcı API'si
│   │   └── [...]          # Diğer rotalar
│   └── [...]              # Diğer backend dosyaları
├── hooks/                 # Custom React hooks
├── constants/             # Sabitler ve yapılandırma
└── assets/                # Resimler, fontlar ve diğer statik dosyalar
```

<br>

## 🎯 Yeni Eklenen Özellikler

### 🤖 FutbolX AI Asistan
- **Akıllı Sohbet Sistemi:** 15+ farklı komut türü
- **Saha Rezervasyon Yardımı:** Otomatik saha bulma ve rezervasyon
- **Oyuncu Eşleştirme:** Pozisyon ve seviye bazlı akıllı eşleştirme
- **Maç Organizasyon:** Hızlı maç kurma ve oyuncu davetiye
- **İstatistik Analizi:** Performans takibi ve gelişim önerileri
- **Antrenman Programı:** Kişiselleştirilmiş egzersiz planları

### 👥 Gelişmiş Oyuncu Eşleştirme
- **7 Kişilik Takım Sistemi:** 1 Kaleci, 2 Defans, 3 Orta Saha, 1 Forvet
- **Uyumluluk Skorlama:** Yaş, pozisyon, seviye ve mesafe bazlı analiz
- **Pozisyon Renk Kodlama:** Görsel pozisyon tanımlama sistemi
- **Favori Oyuncular:** Beğenilen oyuncuları kaydetme
- **Mesafe Filtreleme:** 5-50km arası mesafe ayarlama

### 💬 Gelişmiş İletişim
- **WhatsApp Entegrasyonu:** Türkiye (+90) formatında telefon desteği
- **E-posta İletişimi:** Profesyonel e-posta gönderimi
- **Gerçek İsim Görüntüleme:** Yorumlarda kullanıcıların gerçek isimleri
- **Detaylı Oyuncu Bilgileri:** Bio, istatistikler ve iletişim bilgileri

### 🎨 Gelişmiş UI/UX
- **Tam Ekran Gönderiler:** Minimum %60 ekran yüksekliği
- **Büyük Medya Görüntüleme:** %40 ekran yüksekliğinde medya
- **Modern Buton Tasarımı:** Büyük ve kullanıcı dostu butonlar
- **Minimal Boşluklar:** 2px kart marjinleri ile kompakt tasarım

<br>

## 📋 Geliştirme Zaman Çizelgesi

- **Hafta 1:** Temel Araştırma ✅ (Pazar araştırmaları, benzer uygulamaların incelenmesi)
- **Hafta 2-3:** Geliştirme Başlangıcı ✅ (Geliştirme ortamı, kütüphaneler, temel ekranlar)
- **Hafta 4-5:** Temel Özellikler ✅ (Kullanıcı profili, video yükleme, veritabanı bağlantıları)
- **Hafta 6-7:** Sosyal Özellikler ✅ (Rezervasyon sistemi, beğeni ve yorum sistemi)
- **Hafta 8-9:** Veri İşlemleri ✅ (Kullanıcı verileri, filtreleme, konum tabanlı öneriler)
- **Hafta 10-11:** Eşleştirme Sistemi ✅ (Oyuncu eşleştirme, takım oluşturma)
- **Hafta 12:** AI Asistan Entegrasyonu ✅ (FutbolX AI Asistan, akıllı komutlar)
- **Hafta 13:** İletişim Özellikleri ✅ (WhatsApp, e-posta entegrasyonu)
- **Hafta 14:** Test ve Yayın (Hata ayıklama, performans iyileştirmeleri, yayınlama)

<br>

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI (`npm install -g @expo/cli`)
- MongoDB (yerel veya cloud)

<br>

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/username/futbolx-mobile.git
cd futbolx-mobile

# Frontend bağımlılıklarını yükleyin
npm install
# veya
yarn install

# Backend bağımlılıklarını yükleyin
cd backend
npm install
cd ..

# Backend'i başlatın
cd backend
npm start
# Yeni terminal açın

# Frontend'i başlatın
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

## 🔧 Yapılandırma

### Ağ Yapılandırması
`services/networkConfig.js` dosyasında API URL'lerini güncelleyin:

```javascript
const API_BASE_URL = 'http://YOUR_IP:3000/api';
```

### MongoDB Bağlantısı
Backend `.env` dosyasında MongoDB connection string'ini ayarlayın:

```
MONGODB_URI=mongodb://localhost:27017/futbolx
JWT_SECRET=your_jwt_secret_key
```

<br>

## 🧪 Test Özellikleri

### Test Kullanıcıları
- Otomatik test kullanıcı verisi oluşturma
- Gerçek telefon numaraları ve e-posta adresleri
- Pozisyon ve konum bilgileri

### Debug Modu
- Detaylı console log'ları
- API yanıt takibi
- Hata ayıklama araçları

<br>

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesaj Formatı
- `feat:` Yeni özellik
- `fix:` Hata düzeltmesi
- `docs:` Dokümantasyon güncellemesi
- `style:` Kod formatı değişikliği
- `refactor:` Kod yeniden düzenleme
- `test:` Test ekleme/güncelleme

<br>

## 📊 Performans Metrikleri

- **Oyuncu Eşleştirme:** <2 saniye yanıt süresi
- **AI Asistan:** <1.5 saniye yanıt süresi
- **Video Yükleme:** Otomatik sıkıştırma ve optimizasyon
- **Çevrimdışı Mod:** Temel özellikler için offline destek

<br>

## 🔒 Güvenlik Özellikleri

- **JWT Token Kimlik Doğrulama:** Güvenli oturum yönetimi
- **Şifre Hashleme:** bcrypt ile güvenli şifre saklama
- **API Rate Limiting:** Spam koruması
- **Veri Validasyonu:** Giriş verilerinin doğrulanması

<br>

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

<br>

## 📧 İletişim

**Proje Sahibi:** Talha Eren Bilikci  

**E-posta:** [bilikcitalha@gmail.com](mailto:bilikcitalha@gmail.com)  

**Proje E-posta:** [info@futbolx.com](mailto:info@futbolx.com)

**GitHub:** [https://github.com/username/futbolx-mobile](https://github.com/username/futbolx-mobile)

<br>

## 🙏 Teşekkürler

- **Expo Team:** React Native geliştirme platformu için
- **MongoDB:** Esnek veritabanı çözümü için
- **React Native Community:** Açık kaynak kütüphaneler için

<br>

---

<div align="center">
  <p style="font-size: 18px; margin-top: 20px;">🤖 FutbolX AI Asistan ile Futbolun Yeni Sosyal Deneyimi</p>
  <p style="font-size: 14px; color: #666;">v2.0 - Akıllı Oyuncu Eşleştirme ve AI Asistan ile</p>
</div>
