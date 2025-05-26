// AI Assistant için gelişmiş servis fonksiyonları

export class AIService {
  // Rezervasyon önerileri
  static getReservationSuggestions(userProfile, currentDate = new Date()) {
    const suggestions = [];
    const hour = currentDate.getHours();
    const dayOfWeek = currentDate.getDay();
    
    // Kullanıcının geçmiş rezervasyon verilerine göre öneriler
    if (userProfile?.preferredTimes) {
      suggestions.push({
        type: 'time',
        message: `Genellikle ${userProfile.preferredTimes.join(', ')} saatlerinde rezervasyon yapıyorsunuz. Bu saatler için uygun sahalar var mı kontrol edeyim?`,
        action: 'checkAvailability',
        data: { times: userProfile.preferredTimes }
      });
    }

    // Zaman bazlı öneriler
    if (hour >= 18 && hour <= 22) {
      suggestions.push({
        type: 'time',
        message: 'Akşam saatleri için popüler zaman dilimi! 19:00-21:00 arası saatler genellikle tercih ediliyor.',
        action: 'suggestTime',
        data: { timeRange: '19:00-21:00' }
      });
    }

    // Hafta sonu önerileri
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      suggestions.push({
        type: 'weekend',
        message: 'Hafta sonu için özel fiyatlarımız var! Erken rezervasyon yaparsanız %10 indirim kazanabilirsiniz.',
        action: 'weekendDiscount',
        data: { discount: 10 }
      });
    }

