import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';
import AIService from '../services/aiService';

const AIAssistant = ({ isOpen, onToggle, userProfile, currentPage }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Merhaba! Ben FutbolX AI asistanınızım. 50+ farklı komut türü ile size yardımcı olabilirim! ⚽\n\n💡 Deneyebileceğiniz komutlar:\n• "Oyuncu arıyorum" - Uyumlu oyuncular bulur\n• "Saha bul" - Müsait sahaları listeler\n• "Takım öner" - Size uygun takımları gösterir\n• "Profil sayfasına git" - Sayfa yönlendirmeleri\n• "Motivasyon sözü ver" - Kişisel motivasyon\n\nNasıl yardımcı olabilirim?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sayfa değiştiğinde otomatik öneriler göster
  useEffect(() => {
    if (userProfile && currentPage) {
      const autoSuggestions = AIService.getAutoSuggestions({
        userProfile,
        currentPage,
        timeOfDay: new Date().getHours()
      });
      
      if (autoSuggestions.length > 0) {
        setSuggestions(autoSuggestions.slice(0, 3)); // En fazla 3 öneri
      }
    }
  }, [currentPage, userProfile]);

  // Önceden tanımlanmış yanıtlar ve akıllı öneriler
  const predefinedResponses = {
    // Rezervasyon ile ilgili
    'rezervasyon': {
      keywords: ['rezervasyon', 'rezerve', 'booking', 'saha', 'kiralama', 'randevu'],
      response: `🏟️ **Saha Rezervasyonu Hakkında:**

• **Rezervasyon Nasıl Yapılır?**
  - Ana sayfadan "Saha Rezervasyonu" sekmesine gidin
  - Tarih ve saat seçin
  - Uygun sahaları görüntüleyin
  - İstediğiniz sahayı seçip ödeme yapın

• **Rezervasyon İptali:**
  - Profilinizden "Rezervasyonlarım" bölümüne gidin
  - İptal etmek istediğiniz rezervasyonu seçin
  - 2 saat öncesine kadar ücretsiz iptal

• **Fiyatlar:**
  - Hafta içi: 150₺/saat
  - Hafta sonu: 200₺/saat
  - Öğrenci indirimi: %20

Başka bir konuda yardım ister misiniz?`
    },
    
    'oyuncu': {
      keywords: ['oyuncu', 'takım', 'eşleştirme', 'arkadaş', 'partner', 'maç'],
      response: `⚽ **Oyuncu Eşleştirme:**

• **Takım Arkadaşı Bulma:**
  - Profil sayfanızdan "Takım Arkadaşı Bul" butonuna tıklayın
  - Seviyeniz ve pozisyonunuza uygun oyuncular bulunur
  - Mesajlaşarak maç organize edebilirsiniz

• **Maç Organizasyonu:**
  - "Maçlar" sekmesinden yeni maç oluşturun
  - Tarih, saat ve saha bilgilerini girin
  - Diğer oyuncular katılım talebinde bulunabilir

• **Seviye Sistemi:**
  - Başlangıç, Orta, İleri seviyeler
  - Benzer seviyedeki oyuncularla eşleştirme

Hangi seviyede oyuncu arıyorsunuz?`
    },

    'saha': {
      keywords: ['saha', 'tesis', 'konum', 'adres', 'nerede', 'facilities'],
      response: `🏟️ **Saha Bilgileri:**

• **Mevcut Sahalarımız:**
  - **Halı Saha 1:** 7v7, LED aydınlatma, tribün
  - **Halı Saha 2:** 5v5, kapalı alan, klima
  - **Halı Saha 3:** 11v11, doğal çim, geniş park alanı

• **Tesislerimiz:**
  - Soyunma odaları ve duşlar
  - Kafeterya ve dinlenme alanı
  - Ücretsiz WiFi
  - Güvenli park alanı

• **Konum:**
  - Merkezi konumda, toplu taşıma erişimi
  - Harita için "Sahalar" sekmesini ziyaret edin

Hangi saha hakkında detay almak istersiniz?`
    },

    'fiyat': {
      keywords: ['fiyat', 'ücret', 'maliyet', 'para', 'ödeme', 'price'],
      response: `💰 **Fiyat Listesi:**

• **Saha Kiralama:**
  - Hafta içi (Pzt-Cum): 150₺/saat
  - Hafta sonu (Cmt-Paz): 200₺/saat
  - Gece saatleri (22:00-08:00): +50₺

• **İndirimler:**
  - Öğrenci indirimi: %20
  - Aylık üyelik: %15 indirim
  - Grup rezervasyonu (10+ kişi): %10

• **Ödeme Seçenekleri:**
  - Kredi kartı, banka kartı
  - Online ödeme güvenli SSL ile
  - Kapıda nakit ödeme mümkün

Özel bir indirim kodu var mı diye merak ediyorsunuz?`
    },

    'profil': {
      keywords: ['profil', 'hesap', 'bilgi', 'güncelleme', 'şifre'],
      response: `👤 **Profil Yönetimi:**

• **Profil Güncelleme:**
  - Profil sayfasından "Düzenle" butonuna tıklayın
  - Kişisel bilgilerinizi güncelleyin
  - Futbol seviyenizi ve pozisyonunuzu belirtin

• **Güvenlik:**
  - Şifrenizi düzenli olarak değiştirin
  - İki faktörlü doğrulama önerilir
  - Hesap güvenliği için güçlü şifre kullanın

• **İstatistikler:**
  - Oynadığınız maçlar otomatik kaydedilir
  - Gol ve asist istatistiklerinizi takip edin
  - Seviye ilerlemesi görüntüleyin

Profil ayarlarınızda yardım istediğiniz bir konu var mı?`
    },

    'yardım': {
      keywords: ['yardım', 'help', 'destek', 'problem', 'sorun', 'nasıl'],
      response: `🆘 **Yardım Merkezi:**

• **Sık Sorulan Sorular:**
  - Rezervasyon nasıl yapılır?
  - Oyuncu nasıl bulunur?
  - Ödeme nasıl yapılır?
  - Hesap nasıl oluşturulur?

• **İletişim:**
  - E-posta: destek@futbolx.com
  - Telefon: 0850 123 45 67
  - Canlı destek: 09:00-22:00 arası

• **Teknik Sorunlar:**
  - Uygulama güncellemelerini kontrol edin
  - İnternet bağlantınızı kontrol edin
  - Tarayıcı önbelleğini temizleyin

Hangi konuda özel yardım istiyorsunuz?`
    }
  };

  // Gelişmiş yanıt üretici
  const generateResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Komutlar listesi
    if (message.includes('komutlar') || message.includes('komut') || message.includes('yardım') || message.includes('help')) {
      return `🤖 **FutbolX AI Asistan Komutları**

📋 **Tüm komutları görmek için aşağıdaki kategorilere tıklayın:**

🏟️ **Saha & Rezervasyon Komutları**
• "Saha bul" - Müsait sahaları listeler
• "Rezervasyon yap" - Saha rezervasyonu yapar
• "Bugün açık sahalar" - Bugünkü müsait sahalar
• "Saha fiyatları" - Güncel fiyat listesi
• "En uygun saha" - Bütçe dostu sahalar

⚽ **Oyuncu & Takım Komutları**
• "Oyuncu arıyorum" - Uyumlu oyuncular bulur
• "Kaleci arıyorum" - Kaleci pozisyonu arar
• "Takım öner" - Size uygun takımları gösterir
• "Takımıma oyuncu bul" - Takım için oyuncu arar
• "Maça katıl" - Aktif maçlara katılım

📊 **İstatistik & Analiz Komutları**
• "İstatistiklerimi göster" - Kişisel istatistikler
• "Gelişimimi göster" - Performans analizi
• "En çok gol atan" - Gol krallığı listesi
• "En aktif takımlar" - Takım sıralaması
• "Başarı rozetlerim" - Kazanılan rozetler

🎯 **Hedef & Motivasyon Komutları**
• "Motivasyon sözü ver" - İlham verici sözler
• "Bugünkü ipucu" - Günlük futbol ipuçları
• "Hedef belirle" - Kişisel hedefler
• "Antrenman programı" - Gelişim önerileri

📱 **Sayfa Yönlendirme Komutları**
• "Profil sayfasına git" - Profil sayfası
• "Ayarlarımı değiştir" - Ayarlar sayfası
• "Rezervasyonlarım" - Rezervasyon geçmişi
• "Takımlarım" - Takım yönetimi
• "Ana sayfaya git" - Ana sayfa

🌤️ **Bilgi & Destek Komutları**
• "Hava durumu" - Güncel hava bilgisi
• "Destek" - Yardım ve iletişim
• "Fiyat listesi" - Detaylı fiyatlar
• "Turnuva bilgisi" - Aktif turnuvalar

🎮 **Eğlence Komutları**
• "Quiz başlat" - Futbol bilgi yarışması
• "Tahmin oyunu" - Maç tahmin oyunu
• "Rastgele öneri" - Sürpriz öneriler
• "Skill challenge" - Beceri yarışması

💡 **Örnek Kullanım:**
Sadece istediğiniz komutu yazın! Örnek:
"Kaleci arıyorum" veya "Motivasyon sözü ver"

Hangi kategoriyi keşfetmek istersiniz?`;
    }

    // Sayfa yönlendirme komutları
    if (message.includes('profil') || message.includes('profil sayfasına git')) {
      setTimeout(() => window.location.href = '/profile', 1500);
      return '📱 Profil sayfanıza yönlendiriliyorsunuz...\n\nProfilinizde kişisel bilgilerinizi, istatistiklerinizi ve ayarlarınızı düzenleyebilirsiniz.';
    }
    if (message.includes('ayar') || message.includes('ayarlarımı değiştir')) {
      setTimeout(() => window.location.href = '/settings', 1500);
      return '⚙️ Ayarlar sayfasına yönlendiriliyorsunuz...\n\nBurada hesap ayarlarınızı, bildirim tercihlerinizi ve gizlilik ayarlarınızı düzenleyebilirsiniz.';
    }
    if (message.includes('rezervasyon') || message.includes('saha rezervasyonu')) {
      setTimeout(() => window.location.href = '/reservations', 1500);
      return '🏟️ Saha rezervasyon sayfasına yönlendiriliyorsunuz...\n\nMüsait sahaları görüntüleyebilir ve rezervasyon yapabilirsiniz.';
    }
    if (message.includes('takım') && (message.includes('öner') || message.includes('bul'))) {
      setTimeout(() => window.location.href = '/teams', 1500);
      return '👥 Takımlar sayfasına yönlendiriliyorsunuz...\n\nSize uygun takımları bulabilir ve katılım talebinde bulunabilirsiniz.';
    }
    if (message.includes('video') || message.includes('videolar')) {
      setTimeout(() => window.location.href = '/videos', 1500);
      return '📹 Videolar sayfasına yönlendiriliyorsunuz...\n\nFutbol videolarını izleyebilir ve kendi videolarınızı paylaşabilirsiniz.';
    }
    if (message.includes('maç') || message.includes('maçlar')) {
      setTimeout(() => window.location.href = '/matches', 1500);
      return '⚽ Maçlar sayfasına yönlendiriliyorsunuz...\n\nAktif maçları görüntüleyebilir ve maç programını inceleyebilirsiniz.';
    }
    if (message.includes('istatistik') || message.includes('stats')) {
      setTimeout(() => window.location.href = '/stats', 1500);
      return '📊 İstatistikler sayfasına yönlendiriliyorsunuz...\n\nKişisel performansınızı ve genel istatistikleri görüntüleyebilirsiniz.';
    }
    if (message.includes('ana sayfa') || message.includes('anasayfa') || message.includes('home')) {
      setTimeout(() => window.location.href = '/', 1500);
      return '🏠 Ana sayfaya yönlendiriliyorsunuz...\n\nAna sayfada en son güncellemeleri ve önemli duyuruları görebilirsiniz.';
    }

    // Motivasyon ve ipuçları
    if (message.includes('motivasyon') || message.includes('motive')) {
      const motivationMessages = [
        '💪 "Başarı, hazırlık fırsatla buluştuğunda ortaya çıkar. Sen hazır ol, fırsat gelecek!"',
        '⚽ "Her büyük futbolcu bir gün amatör olarak başladı. Sen de o yoldasın!"',
        '🌟 "Futbolda en önemli şey takım ruhu. Sen de bu ruhun bir parçasısın!"',
        '🏆 "Kazanmak önemli değil, asla pes etmemek önemli. Devam et!"',
        '🎯 "Hedefin net olsun, çalışman sıkı olsun. Başarı kaçınılmaz olacak!"'
      ];
      return motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    }
    if (message.includes('ipucu') || message.includes('tavsiye')) {
      const tips = [
        '⚽ Günlük İpucu: Maç öncesi 2 saat önce yemek yemeyi bırakın, performansınız artar!',
        '🏃‍♂️ Antrenman İpucu: Haftada en az 3 kez kondisyon çalışması yapın.',
        '🧠 Taktik İpucu: Rakibinizi gözlemleyin, zayıf noktalarını bulun.',
        '💧 Sağlık İpucu: Maç sırasında düzenli su için, dehidrasyon performansı düşürür.',
        '🎯 Teknik İpucu: Top kontrolünü geliştirmek için duvarla pas çalışması yapın.'
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    // Hava durumu
    if (message.includes('hava durumu') || message.includes('hava')) {
      return '🌤️ Hava Durumu Bilgisi\n\nBugün Elazığ\'da:\n🌡️ Sıcaklık: 18°C\n☁️ Durum: Parçalı bulutlu\n💨 Rüzgar: 15 km/h\n\n⚽ Maç için ideal hava koşulları! Sahaya çıkmak için mükemmel bir gün!';
    }

    // Eğlence komutları
    if (message.includes('quiz') || message.includes('bilgi yarışması')) {
      return '🎮 Futbol Quiz Başlatılıyor!\n\n❓ Soru: Dünya Kupası\'nı en çok kazanan ülke hangisidir?\nA) Brezilya (5 kez)\nB) Almanya (4 kez)\nC) İtalya (4 kez)\nD) Arjantin (3 kez)\n\nCevabınızı düşünün! 🤔';
    }
    if (message.includes('tahmin') || message.includes('tahmin oyunu')) {
      return '🔮 Maç Tahmin Oyunu!\n\n⚽ Bu hafta sonu Galatasaray - Fenerbahçe derbisi var!\nTahminiz nedir?\n\n🟡🔴 Galatasaray galip\n🟡💙 Fenerbahçe galip\n⚖️ Beraberlik\n\nTahminlerinizi paylaşın!';
    }

    // Önce AIService'den akıllı yanıt al
    const smartResponses = AIService.getSmartResponse(userMessage, {
      userProfile,
      currentPage,
      timeOfDay: new Date().getHours()
    });

    if (smartResponses.length > 0) {
      return smartResponses[0].message;
    }

    // Önceden tanımlanmış yanıtları kontrol et
    for (const [key, data] of Object.entries(predefinedResponses)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        return data.response;
      }
    }

    // Varsayılan yanıt
    return `🤖 "${userMessage}" hakkında bilgi arıyorsunuz.\n\n💡 Size yardımcı olabilmek için şu komutları deneyebilirsiniz:\n\n⚽ Oyuncu arama: "kaleci arıyorum", "takım öner"\n🏟️ Saha işlemleri: "saha bul", "rezervasyon yap"\n📊 Bilgi: "istatistiklerimi göster", "maç geçmişi"\n⚙️ Sistem: "profil sayfasına git", "ayarlar"\n\n50+ komut için hızlı eylem butonlarını kullanın!`;
  };

  // Hızlı eylem önerileri - dinamik olarak güncellenen
  const getQuickActions = () => {
    const baseActions = [
      { text: '📋 Komutlar', action: 'komutlar' },
      { text: '🏟️ Saha Rezervasyonu', action: 'rezervasyon yap' },
      { text: '⚽ Oyuncu Bul', action: 'oyuncu arıyorum' },
      { text: '👥 Takım Öner', action: 'takım öner' },
      { text: '📊 İstatistikler', action: 'istatistiklerimi göster' },
      { text: '💡 Motivasyon', action: 'motivasyon sözü ver' },
      { text: '🎯 Günlük İpucu', action: 'bugünkü ipucu nedir' },
      { text: '🆘 Yardım', action: 'yardım' }
    ];

    // Sayfa bazlı özel eylemler ekle
    const pageSpecificActions = [];
    
    if (currentPage === 'reservation') {
      pageSpecificActions.push(
        { text: '⏰ Müsait Saatler', action: 'bugün açık sahalar hangileri' },
        { text: '💰 Fiyat Listesi', action: 'saha fiyatları nedir' },
        { text: '📍 Saha Konumları', action: 'saha bul' }
      );
    } else if (currentPage === 'profile') {
      pageSpecificActions.push(
        { text: '📈 Gelişimim', action: 'gelişimimi göster' },
        { text: '🎯 Hedeflerim', action: 'hedeflerimi belirle' },
        { text: '🏆 Başarılarım', action: 'başarı rozetlerimi göster' }
      );
    } else if (currentPage === 'teams') {
      pageSpecificActions.push(
        { text: '🔍 Oyuncu Ara', action: 'takımıma oyuncu bulur musun' },
        { text: '⚽ Maç Organize Et', action: 'maça katıl' },
        { text: '📊 Takım Analizi', action: 'takım istatistiklerimi göster' }
      );
    } else if (currentPage === 'matches') {
      pageSpecificActions.push(
        { text: '🏆 Turnuva Bilgisi', action: 'turnuva bilgisi ver' },
        { text: '📅 Hafta Sonu Maçları', action: 'hafta sonu maçları' },
        { text: '🎮 Tahmin Oyunu', action: 'tahmin oyunu' }
      );
    } else if (currentPage === 'videos') {
      pageSpecificActions.push(
        { text: '🎬 Video Paylaş', action: 'video nasıl paylaşırım' },
        { text: '⭐ Popüler Videolar', action: 'en popüler videolar' },
        { text: '🎯 Skill Challenge', action: 'skill challenge' }
      );
    }

    // Zaman bazlı özel eylemler
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      pageSpecificActions.push({ text: '🌅 Sabah Antrenmanı', action: 'antrenman programı öner' });
    } else if (hour >= 18 && hour < 22) {
      pageSpecificActions.push({ text: '🌆 Akşam Maçı', action: 'bugün hangi takımlar maç yapıyor' });
    }

    return [...baseActions, ...pageSpecificActions].slice(0, 8); // Maksimum 8 eylem
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Bot yanıtını simüle et
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateResponse(inputMessage),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Yeni öneriler oluştur
      const newSuggestions = AIService.getAutoSuggestions({
        userProfile,
        currentPage,
        timeOfDay: new Date().getHours()
      });
      setSuggestions(newSuggestions.slice(0, 2));
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSuggestionClick = (suggestion) => {
    const suggestionMessage = {
      id: Date.now(),
      type: 'user',
      content: `${suggestion.type} hakkında bilgi istiyorum`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, suggestionMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: suggestion.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  // Komut tıklama işleyicisi
  const handleCommandClick = (command) => {
    setInputMessage(command);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Mesaj içeriğini render etme fonksiyonu
  const renderMessageContent = (content) => {
    // Komutlar listesi kontrolü
    if (content.includes('FutbolX AI Asistan Komutları')) {
      const lines = content.split('\n');
      return (
        <div className="commands-list">
          {lines.map((line, index) => {
            // Komut satırlarını tespit et
            if (line.includes('• "') && line.includes('" -')) {
              const commandMatch = line.match(/• "([^"]+)" - (.+)/);
              if (commandMatch) {
                const [, command, description] = commandMatch;
                return (
                  <div 
                    key={index}
                    className="command-item"
                    onClick={() => handleCommandClick(command)}
                  >
                    <strong>"{command}"</strong>
                    <span className="command-description">- {description}</span>
                  </div>
                );
              }
            }
            
            // Kategori başlıkları
            if (line.includes('**') && (line.includes('Komutları') || line.includes('Komutlar'))) {
              return (
                <div key={index} className="command-category">
                  <h4>{line.replace(/\*\*/g, '').replace(/🏟️|⚽|📊|🎯|📱|🌤️|🎮/g, '').trim()}</h4>
                </div>
              );
            }
            
            // Normal satırlar
            if (line.trim()) {
              return (
                <div key={index} className="message-line">
                  {line.includes('**') ? (
                    <strong>{line.replace(/\*\*/g, '')}</strong>
                  ) : (
                    line
                  )}
                </div>
              );
            }
            
            return <br key={index} />;
          })}
        </div>
      );
    }

    // Normal mesaj içeriği
    return content.split('\n').map((line, index) => (
      <div key={index}>
        {line.includes('**') ? (
          <strong>{line.replace(/\*\*/g, '')}</strong>
        ) : line.includes('•') ? (
          <div className="bullet-point">{line}</div>
        ) : (
          line
        )}
      </div>
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else {
        onToggle();
      }
    }
  };

  // Tam ekran toggle fonksiyonu
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ESC tuşu için global event listener
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onToggle();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, isFullscreen, onToggle]);

  if (!isOpen) {
    return (
      <div className="ai-assistant">
        <button className="ai-toggle" onClick={onToggle}>
          🤖
          {suggestions.length > 0 && (
            <div className="notification-badge">{suggestions.length}</div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="ai-assistant">
      <div className={`ai-chat-container ${isFullscreen ? 'ai-fullscreen' : ''}`}>
        <div className="ai-chat-header">
          <div className="ai-header-info">
            <div className="ai-avatar">🤖</div>
            <div className="ai-header-text">
              <h3>FutbolX AI Asistan</h3>
              <span className="ai-status">
                Çevrimiçi • 50+ Komut Türü • {currentPage ? `${currentPage} sayfasında` : 'Size yardımcı olmaya hazır'}
              </span>
            </div>
          </div>
          <div className="ai-header-controls">
            <button className="ai-control-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Küçült' : 'Tam Ekran'}>
              {isFullscreen ? '🗗' : '🗖'}
            </button>
            <button className="ai-close-btn" onClick={onToggle} title="Kapat">
              ✕
            </button>
          </div>
        </div>

        {/* Akıllı Öneriler Bölümü */}
        {suggestions.length > 0 && (
          <div className="ai-suggestions-panel">
            <div className="suggestions-title">💡 Size Özel Öneriler:</div>
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-card"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-content">
                  <span className="suggestion-type">{suggestion.type}</span>
                  <span className="suggestion-message">{suggestion.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ai-messages">
          {messages.map((message) => (
            <div key={message.id} className={`ai-message ${message.type}`}>
              <div className="message-content">
                {message.type === 'bot' && <div className="ai-avatar">🤖</div>}
                <div className="message-text">
                  {renderMessageContent(message.content)}
                </div>
                {message.type === 'user' && userProfile?.profilePicture && (
                  <img 
                    src={userProfile.profilePicture} 
                    alt="User" 
                    className="user-avatar"
                  />
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="ai-message typing">
              <div className="message-content">
                <div className="ai-avatar">🤖</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-actions">
          {getQuickActions().map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action.action)}
            >
              {action.text}
            </button>
          ))}
        </div>

        <div className="ai-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın... (Enter ile gönder)"
            rows="2"
            className="ai-input"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="ai-send-btn"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 