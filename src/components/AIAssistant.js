import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';
import AIService from '../services/aiService';

const AIAssistant = ({ isOpen, onToggle, userProfile, currentPage }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Merhaba! Ben FutbolX AI asistanınızım. Size nasıl yardımcı olabilirim? ⚽',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
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

    // Sayfa bazlı akıllı öneriler
    if (currentPage) {
      switch (currentPage) {
        case 'reservation':
          const reservationSuggestions = AIService.getReservationSuggestions(userProfile);
          if (reservationSuggestions.length > 0) {
            return `🏟️ Rezervasyon sayfasındasınız! ${reservationSuggestions[0].message}

Ayrıca size yardımcı olabileceğim konular:
• Saha müsaitlik kontrolü
• Fiyat hesaplama ve indirimler
• En uygun saat önerileri
• Hava durumu bilgisi

"müsait saatler", "fiyat hesapla" veya "hava durumu" yazabilirsiniz.`;
          }
          break;

        case 'profile':
          const personalSuggestions = AIService.getPersonalizedSuggestions(userProfile);
          if (personalSuggestions.length > 0) {
            return `👤 Profil sayfanızdasınız! ${personalSuggestions[0].message}

Size özel önerilerim:
• İstatistik analizi ve gelişim önerileri
• Seviye değerlendirmesi
• Performans takibi
• Hedef belirleme

"istatistiklerim", "seviye analizi" veya "hedeflerim" yazabilirsiniz.`;
          }
          break;

        case 'teams':
          const playerSuggestions = AIService.getPlayerMatchingSuggestions(userProfile);
          if (playerSuggestions.length > 0) {
            return `⚽ Takımlar sayfasındasınız! ${playerSuggestions[0].message}

Takım konularında yardımcı olabilirim:
• Uygun oyuncu bulma
• Takım kurma stratejileri
• Maç organizasyonu
• Seviye uyumlu eşleştirme

"oyuncu bul", "takım kur" veya "maç organize et" yazabilirsiniz.`;
          }
          break;
      }
    }

    // Genel yanıtlar
    const generalResponses = [
      `"${userMessage}" hakkında size yardımcı olmaya çalışayım! 

🎯 **Hızlı Yardım:**
• **Rezervasyon:** "saha rezerve et" yazın
• **Oyuncu Bulma:** "oyuncu arıyorum" yazın  
• **Fiyat Bilgisi:** "fiyatlar nedir" yazın
• **Saha Durumu:** "hangi sahalar boş" yazın

Hangi konuda detay almak istersiniz?`,

      `Size daha iyi yardımcı olabilmem için biraz daha spesifik olabilir misiniz? 

💡 **Örnek sorular:**
• "Bugün 19:00 için hangi sahalar müsait?"
• "Hafta sonu fiyatları nedir?"
• "Benim seviyemde oyuncu var mı?"
• "En popüler saatler hangileri?"

Bu şekilde size daha detaylı bilgi verebilirim! 😊`
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  // Hızlı eylem önerileri - dinamik olarak güncellenen
  const getQuickActions = () => {
    const baseActions = [
      { text: '🏟️ Saha Rezervasyonu', action: 'rezervasyon' },
      { text: '⚽ Oyuncu Bul', action: 'oyuncu' },
      { text: '💰 Fiyat Listesi', action: 'fiyat' },
      { text: '🆘 Yardım', action: 'yardım' }
    ];

    // Sayfa bazlı özel eylemler ekle
    const pageSpecificActions = [];
    
    if (currentPage === 'reservation') {
      pageSpecificActions.push(
        { text: '⏰ Müsait Saatler', action: 'müsait saatler' },
        { text: '🌤️ Hava Durumu', action: 'hava durumu' }
      );
    } else if (currentPage === 'profile') {
      pageSpecificActions.push(
        { text: '📊 İstatistiklerim', action: 'istatistiklerim' },
        { text: '🎯 Hedeflerim', action: 'hedeflerim' }
      );
    } else if (currentPage === 'teams') {
      pageSpecificActions.push(
        { text: '👥 Takım Kur', action: 'takım kur' },
        { text: '🔍 Oyuncu Ara', action: 'oyuncu ara' }
      );
    }

    return [...baseActions, ...pageSpecificActions].slice(0, 6); // Maksimum 6 eylem
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="ai-assistant-toggle" onClick={onToggle}>
        <div className="ai-icon">
          🤖
        </div>
        <div className="ai-notification">
          AI Asistan
          {suggestions.length > 0 && (
            <div className="notification-badge">{suggestions.length}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header">
        <div className="ai-header-info">
          <div className="ai-avatar">🤖</div>
          <div className="ai-header-text">
            <h3>FutbolX AI Asistan</h3>
            <span className="ai-status">
              Çevrimiçi • {currentPage ? `${currentPage} sayfasında` : 'Size yardımcı olmaya hazır'}
            </span>
          </div>
        </div>
        <button className="ai-close-btn" onClick={onToggle}>
          ✕
        </button>
      </div>

      {/* Akıllı Öneriler Bölümü */}
      {suggestions.length > 0 && (
        <div className="ai-suggestions">
          <div className="suggestions-title">💡 Size Özel Öneriler:</div>
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="suggestion-item"
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

      <div className="ai-assistant-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.type === 'bot' && <div className="bot-avatar">🤖</div>}
              <div className="message-text">
                {message.content.split('\n').map((line, index) => (
                  <div key={index}>
                    {line.includes('**') ? (
                      <strong>{line.replace(/\*\*/g, '')}</strong>
                    ) : line.includes('•') ? (
                      <div className="bullet-point">{line}</div>
                    ) : (
                      line
                    )}
                  </div>
                ))}
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
          <div className="message bot">
            <div className="message-content">
              <div className="bot-avatar">🤖</div>
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

      <div className="ai-quick-actions">
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

      <div className="ai-assistant-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Mesajınızı yazın... (Enter ile gönder)"
          rows="2"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="send-btn"
        >
          📤
        </button>
      </div>
    </div>
  );
};

export default AIAssistant; 