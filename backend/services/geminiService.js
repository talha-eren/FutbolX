const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    // API key'i environment variable'dan al
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY environment variable bulunamadı!');
      this.useMockResponses = true;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.useMockResponses = false;
  }

  // Mock yanıtlar (API key sorunu için geçici)
  getMockPlayerRecommendations(userProfile) {
    const mockResponses = {
      'Kaleci': `${userProfile.position} pozisyonunda oynayan bir oyuncu olarak, güçlü defans oyuncularıyla çalışmanız önemli. Özellikle hava toplarında güçlü olan stoper ve libero oyuncularıyla iyi uyum sağlayabilirsiniz. Ayrıca pas dağıtımında yardımcı olacak yaratıcı orta saha oyuncularıyla da etkili kombinasyonlar kurabilirsiniz.`,
      
      'Defans': `Defans pozisyonundaki bir oyuncu olarak, güvenilir kaleci ve hızlı kanat oyuncularıyla mükemmel uyum sağlayabilirsiniz. Özellikle ofansif katkı sağlayan kanat beklerle ve top kapma konusunda güçlü orta saha oyuncularıyla etkili bir savunma hattı oluşturabilirsiniz.`,
      
      'Orta Saha': `Orta saha oyuncusu olarak takımın kalbi konumundasınız. Hem savunma hem hücum oyuncularıyla köprü görevi görebilirsiniz. Özellikle hızlı forvetler ve güçlü defans oyuncularıyla mükemmel uyum sağlayarak takımın oyun kurma merkezi olabilirsiniz.`,
      
      'Forvet': `Forvet pozisyonunda gol odaklı oynayan bir oyuncu olarak, yaratıcı orta saha oyuncularından gelecek paslarla etkili olabilirsiniz. Hızlı kanat oyuncuları ve pas kalitesi yüksek playmaker'larla birlikte etkili hücum üçlüleri oluşturabilirsiniz.`
    };
    
    return mockResponses[userProfile.position] || 'Bu pozisyon için özel öneriler hazırlanıyor. Genel olarak takım uyumu için farklı pozisyonlardan oyuncularla antrenman yapmanız faydalı olacaktır.';
  }

  getMockTrainingRecommendations(userProfile) {
    const mockResponses = {
      'Kaleci': `Kaleci antrenman programı:
      
      **Teknik Çalışmalar:**
      - Refleks geliştirme egzersizleri (günde 30 dk)
      - Pozisyon alma ve açı kapatma çalışmaları
      - El-ayak koordinasyonu egzersizleri
      
      **Fiziksel Gelişim:**
      - Çeviklik merdiveni (15 dk)
      - Pliometrik sıçrama egzersizleri
      - Core güçlendirme (20 dk)
      
      **Haftalık Plan:**
      - Pazartesi: Refleks + Kondisyon
      - Çarşamba: Teknik + Güç
      - Cuma: Maç simülasyonu
      - Pazar: Aktif dinlenme`,
      
      'Defans': `Defans oyuncusu antrenman programı:
      
      **Teknik Çalışmalar:**
      - Müdahale teknikleri ve timing
      - Hava topu çalışmaları
      - Pas kalitesi geliştirme
      
      **Fiziksel Gelişim:**
      - Güç antrenmanı (üst vücut)
      - Sprint ve dayanıklılık
      - Denge ve stabilite
      
      **Haftalık Plan:**
      - Pazartesi: Güç + Teknik
      - Çarşamba: Kondisyon + Taktik
      - Cuma: Maç hazırlığı
      - Pazar: Esneklik ve toparlanma`,
      
      'Orta Saha': `Orta saha oyuncusu antrenman programı:
      
      **Teknik Çalışmalar:**
      - Pas kalitesi ve doğruluğu
      - Top kontrolü ve ilk dokunuş
      - Şut teknikleri
      
      **Fiziksel Gelişim:**
      - Kardiyovasküler dayanıklılık
      - Çeviklik ve hız
      - Koordinasyon egzersizleri
      
      **Haftalık Plan:**
      - Pazartesi: Kondisyon + Pas çalışması
      - Çarşamba: Teknik + Taktik
      - Cuma: Oyun içi simülasyon
      - Pazar: Aktif dinlenme`,
      
      'Forvet': `Forvet oyuncusu antrenman programı:
      
      **Teknik Çalışmalar:**
      - Bitiricilik ve şut teknikleri
      - Pozisyon alma ve timing
      - Hızlı dönüş ve hareket
      
      **Fiziksel Gelişim:**
      - Patlayıcı güç geliştirme
      - Sprint hızı
      - Çeviklik ve denge
      
      **Haftalık Plan:**
      - Pazartesi: Şut + Güç
      - Çarşamba: Hız + Hareket
      - Cuma: Maç senaryoları
      - Pazar: Esneklik çalışması`
    };
    
    return mockResponses[userProfile.position] || 'Bu pozisyon için özel antrenman programı hazırlanıyor. Genel kondisyon ve teknik çalışmalara odaklanmanız önerilir.';
  }

  getMockChatResponse(question) {
    const responses = [
      'Futbolda en önemli şey takım oyunudur. Bireysel yetenekler önemli olsa da, takım halinde hareket etmek başarının anahtarıdır.',
      'Antrenman düzenli olmalı ve hedef odaklı olmalıdır. Teknik, taktik ve fiziksel gelişimi dengeli şekilde planlamak gerekir.',
      'Futbolda mental güç çok önemlidir. Özgüven, konsantrasyon ve stres yönetimi performansı doğrudan etkiler.',
      'Beslenme ve dinlenme futbolcu gelişiminin vazgeçilmez parçalarıdır. Doğru beslenme ve yeterli uyku performansı artırır.',
      'Futbolda sürekli öğrenme ve gelişim önemlidir. Farklı oyuncuları izlemek ve yeni teknikler öğrenmek faydalıdır.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Oyuncu önerileri için AI kullan
  async getPlayerRecommendations(userProfile) {
    try {
      if (!this.genAI || this.useMockResponses) {
        console.log('🤖 Mock AI yanıtı kullanılıyor...');
        return this.getMockPlayerRecommendations(userProfile);
      }

      const prompt = `
        Futbol oyuncusu profili:
        - Pozisyon: ${userProfile.position}
        - Deneyim: ${userProfile.footballExperience}
        - Tercih edilen ayak: ${userProfile.preferredFoot}
        - Lokasyon: ${userProfile.location}
        - Favori takım: ${userProfile.favoriteTeam}
        
        Bu oyuncuya uygun takım arkadaşları için öneriler ver. 
        Hangi pozisyonlardaki oyuncularla iyi uyum sağlayabileceğini ve 
        neden bu kombinasyonun etkili olacağını açıkla.
        
        Türkçe yanıt ver ve maksimum 200 kelime kullan.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI hatası:', error);
      console.log('🤖 Mock AI yanıtına geçiliyor...');
      return this.getMockPlayerRecommendations(userProfile);
    }
  }

  // Takım analizi için AI kullan
  async analyzeTeamComposition(players) {
    try {
      if (!this.genAI || this.useMockResponses) {
        console.log('🤖 Mock AI yanıtı kullanılıyor...');
        return `Takım Analizi:
        
        **Güçlü Yönler:**
        - Takımda ${players.length} oyuncu bulunuyor
        - Farklı pozisyonlardan deneyimli oyuncular var
        - Takım kompozisyonu dengeli görünüyor
        
        **Gelişim Alanları:**
        - Takım uyumu antrenmanlarla geliştirilebilir
        - Pozisyon bazlı özel çalışmalar yapılabilir
        - Taktiksel anlayış güçlendirilebilir
        
        **Öneriler:**
        - Düzenli takım antrenmanları yapın
        - Farklı formasyonlar deneyin
        - Oyuncu rotasyonunu değerlendirin`;
      }

      const playerList = players.map(p => 
        `${p.firstName} ${p.lastName} - ${p.position} (${p.footballExperience})`
      ).join('\n');

      const prompt = `
        Futbol takımı kompozisyonu:
        ${playerList}
        
        Bu takımın güçlü ve zayıf yönlerini analiz et.
        Hangi pozisyonlarda eksiklik var?
        Takımın genel dengesini değerlendir.
        Oyun tarzı önerileri ver.
        
        Türkçe yanıt ver ve maksimum 300 kelime kullan.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI hatası:', error);
      console.log('🤖 Mock AI yanıtına geçiliyor...');
      return `Takım analizi geçici olarak mock yanıt ile sağlanıyor. API key sorunu çözüldüğünde gerçek AI analizi aktif olacak.`;
    }
  }

  // Antrenman önerileri için AI kullan
  async getTrainingRecommendations(userProfile) {
    try {
      if (!this.genAI || this.useMockResponses) {
        console.log('🤖 Mock AI yanıtı kullanılıyor...');
        return this.getMockTrainingRecommendations(userProfile);
      }

      const prompt = `
        Futbol oyuncusu profili:
        - Pozisyon: ${userProfile.position}
        - Deneyim seviyesi: ${userProfile.footballExperience}
        - Boy: ${userProfile.height}cm
        - Kilo: ${userProfile.weight}kg
        - Tercih edilen ayak: ${userProfile.preferredFoot}
        
        Bu oyuncuya özel antrenman programı öner.
        Pozisyonuna uygun teknik çalışmalar,
        fiziksel gelişim önerileri ve
        haftalık antrenman planı ver.
        
        Türkçe yanıt ver ve maksimum 250 kelime kullan.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI hatası:', error);
      console.log('🤖 Mock AI yanıtına geçiliyor...');
      return this.getMockTrainingRecommendations(userProfile);
    }
  }

  // Genel futbol soruları için AI chatbot
  async chatWithAI(question, userContext = {}) {
    try {
      if (!this.genAI || this.useMockResponses) {
        console.log('🤖 Mock AI yanıtı kullanılıyor...');
        return this.getMockChatResponse(question);
      }

      const contextInfo = userContext.position ? 
        `Kullanıcı profili: ${userContext.position} pozisyonunda oynuyor, ${userContext.footballExperience} seviyesinde deneyimi var.` : 
        '';

      const prompt = `
        ${contextInfo}
        
        Futbol konusunda soru: ${question}
        
        FutbolX uygulamasının AI asistanı olarak yanıtla.
        Futbol, takım kurma, antrenman ve oyuncu gelişimi konularında 
        yardımcı ol. Türkçe yanıt ver ve maksimum 200 kelime kullan.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI hatası:', error);
      console.log('🤖 Mock AI yanıtına geçiliyor...');
      return this.getMockChatResponse(question);
    }
  }

  // Maç analizi için AI kullan
  async analyzeMatch(matchData) {
    try {
      if (!this.genAI || this.useMockResponses) {
        console.log('🤖 Mock AI yanıtı kullanılıyor...');
        return `Maç Analizi:
        
        **Genel Değerlendirme:**
        - Maç ${matchData.location} lokasyonunda gerçekleşti
        - ${matchData.playerCount} oyuncu katıldı
        - Maç süresi: ${matchData.duration}
        
        **Öneriler:**
        - Takım koordinasyonu geliştirilebilir
        - Bireysel teknikler üzerinde çalışılabilir
        - Fiziksel kondisyon artırılabilir
        
        **Sonraki Maç İçin:**
        - Daha fazla antrenman yapın
        - Taktiksel hazırlığı güçlendirin
        - Oyuncu motivasyonunu yüksek tutun`;
      }

      const prompt = `
        Futbol maçı bilgileri:
        - Tarih: ${matchData.date}
        - Lokasyon: ${matchData.location}
        - Oyuncu sayısı: ${matchData.playerCount}
        - Süre: ${matchData.duration}
        - Notlar: ${matchData.notes || 'Yok'}
        
        Bu maç için:
        1. Oyun analizi yap
        2. Oyuncular için geri bildirim ver
        3. Gelişim önerileri sun
        4. Bir sonraki maç için taktik önerileri ver
        
        Türkçe yanıt ver ve maksimum 300 kelime kullan.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI hatası:', error);
      console.log('🤖 Mock AI yanıtına geçiliyor...');
      return `Maç analizi geçici olarak mock yanıt ile sağlanıyor. API key sorunu çözüldüğünde gerçek AI analizi aktif olacak.`;
    }
  }
}

module.exports = new GeminiService(); 