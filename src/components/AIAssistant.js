import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';
import AIService from '../services/aiService';

const AIAssistant = ({ isOpen, onToggle, userProfile, currentPage }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Merhaba! Ben FutbolX AI asistanınızım. 🤖⚽\n\n💬 **Doğal Konuşma:**\nBenimle normal bir insan gibi konuşabilirsiniz! Herhangi bir konu hakkında soru sorabilir, sohbet edebiliriz.\n\n🎯 **Özel Komutlar:**\n• "Antrenman programı öner" - Kişisel antrenman planı\n• "Oyuncu önerileri ver" - AI destekli eşleştirme\n• "Takımımı analiz et" - Detaylı takım analizi\n• "Saha bul" - Müsait sahaları listeler\n\n🔧 **AI Modu:** Üstteki menüden Gemini AI modunu seçerek daha gelişmiş yanıtlar alabilirsiniz.\n\nNasıl yardımcı olabilirim?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiMode, setAiMode] = useState('gemini'); // 'smart', 'gemini', 'classic'
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

  // AI Mode değiştirme
  const handleAIModeChange = (mode) => {
    setAiMode(mode);
    const modeMessages = {
      'smart': 'Akıllı mod aktif! 🧠 Hem klasik hem AI özelliklerini kullanıyorum.',
      'gemini': 'Gemini AI modu aktif! 🤖 Gelişmiş AI yanıtları alacaksınız.',
      'classic': 'Klasik mod aktif! ⚡ Hızlı ve önceden tanımlanmış yanıtlar.'
    };
    
    addMessage('bot', modeMessages[mode]);
  };

  // Mesaj ekleme fonksiyonu
  const addMessage = (type, content, data = null) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

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

  // Gelişmiş yanıt üretici - Gemini AI öncelikli
  const generateResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Önce Gemini AI'dan yanıt almaya çalış (normal konuşma için)
    try {
      const userContext = userProfile ? {
        position: userProfile.position,
        footballExperience: userProfile.footballExperience,
        location: userProfile.location,
        firstName: userProfile.firstName
      } : {};

      const geminiResponse = await AIService.chatWithGeminiAI(userMessage, userContext);
      
      if (geminiResponse) {
        return `🤖 ${geminiResponse}`;
      }
    } catch (error) {
      console.log('Gemini AI yanıt veremedi, klasik yanıtlara geçiliyor...');
    }
    
    // Sadece özel komutlar için önceden tanımlanmış yanıtlar
    
    // Sayfa yönlendirme komutları
    if (message.includes('profil') && message.includes('git')) {
      setTimeout(() => window.location.href = '/profile', 1500);
      return '📱 Profil sayfanıza yönlendiriliyorsunuz...';
    }
    if (message.includes('ayar') && message.includes('git')) {
      setTimeout(() => window.location.href = '/settings', 1500);
      return '⚙️ Ayarlar sayfasına yönlendiriliyorsunuz...';
    }
    if (message.includes('rezervasyon') && message.includes('git')) {
      setTimeout(() => window.location.href = '/reservations', 1500);
      return '🏟️ Saha rezervasyon sayfasına yönlendiriliyorsunuz...';
    }
    if (message.includes('takım') && message.includes('git')) {
      setTimeout(() => window.location.href = '/teams', 1500);
      return '👥 Takımlar sayfasına yönlendiriliyorsunuz...';
    }
    if (message.includes('ana sayfa') && message.includes('git')) {
      setTimeout(() => window.location.href = '/', 1500);
      return '🏠 Ana sayfaya yönlendiriliyorsunuz...';
    }

    // Acil durum yanıtları (sadece çok spesifik komutlar için)
    if (message.includes('hava durumu')) {
      return '🌤️ Bugün Elazığ\'da 18°C, parçalı bulutlu. Futbol için ideal hava! ⚽';
    }

    // Eğer hiçbir özel komut yoksa, genel AI yanıtı
    const userName = userProfile?.firstName || 'dostum';
    return `Merhaba ${userName}! Bu konuda size nasıl yardımcı olabilirim? Futbol hakkında soru sorabilir veya genel konularda sohbet edebiliriz. 😊`;
  };

  // Hızlı eylem önerileri - dinamik olarak güncellenen
  const getQuickActions = () => {
    const baseActions = [
      { text: '🏟️ Saha Rezervasyonu', action: 'rezervasyon yap' },
      { text: '⚽ Oyuncu Bul', action: 'oyuncu arıyorum' },
      { text: '👥 Takım Öner', action: 'takım öner' },
      { text: '📊 İstatistikler', action: 'istatistiklerimi göster' },
      { text: '💡 Motivasyon', action: 'motivasyon sözü ver' },
      { text: '🎯 Günlük İpucu', action: 'bugünkü ipucu nedir' },
      { text: '🌤️ Hava Durumu', action: 'hava durumu' },
      { text: '🆘 Yardım', action: 'yardım' }
    ];

    // Gemini AI özel eylemleri
    const geminiActions = [
      { text: '🤖 AI Antrenman Programı', action: 'antrenman programı öner' },
      { text: '🎯 AI Oyuncu Önerileri', action: 'oyuncu önerileri ver' },
      { text: '📊 AI Takım Analizi', action: 'takımımı analiz et' },
      { text: '💡 AI Futbol Tavsiyesi', action: 'futbol tavsiyesi ver' },
      { text: '🏃‍♂️ Gelişim Planı', action: 'nasıl gelişebilirim' },
      { text: '⚽ Pozisyon Analizi', action: 'pozisyonumu analiz et' }
    ];

    // Sayfa bazlı özel eylemler ekle
    const pageSpecificActions = [];
    
    if (currentPage === 'reservation') {
      pageSpecificActions.push(
        { text: '⏰ Müsait Saatler', action: 'bugün açık sahalar hangileri' },
        { text: '💰 Fiyat Listesi', action: 'saha fiyatları nedir' },
        { text: '📍 Saha Konumları', action: 'saha bul' },
        { text: '🤖 AI Saha Önerisi', action: 'bana uygun saha öner' }
      );
    } else if (currentPage === 'profile') {
      pageSpecificActions.push(
        { text: '📈 Gelişimim', action: 'gelişimimi göster' },
        { text: '🎯 Hedeflerim', action: 'hedeflerimi belirle' },
        { text: '🏆 Başarılarım', action: 'başarı rozetlerimi göster' },
        { text: '🤖 AI Profil Analizi', action: 'profilimi analiz et' }
      );
    } else if (currentPage === 'teams') {
      pageSpecificActions.push(
        { text: '🔍 Oyuncu Ara', action: 'takımıma oyuncu bulur musun' },
        { text: '⚽ Maç Organize Et', action: 'maça katıl' },
        { text: '📊 Takım Analizi', action: 'takım istatistiklerimi göster' },
        { text: '🤖 AI Takım Stratejisi', action: 'takım stratejisi öner' }
      );
    } else if (currentPage === 'matches') {
      pageSpecificActions.push(
        { text: '🏆 Turnuva Bilgisi', action: 'turnuva bilgisi ver' },
        { text: '📅 Hafta Sonu Maçları', action: 'hafta sonu maçları' },
        { text: '🎮 Tahmin Oyunu', action: 'tahmin oyunu' },
        { text: '🤖 AI Maç Analizi', action: 'maç performansımı analiz et' }
      );
    } else if (currentPage === 'videos') {
      pageSpecificActions.push(
        { text: '🎬 Video Paylaş', action: 'video nasıl paylaşırım' },
        { text: '⭐ Popüler Videolar', action: 'en popüler videolar' },
        { text: '🎯 Skill Challenge', action: 'skill challenge' },
        { text: '🤖 AI Video Analizi', action: 'videolarımı analiz et' }
      );
    }

    // Zaman bazlı özel eylemler
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      pageSpecificActions.push({ text: '🌅 AI Sabah Antrenmanı', action: 'sabah antrenman programı öner' });
    } else if (hour >= 18 && hour < 22) {
      pageSpecificActions.push({ text: '🌆 AI Akşam Maçı', action: 'akşam için maç öner' });
    }

    // AI Mode'a göre eylemler
    if (aiMode === 'gemini') {
      return [...geminiActions, ...pageSpecificActions].slice(0, 8);
    } else if (aiMode === 'smart') {
      return [...baseActions, ...geminiActions, ...pageSpecificActions].slice(0, 8);
    } else {
      return [...baseActions, ...pageSpecificActions].slice(0, 8);
    }
  };

  // Gelişmiş mesaj gönderme fonksiyonu
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Önce AIService'den yanıt almaya çalış
      const response = await AIService.processQuery(currentInput);
      
      // Eğer AIService yanıt verirse onu kullan
      if (response && response.text) {
        setTimeout(() => {
          const botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: response.text,
            timestamp: new Date(),
            quickActions: response.quickActions || [],
            data: response.data || null
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
        }, 800 + Math.random() * 500);
      } else {
        // AIService yanıt veremezse generateResponse kullan
        const fallbackResponse = await generateResponse(currentInput);
        
        setTimeout(() => {
          const botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: fallbackResponse,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 800 + Math.random() * 500);
      }
    } catch (error) {
      console.error('AI Response Error:', error);
      
      // Hata durumunda generateResponse'u dene
      try {
        const fallbackResponse = await generateResponse(currentInput);
        
        setTimeout(() => {
          const botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: fallbackResponse,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 800);
      } catch (fallbackError) {
        console.error('Fallback Response Error:', fallbackError);
        setTimeout(() => {
          const botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin. 😅',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 800);
      }
    }
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
            {/* AI Mode Seçici */}
            <div className="ai-mode-selector">
              <select 
                value={aiMode} 
                onChange={(e) => handleAIModeChange(e.target.value)}
                className="ai-mode-select"
                title="AI Modu Seç"
              >
                <option value="smart">🧠 Akıllı</option>
                <option value="gemini">🤖 Gemini AI</option>
                <option value="classic">⚡ Klasik</option>
              </select>
            </div>
            <button className="ai-control-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Küçült' : 'Tam Ekran'}>
              {isFullscreen ? '🗗' : '🗖'}
            </button>
            <button className="ai-close-btn" onClick={onToggle} title="Kapat">
              ✕
            </button>
          </div>
        </div>

        {/* AI Mode Bilgi Paneli */}
        <div className="ai-mode-info">
          <div className={`mode-indicator ${aiMode}`}>
            {aiMode === 'smart' && '🧠 Akıllı Mod: Hem klasik hem AI özellikler aktif'}
            {aiMode === 'gemini' && '🤖 Gemini AI: Gelişmiş yapay zeka yanıtları'}
            {aiMode === 'classic' && '⚡ Klasik Mod: Hızlı önceden tanımlanmış yanıtlar'}
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