    return suggestions;
  }

  // Oyuncu eşleştirme önerileri
  static getPlayerMatchingSuggestions(userProfile) {
    const suggestions = [];
    
    if (userProfile?.position && userProfile?.level) {
      suggestions.push({
        type: 'matching',
        message: `${userProfile.position} pozisyonunda ${userProfile.level} seviyesinde ${this.getRandomPlayerCount()} oyuncu bulundu! Onlarla iletişime geçmek ister misiniz?`,
        action: 'findPlayers',
        data: { 
          position: userProfile.position, 
          level: userProfile.level,
          count: this.getRandomPlayerCount()
        }
      });
    }

    // Yakındaki oyuncular
    if (userProfile?.location) {
      suggestions.push({
        type: 'location',
        message: `${userProfile.location} bölgesinde aktif ${this.getRandomPlayerCount()} oyuncu var. Yakınınızdaki oyuncularla maç organize edebilirsiniz!`,
        action: 'nearbyPlayers',
        data: { location: userProfile.location }
      });
    }

    return suggestions;
  }

  // Saha durumu ve öneriler
  static getFieldSuggestions(currentPage, timeOfDay) {
    const suggestions = [];
    
    // Saha müsaitlik durumu
    const availability = this.generateFieldAvailability();
    
    suggestions.push({
      type: 'availability',
      message: `Şu anda ${availability.available} saha müsait, ${availability.busy} saha dolu. En uygun saatler: ${availability.bestTimes.join(', ')}`,
      action: 'showAvailability',
      data: availability
    });

    // Hava durumu bazlı öneriler
    const weather = this.getWeatherSuggestion();
    if (weather) {
      suggestions.push({
        type: 'weather',
        message: weather.message,
        action: 'weatherInfo',
        data: weather
      });
    }

    return suggestions;
  }

  // Kişiselleştirilmiş öneriler
  static getPersonalizedSuggestions(userProfile, userActivity) {
    const suggestions = [];

    // Aktivite bazlı öneriler
    if (userActivity?.lastReservation) {
      const daysSinceLastReservation = this.getDaysSince(userActivity.lastReservation);
      
      if (daysSinceLastReservation > 7) {
        suggestions.push({
          type: 'activity',
          message: `Son rezervasyonunuzdan ${daysSinceLastReservation} gün geçti. Yeni bir maç için rezervasyon yapmaya ne dersiniz?`,
          action: 'encourageReservation',
          data: { daysSince: daysSinceLastReservation }
        });
      }
    }

    // Seviye gelişimi önerileri
    if (userProfile?.stats) {
      const { matches, goals, assists } = userProfile.stats;
      
      if (matches >= 10 && (goals + assists) / matches > 1.5) {
        suggestions.push({
          type: 'progress',
          message: 'Harika performans! İstatistiklerinize göre bir üst seviyeye geçmeye hazır olabilirsiniz.',
          action: 'levelUp',
          data: { currentLevel: userProfile.level }
        });
      }
    }

    return suggestions;
  }

  // Akıllı soru-cevap sistemi
  static getSmartResponse(userMessage, context) {
    const message = userMessage.toLowerCase();
    const responses = [];

    // Rezervasyon ile ilgili akıllı yanıtlar
    if (this.containsKeywords(message, ['ne zaman', 'hangi saat', 'müsait'])) {
      const timeSlots = this.getAvailableTimeSlots();
      responses.push({
        type: 'timeSlots',
        message: `Bugün için müsait saatler: ${timeSlots.join(', ')}. Hangi saati tercih edersiniz?`,
        data: { timeSlots }
      });
    }

    // Fiyat ile ilgili akıllı yanıtlar
    if (this.containsKeywords(message, ['kaç para', 'fiyat', 'ücret', 'maliyet'])) {
      const pricing = this.getDynamicPricing(context);
      responses.push({
        type: 'pricing',
        message: pricing.message,
        data: pricing
      });
    }

    // Oyuncu sayısı ile ilgili
    if (this.containsKeywords(message, ['kaç kişi', 'oyuncu sayısı', 'takım'])) {
      responses.push({
        type: 'playerCount',
        message: 'Sahalarımız 5v5, 7v7 ve 11v11 formatlarında oynanabilir. Kaç kişilik maç planlıyorsunuz?',
        data: { formats: ['5v5', '7v7', '11v11'] }
      });
    }

    return responses;
  }

  // Yardımcı fonksiyonlar
  static getRandomPlayerCount() {
    return Math.floor(Math.random() * 15) + 5; // 5-20 arası
  }

  static generateFieldAvailability() {
    return {
      available: Math.floor(Math.random() * 3) + 1,
      busy: Math.floor(Math.random() * 2),
      bestTimes: ['14:00', '16:00', '20:00', '21:00'].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  }

  static getWeatherSuggestion() {
    const conditions = [
      { condition: 'sunny', message: 'Hava güzel! Açık hava sahası için mükemmel bir gün.' },
      { condition: 'rainy', message: 'Yağmur var, kapalı sahalarımızı tercih edebilirsiniz.' },
      { condition: 'cloudy', message: 'Bulutlu hava, futbol için ideal koşullar!' }
    ];
    
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  static getDaysSince(date) {
    const now = new Date();
    const past = new Date(date);
    return Math.floor((now - past) / (1000 * 60 * 60 * 24));
  }

  static containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  static getAvailableTimeSlots() {
    const slots = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    return slots.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  static getDynamicPricing(context) {
    const basePrice = 150;
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const currentHour = new Date().getHours();
    
    let price = basePrice;
    let factors = [];

    if (isWeekend) {
      price += 50;
      factors.push('Hafta sonu (+50₺)');
    }

    if (currentHour >= 18 && currentHour <= 21) {
      price += 25;
      factors.push('Prime time (+25₺)');
    }

    if (context?.userProfile?.isStudent) {
      price *= 0.8;
      factors.push('Öğrenci indirimi (-20%)');
    }

    return {
      price,
      factors,
      message: `Mevcut fiyat: ${price}₺/saat. ${factors.length > 0 ? 'Fiyat faktörleri: ' + factors.join(', ') : ''}`
    };
  }

  // Trend analizi
  static getTrendAnalysis(userProfile) {
    const trends = [];

    // Popüler saatler
    trends.push({
      type: 'popularTimes',
      title: 'Popüler Saatler',
      data: ['19:00-20:00', '20:00-21:00', '18:00-19:00'],
      message: 'Bu saatler en çok tercih edilen zaman dilimleri.'
    });

    // Popüler sahalar
    trends.push({
      type: 'popularFields',
      title: 'Popüler Sahalar',
      data: ['Halı Saha 1', 'Halı Saha 3'],
      message: 'Bu sahalar kullanıcılar tarafından en çok tercih ediliyor.'
    });

    return trends;
  }

  // Otomatik öneriler
  static getAutoSuggestions(context) {
    const suggestions = [];
    const { userProfile, currentPage, timeOfDay } = context;

    // Sayfa bazlı öneriler
    switch (currentPage) {
      case 'reservation':
        suggestions.push(...this.getReservationSuggestions(userProfile));
        suggestions.push(...this.getFieldSuggestions(currentPage, timeOfDay));
        break;
      
      case 'profile':
        suggestions.push(...this.getPersonalizedSuggestions(userProfile));
        break;
      
      case 'teams':
        suggestions.push(...this.getPlayerMatchingSuggestions(userProfile));
        break;
    }

    return suggestions;
  }
}

export default AIService; 