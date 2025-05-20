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

Bu projede halı saha rezervasyon sistemi geliştirilmiştir. Kullanıcılar halı saha rezervasyonu yapabilir, admin ise rezervasyonları yönetebilir.

## Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
```
npm install
```

2. Backend ve frontend uygulamalarını eş zamanlı başlatın:
```
npm run dev
```

## Admin Kullanıcısı Oluşturma

Talha Eren kullanıcısını admin yapmak için aşağıdaki komutu çalıştırın:
```
npm run make-admin
```

Bu komut, `talhaeren` kullanıcısını süper admin olarak ayarlar ve rezervasyonları yönetme yetkisi verir.

## Sistem Özellikleri

1. **Rezervasyon Oluşturma**
   - Tarih ve saat seçimi
   - Oyuncu sayısı belirtme
   - Not ekleme

2. **Rezervasyon Yönetimi (Admin)**
   - Rezervasyon onaylama
   - Rezervasyon iptal etme
   - Durum güncelleme

3. **Üyelik Sistemi**
   - Kayıt olma
   - Giriş yapma
   - Profil düzenleme

## Teknik Detaylar

- Frontend: React.js, Material-UI
- Backend: Node.js, Express
- Veritabanı: MongoDB
