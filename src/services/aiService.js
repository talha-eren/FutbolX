// FutbolX AI Asistan Servisi - Veri Tabanı Entegreli
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AIService {
  constructor() {
    this.userId = this.getCurrentUserId();
    this.conversationHistory = [];
    this.userCache = null;
    this.venuesCache = null;
    this.playersCache = null;
  }

  // Kullanıcı ID'sini al
  getCurrentUserId() {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user._id;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Mevcut kullanıcı bilgilerini al
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Ana AI sorgu işleme fonksiyonu
  async processQuery(message) {
    try {
      const user = this.getCurrentUser();
      const lowerMessage = message.toLowerCase().trim();

      // Konuşma geçmişine ekle
      this.conversationHistory.push({
        type: 'user',
        message,
        timestamp: new Date()
      });

      let response;

      // Mesaj türüne göre işle
      if (this.isGreeting(lowerMessage)) {
        response = await this.handleGreeting(user);
      } else if (this.isMatchQuery(lowerMessage)) {
        response = await this.handleMatchQuery(user, message);
      } else if (this.isFieldQuery(lowerMessage)) {
        response = await this.handleFieldQuery(user, message);
      } else if (this.isPlayerQuery(lowerMessage)) {
        response = await this.handlePlayerQuery(user, message);
      } else if (this.isReservationQuery(lowerMessage)) {
        response = await this.handleReservationQuery(user, message);
      } else if (this.isStatsQuery(lowerMessage)) {
        response = await this.handleStatsQuery(user, message);
      } else if (this.isTeamQuery(lowerMessage)) {
        response = await this.handleTeamQuery(user, message);
      } else if (this.isPriceQuery(lowerMessage)) {
        response = await this.handlePriceQuery(user, message);
      } else if (this.isMotivationQuery(lowerMessage)) {
        response = await this.handleMotivationQuery(user, message);
      } else if (this.isSupportQuery(lowerMessage)) {
        response = await this.handleSupportQuery(user, message);
      } else if (this.isRandomQuery(lowerMessage)) {
        response = await this.handleRandomQuery(user, message);
      } else {
        response = await this.handleGeneralQuery(user, message);
      }

      // AI yanıtını geçmişe ekle
      this.conversationHistory.push({
        type: 'ai',
        message: response.text,
        timestamp: new Date()
      });

      return response;

    } catch (error) {
      console.error('AI Query Error:', error);
      return this.getErrorResponse();
    }
  }

  // Mesaj türü kontrolleri
  isGreeting(message) {
    const greetings = ['merhaba', 'selam', 'hey', 'hi', 'hello', 'günaydın', 'iyi akşamlar'];
    return greetings.some(g => message.includes(g));
  }

  isFieldQuery(message) {
    const fieldKeywords = ['saha', 'sahalar', 'field', 'venue', 'yer', 'lokasyon', 'açık saha', 'boş saha'];
    return fieldKeywords.some(k => message.includes(k));
  }

  isPlayerQuery(message) {
    const playerKeywords = ['oyuncu', 'player', 'arkadaş', 'takım arkadaşı', 'eşleş', 'kaleci', 'defans', 'orta saha', 'forvet'];
    return playerKeywords.some(k => message.includes(k));
  }

  isMatchQuery(message) {
    const matchKeywords = ['maç', 'match', 'oyun', 'karşılaşma', 'bugün hangi takımlar', 'hangi maçlar'];
    return matchKeywords.some(k => message.includes(k));
  }

  isReservationQuery(message) {
    const reservationKeywords = ['rezervasyon', 'booking', 'ayır', 'rezerve', 'randevu'];
    return reservationKeywords.some(k => message.includes(k));
  }

  isStatsQuery(message) {
    const statsKeywords = ['istatistik', 'stats', 'analiz', 'rapor', 'veriler', 'performans', 'en çok gol', 'en aktif'];
    return statsKeywords.some(k => message.includes(k));
  }

  isTeamQuery(message) {
    const teamKeywords = ['takım', 'team', 'grup', 'ekip', 'takımıma oyuncu', 'takım öner'];
    return teamKeywords.some(k => message.includes(k));
  }

  isPriceQuery(message) {
    const priceKeywords = ['fiyat', 'price', 'ücret', 'maliyet', 'para'];
    return priceKeywords.some(k => message.includes(k));
  }

  isMotivationQuery(message) {
    const motivationKeywords = ['motivasyon', 'moral', 'cesaret', 'ilham', 'motivasyon sözü'];
    return motivationKeywords.some(k => message.includes(k));
  }

  isSupportQuery(message) {
    const supportKeywords = ['destek', 'yardım', 'hata', 'sorun', 'iletişim', 'şikayet'];
    return supportKeywords.some(k => message.includes(k));
  }

  isRandomQuery(message) {
    const randomKeywords = ['rastgele', 'random', 'öner', 'tavsiye', 'bugünkü'];
    return randomKeywords.some(k => message.includes(k));
  }

  // Selamlama işleyicisi
  async handleGreeting(user) {
    const timeGreeting = this.getTimeBasedGreeting();
    const userName = user ? user.firstName || user.name : '';
    
    // Kullanıcının son aktivitelerini al
    const recentActivity = await this.getUserRecentActivity(user?.id);
    
    let personalizedMessage = '';
    if (recentActivity.lastReservation) {
      const daysSince = Math.floor((new Date() - new Date(recentActivity.lastReservation.date)) / (1000 * 60 * 60 * 24));
      if (daysSince <= 7) {
        personalizedMessage = ` Son maçın nasıl geçti? ${recentActivity.lastReservation.venue?.name || 'sahada'} güzel miydi?`;
      }
    }

    return {
      text: `${timeGreeting}${userName ? ` ${userName}` : ''}! 😊 FutbolX AI asistanınızım.${personalizedMessage} Bugün sana nasıl yardımcı olabilirim?`,
      quickActions: [
        { text: '🏟️ Saha Bul', action: 'find-venues' },
        { text: '👥 Oyuncu Ara', action: 'find-players' },
        { text: '📊 İstatistiklerim', action: 'my-stats' },
        { text: '⚽ Takım Kur', action: 'create-team' }
      ]
    };
  }

  // Saha sorguları işleyicisi
  async handleFieldQuery(user, message) {
    try {
      // Veri tabanından sahalar al
      const venues = await this.getVenuesFromDB();
      
      if (!venues || venues.length === 0) {
        return {
          text: 'Üzgünüm, şu anda sistemde kayıtlı saha bulunamadı. 😔',
          quickActions: []
        };
      }

      // Bugün için müsait sahalar
      const today = new Date().toISOString().split('T')[0];
      const availableVenues = [];

      for (const venue of venues) {
        const reservations = await this.getVenueReservations(venue._id, today);
        const availableSlots = this.calculateAvailableSlots(reservations);
        
        if (availableSlots > 0) {
          availableVenues.push({
            ...venue,
            availableSlots,
            nextAvailable: this.getNextAvailableTime(reservations)
          });
        }
      }

      if (availableVenues.length === 0) {
        return {
          text: 'Bugün tüm sahalar dolu görünüyor. 😔 Yarın için müsait sahalar var. Farklı bir tarih önerebilirim.',
          quickActions: [
            { text: '📅 Yarın İçin Bak', action: 'tomorrow-venues' },
            { text: '📆 Hafta Sonu', action: 'weekend-venues' },
            { text: '🔍 Farklı Bölge', action: 'other-areas' }
          ]
        };
      }

      // En iyi 3 sahayı göster
      const topVenues = availableVenues
        .sort((a, b) => b.availableSlots - a.availableSlots)
        .slice(0, 3);

      const venueList = topVenues.map(v => 
        `🏟️ **${v.name}**\n📍 ${v.location}\n💰 ${v.pricePerHour} TL/saat\n⏰ ${v.availableSlots} slot müsait\n🕐 Sonraki: ${v.nextAvailable}`
      ).join('\n\n');

      return {
        text: `Bugün ${availableVenues.length} saha müsait! İşte en iyi seçenekler:\n\n${venueList}\n\nHangi sahayı tercih edersin?`,
        quickActions: [
          { text: '📱 Hemen Rezerve Et', action: 'quick-reserve' },
          { text: '💰 Fiyat Karşılaştır', action: 'compare-prices' },
          { text: '📍 Yakın Sahalar', action: 'nearby-venues' },
          { text: '⭐ En Popüler', action: 'popular-venues' }
        ],
        data: { venues: topVenues }
      };

    } catch (error) {
      console.error('Field query error:', error);
      return {
        text: 'Saha bilgilerini getirirken bir sorun yaşadım. 😅 Biraz sonra tekrar dener misin?',
        quickActions: []
      };
    }
  }

  // Oyuncu sorguları işleyicisi
  async handlePlayerQuery(user, message) {
    try {
      if (!user) {
        return {
          text: 'Oyuncu eşleştirme için giriş yapman gerekiyor. 🔐 Giriş yaptıktan sonra sana en uygun oyuncuları bulabilirim!',
          quickActions: [
            { text: '🔑 Giriş Yap', action: 'login' },
            { text: '📝 Kayıt Ol', action: 'register' }
          ]
        };
      }

      const lowerMessage = message.toLowerCase();

      // Pozisyon bazlı arama
      const positionKeywords = {
        'kaleci': 'Kaleci',
        'defans': 'Defans', 
        'orta saha': 'Orta Saha',
        'forvet': 'Forvet'
      };

      for (const [keyword, position] of Object.entries(positionKeywords)) {
        if (lowerMessage.includes(keyword)) {
          const positionPlayers = await this.getPlayersByPosition(position, user.id);
          
          if (positionPlayers.length === 0) {
            return {
              text: `${position} pozisyonunda şu anda müsait oyuncu bulunamadı. 😔`,
              quickActions: [
                { text: '👥 Tüm Oyuncular', action: 'all-players' },
                { text: '📤 Arkadaş Davet Et', action: 'invite-friends' },
                { text: '⚽ Takım Kur', action: 'create-team' }
              ]
            };
          }

          const playerList = positionPlayers.slice(0, 3).map(player => 
            `👤 **${player.firstName} ${player.lastName}**\n⚽ ${player.position}\n📊 ${player.footballExperience}\n📍 ${player.location || 'Konum belirtilmemiş'}\n🎯 ${player.goalsScored || 0} gol`
          ).join('\n\n');

          return {
            text: `${position} pozisyonunda ${positionPlayers.length} oyuncu buldum:\n\n${playerList}`,
            quickActions: [
              { text: '📱 Mesaj Gönder', action: 'send-message' },
              { text: '⚽ Takım Kur', action: 'create-team' },
              { text: '👀 Tüm ' + position + ' Oyuncuları', action: 'view-all-position' }
            ],
            data: { players: positionPlayers.map(p => ({ player: p, compatibilityScore: 85 })) }
          };
        }
      }

      // Takım için oyuncu arama
      if (lowerMessage.includes('takımıma') || lowerMessage.includes('takım için')) {
        const userTeams = await this.getUserTeams(user.id);
        
        if (userTeams.length === 0) {
          return {
            text: 'Henüz bir takımın yok. Önce takım oluştur, sonra oyuncu arayalım! 🚀',
            quickActions: [
              { text: '⚽ Takım Oluştur', action: 'create-team' },
              { text: '🔍 Takım Ara', action: 'search-teams' }
            ]
          };
        }

        // İlk takım için eksik pozisyonları analiz et
        const team = userTeams[0];
        const existingPositions = team.members.map(m => m.position).filter(p => p);
        const allPositions = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];
        const missingPositions = allPositions.filter(pos => 
          !existingPositions.includes(pos) || 
          existingPositions.filter(p => p === pos).length < 2
        );

        if (missingPositions.length === 0) {
          return {
            text: `${team.name} takımın tüm pozisyonlarda yeterli oyuncuya sahip! 🎉`,
            quickActions: [
              { text: '👥 Takım Detayları', action: 'team-details' },
              { text: '⚽ Maç Organize Et', action: 'organize-match' }
            ]
          };
        }

        const suggestions = await this.getTeamPlayerSuggestions(team._id, missingPositions);
        
        if (suggestions.length === 0) {
          return {
            text: `${team.name} için ${missingPositions.join(', ')} pozisyonlarında oyuncu bulamadım. 😔`,
            quickActions: [
              { text: '📤 Arkadaş Davet Et', action: 'invite-friends' },
              { text: '🌍 Farklı Bölgeler', action: 'search-other-areas' }
            ]
          };
        }

        const suggestionList = suggestions.slice(0, 3).map(s => 
          `👤 **${s.player.firstName} ${s.player.lastName}**\n⚽ ${s.player.position}\n📊 ${s.player.footballExperience}\n🎯 %${s.matchScore} uyumlu\n💡 ${s.reason}`
        ).join('\n\n');

        return {
          text: `${team.name} takımın için ${missingPositions.join(', ')} pozisyonlarında oyuncu önerileri:\n\n${suggestionList}`,
          quickActions: [
            { text: '📤 Davet Gönder', action: 'send-team-invite' },
            { text: '👀 Daha Fazla Öneri', action: 'more-suggestions' },
            { text: '⚽ Farklı Takım', action: 'other-team-suggestions' }
          ],
          data: { players: suggestions }
        };
      }

      // Genel oyuncu arama (mevcut kod)
      const players = await this.getPlayersFromDB(user.id);
      
      if (!players || players.length === 0) {
        return {
          text: 'Şu anda sistemde başka oyuncu bulunamadı. 😔 Sen ilk olabilirsin! Profilini tamamla ve arkadaşlarını davet et.',
          quickActions: [
            { text: '👤 Profili Tamamla', action: 'complete-profile' },
            { text: '📤 Arkadaş Davet Et', action: 'invite-friends' }
          ]
        };
      }

      // Akıllı eşleştirme yap
      const matches = await this.calculatePlayerMatches(user, players);
      
      if (matches.length === 0) {
        return {
          text: `Senin seviyende (${user.footballExperience || 'Belirtilmemiş'}) oyuncu bulamadım. 🤔 Farklı seviyelere bakalım mı?`,
          quickActions: [
            { text: '📈 Tüm Seviyeler', action: 'all-levels' },
            { text: '🌍 Tüm Bölgeler', action: 'all-locations' },
            { text: '⚽ Takım Kur', action: 'create-team' }
          ]
        };
      }

      // En iyi 3 eşleşmeyi göster
      const topMatches = matches.slice(0, 3);
      const playerList = topMatches.map(match => 
        `👤 **${match.player.firstName} ${match.player.lastName}**\n⚽ ${match.player.position || 'Pozisyon belirtilmemiş'}\n📊 ${match.player.footballExperience || 'Seviye belirtilmemiş'}\n🎯 %${match.compatibilityScore} uyumlu\n📍 ${match.player.location || 'Konum belirtilmemiş'}\n⚽ ${match.player.goalsScored || 0} gol`
      ).join('\n\n');

      return {
        text: `Harika! ${matches.length} oyuncu buldum senin için. En uyumlu olanları:\n\n${playerList}\n\nBunlarla iletişime geçmek ister misin?`,
        quickActions: [
          { text: '📱 Mesaj Gönder', action: 'send-message' },
          { text: '⚽ Takım Kur', action: 'create-team' },
          { text: '🎯 Maç Organize Et', action: 'organize-match' },
          { text: '👀 Tüm Oyuncular', action: 'view-all-players' }
        ],
        data: { players: topMatches }
      };

    } catch (error) {
      console.error('Player query error:', error);
      return {
        text: 'Oyuncu bilgilerini getirirken sorun yaşadım. 😅 Tekrar dener misin?',
        quickActions: []
      };
    }
  }

  // Rezervasyon sorguları işleyicisi
  async handleReservationQuery(user, message) {
    try {
      if (!user) {
        return {
          text: 'Rezervasyon yapmak için giriş yapman gerekiyor. 🔐',
          quickActions: [
            { text: '🔑 Giriş Yap', action: 'login' }
          ]
        };
      }

      // Kullanıcının geçmiş rezervasyonları
      const userReservations = await this.getUserReservations(user.id);
      const upcomingReservations = userReservations.filter(r => new Date(r.date) > new Date());
      
      let responseText = '';
      
      if (upcomingReservations.length > 0) {
        const nextReservation = upcomingReservations[0];
        const reservationDate = new Date(nextReservation.date).toLocaleDateString('tr-TR');
        responseText = `Yaklaşan rezervasyonun: **${nextReservation.venue?.name}** - ${reservationDate} ${nextReservation.time}\n\n`;
      }

      // Bugün için öneriler
      const todayVenues = await this.getAvailableVenuesToday();
      
      if (todayVenues.length > 0) {
        const venueList = todayVenues.slice(0, 2).map(v => 
          `🏟️ ${v.name} - ${v.pricePerHour} TL/saat`
        ).join('\n');
        
        responseText += `Bugün için müsait sahalar:\n${venueList}`;
      } else {
        responseText += 'Bugün tüm sahalar dolu. Yarın için bakayım mı?';
      }

      return {
        text: responseText,
        quickActions: [
          { text: '📅 Bugün Rezerve Et', action: 'reserve-today' },
          { text: '📆 Yarın İçin Bak', action: 'reserve-tomorrow' },
          { text: '📋 Rezervasyonlarım', action: 'my-reservations' },
          { text: '❌ Rezervasyon İptal', action: 'cancel-reservation' }
        ]
      };

    } catch (error) {
      console.error('Reservation query error:', error);
      return {
        text: 'Rezervasyon bilgilerini getirirken sorun yaşadım. 😅',
        quickActions: []
      };
    }
  }

  // İstatistik sorguları işleyicisi
  async handleStatsQuery(user, message) {
    try {
      const lowerMessage = message.toLowerCase();

      // En çok gol atan oyuncular
      if (lowerMessage.includes('en çok gol') || lowerMessage.includes('top scorer')) {
        const topScorers = await this.getTopScorers();
        
        if (topScorers.length === 0) {
          return {
            text: 'Henüz gol istatistikleri bulunmuyor. 😔 İlk golü sen at!',
            quickActions: [
              { text: '⚽ Maça Katıl', action: 'join-match' },
              { text: '🏟️ Saha Bul', action: 'find-venues' }
            ]
          };
        }

        const scorerList = topScorers.slice(0, 5).map((player, index) => 
          `${index + 1}. **${player.firstName} ${player.lastName}** - ${player.goalsScored} gol ⚽`
        ).join('\n');

        return {
          text: `🏆 **En Çok Gol Atan Oyuncular:**\n\n${scorerList}\n\nSen de bu listede yer almak ister misin?`,
          quickActions: [
            { text: '⚽ Maça Katıl', action: 'join-match' },
            { text: '🎯 Hedef Belirle', action: 'set-goal-target' },
            { text: '📊 Benim İstatistiklerim', action: 'my-stats' }
          ],
          data: { topScorers }
        };
      }

      // En aktif takımlar
      if (lowerMessage.includes('en aktif') || lowerMessage.includes('aktif takım')) {
        const activeTeams = await this.getMostActiveTeams();
        
        if (activeTeams.length === 0) {
          return {
            text: 'Henüz aktif takım istatistikleri bulunmuyor. 😔',
            quickActions: [
              { text: '⚽ Takım Kur', action: 'create-team' },
              { text: '🔍 Takım Ara', action: 'search-teams' }
            ]
          };
        }

        const teamList = activeTeams.slice(0, 5).map((team, index) => 
          `${index + 1}. **${team.name}** - ${team.matchCount} maç 🏆`
        ).join('\n');

        return {
          text: `🔥 **En Aktif Takımlar:**\n\n${teamList}\n\nBu takımlardan birine katılmak ister misin?`,
          quickActions: [
            { text: '🔍 Takımlara Katıl', action: 'join-active-teams' },
            { text: '⚽ Kendi Takımını Kur', action: 'create-team' },
            { text: '📊 Takım İstatistikleri', action: 'team-stats' }
          ],
          data: { activeTeams }
        };
      }

      // Gelişim analizi
      if (lowerMessage.includes('gelişim') || lowerMessage.includes('progress') || lowerMessage.includes('performans')) {
        if (!user) {
          return {
            text: 'Gelişim analizin için giriş yapman gerekiyor. 🔐',
            quickActions: [{ text: '🔑 Giriş Yap', action: 'login' }]
          };
        }

        const progressAnalysis = await this.getUserProgressAnalysis(user.id);
        const userStats = await this.getUserStats(user.id);
        
        if (!progressAnalysis || !userStats) {
          return {
            text: 'Henüz yeterli verin yok gelişim analizi için. Birkaç maç oyna, sonra tekrar gel! 📈',
            quickActions: [
              { text: '⚽ Maça Katıl', action: 'join-match' },
              { text: '🏟️ Saha Bul', action: 'find-venues' }
            ]
          };
        }

        let analysisText = `📈 **${user.firstName}'in Gelişim Analizi:**\n\n`;
        
        // Genel performans
        if (userStats.totalMatches > 0) {
          const goalAverage = (userStats.totalMatches > 0) ? (userStats.totalMatches / userStats.totalMatches).toFixed(1) : 0;
          analysisText += `⚽ Maç başına ortalama: ${goalAverage} aktivite\n`;
          analysisText += `🎯 Toplam gol: ${userStats.totalMatches || 0}\n`;
          analysisText += `🏆 Oynanan maç: ${userStats.totalReservations || 0}\n\n`;
        }

        // Gelişim önerileri
        const suggestions = [];
        if (userStats.totalMatches < 5) {
          suggestions.push("🌟 Daha fazla maç oynayarak deneyim kazan!");
        }
        if (userStats.totalSpent > 0 && userStats.totalReservations > 0) {
          const avgSpent = userStats.totalSpent / userStats.totalReservations;
          if (avgSpent > 150) {
            suggestions.push("💰 Daha ekonomik sahalarda oynayarak bütçeni optimize et!");
          }
        }
        if (!user.position || user.position === '') {
          suggestions.push("⚽ Profilinde pozisyon belirleyerek daha iyi eşleşmeler al!");
        }

        if (suggestions.length > 0) {
          analysisText += `**💡 Gelişim Önerileri:**\n${suggestions.map(s => `• ${s}`).join('\n')}`;
        }

        return {
          text: analysisText,
          quickActions: [
            { text: '🎯 Hedef Belirle', action: 'set-goals' },
            { text: '📚 Antrenman Programı', action: 'training-program' },
            { text: '⚽ Maça Katıl', action: 'join-match' },
            { text: '👤 Profili Güncelle', action: 'update-profile' }
          ],
          data: { progressAnalysis, userStats }
        };
      }

      // Genel istatistikler (mevcut kod)
      const stats = await this.getSystemStats();
      const userStats = user ? await this.getUserStats(user.id) : null;

      let responseText = '📊 **FutbolX İstatistikleri**\n\n';
      
      // Sistem istatistikleri
      responseText += `👥 Toplam Kullanıcı: ${stats.totalUsers}\n`;
      responseText += `🏟️ Aktif Saha: ${stats.totalVenues}\n`;
      responseText += `📅 Toplam Rezervasyon: ${stats.totalReservations}\n`;
      responseText += `⚽ Aktif Takım: ${stats.totalTeams}\n`;
      responseText += `📈 Bu hafta: ${stats.weeklyReservations} rezervasyon\n\n`;

      // Kullanıcı istatistikleri
      if (userStats) {
        responseText += `**Senin İstatistiklerin:**\n`;
        responseText += `⚽ Toplam Maç: ${userStats.totalMatches}\n`;
        responseText += `🏟️ Rezervasyon: ${userStats.totalReservations}\n`;
        responseText += `👥 Takım Sayısı: ${userStats.teamCount}\n`;
        responseText += `💰 Toplam Harcama: ${userStats.totalSpent} TL\n`;
        
        // Favori saha
        if (userStats.favoriteVenue) {
          responseText += `🏆 En çok gittiğin saha: ${userStats.favoriteVenue.venue.name}`;
        }
      }

      return {
        text: responseText,
        quickActions: [
          { text: '📊 Detaylı İstatistik', action: 'detailed-stats' },
          { text: '📈 Gelişim Analizi', action: 'progress-analysis' },
          { text: '🏆 Liderlik Tablosu', action: 'leaderboard' },
          { text: '🎯 Hedeflerimi Gör', action: 'view-goals' }
        ],
        data: { systemStats: stats, userStats }
      };

    } catch (error) {
      console.error('Stats query error:', error);
      return {
        text: 'İstatistik bilgilerini getirirken sorun yaşadım. 😅',
        quickActions: []
      };
    }
  }

  // Takım sorguları işleyicisi
  async handleTeamQuery(user, message) {
    try {
      if (!user) {
        return {
          text: 'Takım özelliklerini kullanmak için giriş yapman gerekiyor. 🔐',
          quickActions: [
            { text: '🔑 Giriş Yap', action: 'login' }
          ]
        };
      }

      const userTeams = await this.getUserTeams(user.id);
      const availableTeams = await this.getAvailableTeams(user.id);

      let responseText = '';

      if (userTeams.length > 0) {
        responseText += `**Takımların:**\n`;
        userTeams.forEach(team => {
          responseText += `⚽ ${team.name} (${team.memberCount}/${team.maxMembers} oyuncu)\n`;
        });
        responseText += '\n';
      }

      if (availableTeams.length > 0) {
        responseText += `**Katılabileceğin Takımlar:**\n`;
        availableTeams.slice(0, 3).forEach(team => {
          responseText += `🔥 ${team.name} - ${team.memberCount}/${team.maxMembers} oyuncu\n`;
          responseText += `📍 ${team.location || 'Konum belirtilmemiş'}\n\n`;
        });
      } else {
        responseText += 'Şu anda katılabileceğin takım yok. Kendi takımını oluştur!';
      }

      return {
        text: responseText,
        quickActions: [
          { text: '⚽ Takım Oluştur', action: 'create-team' },
          { text: '🔍 Takım Ara', action: 'search-teams' },
          { text: '👥 Takıma Katıl', action: 'join-team' },
          { text: '🏆 Turnuva Düzenle', action: 'create-tournament' }
        ],
        data: { userTeams, availableTeams }
      };

    } catch (error) {
      console.error('Team query error:', error);
      return {
        text: 'Takım bilgilerini getirirken sorun yaşadım. 😅',
        quickActions: []
      };
    }
  }

  // Fiyat sorguları işleyicisi
  async handlePriceQuery(user, message) {
    try {
      const priceAnalysis = await this.getPriceAnalysis();
      
      if (!priceAnalysis) {
        return {
          text: 'Fiyat bilgilerini getiremedim. 😔',
          quickActions: []
        };
      }

      let responseText = '💰 **Saha Fiyat Analizi**\n\n';
      responseText += `📊 Ortalama: ${Math.round(priceAnalysis.average)} TL/saat\n`;
      responseText += `💸 En Uygun: ${priceAnalysis.min} TL/saat\n`;
      responseText += `💎 En Pahalı: ${priceAnalysis.max} TL/saat\n\n`;

      // Zaman bazlı fiyatlar
      if (priceAnalysis.timeBasedPrices) {
        responseText += `**Zaman Bazlı Ortalamalar:**\n`;
        responseText += `🌅 Sabah (09-12): ${Math.round(priceAnalysis.timeBasedPrices.morning)} TL\n`;
        responseText += `☀️ Öğlen (12-17): ${Math.round(priceAnalysis.timeBasedPrices.afternoon)} TL\n`;
        responseText += `🌆 Akşam (17-22): ${Math.round(priceAnalysis.timeBasedPrices.evening)} TL\n\n`;
      }

      // Bütçe önerisi
      if (user) {
        const userBudget = await this.getUserBudgetAnalysis(user.id);
        if (userBudget) {
          responseText += `**Senin İçin Öneriler:**\n`;
          responseText += `💡 Ortalama harcaman: ${Math.round(userBudget.averageSpent)} TL\n`;
          responseText += `🎯 Bütçe dostu sahalar: ${userBudget.affordableVenues} adet`;
        }
      }

      return {
        text: responseText,
        quickActions: [
          { text: '💸 En Uygun Sahalar', action: 'cheapest-venues' },
          { text: '⭐ Kalite/Fiyat Dengesi', action: 'best-value' },
          { text: '📊 Detaylı Analiz', action: 'detailed-price-analysis' },
          { text: '💰 Bütçe Hesapla', action: 'budget-calculator' }
        ],
        data: priceAnalysis
      };

    } catch (error) {
      console.error('Price query error:', error);
      return {
        text: 'Fiyat bilgilerini getirirken sorun yaşadım. 😅',
        quickActions: []
      };
    }
  }

  // Genel sorgu işleyicisi
  async handleGeneralQuery(user, message) {
    const userName = user ? user.firstName || user.name : 'dostum';
    
    return {
      text: `Hmm, bu konuda tam emin değilim ${userName}. 🤔 Ama futbol konularında sana kesinlikle yardımcı olabilirim! Ne yapmak istiyorsun?`,
      quickActions: [
        { text: '🏟️ Saha Bul', action: 'find-venues' },
        { text: '👥 Oyuncu Ara', action: 'find-players' },
        { text: '⚽ Takım Kur', action: 'create-team' },
        { text: '📊 İstatistikler', action: 'view-stats' }
      ]
    };
  }

  // Maç sorguları işleyicisi
  async handleMatchQuery(user, message) {
    try {
      const lowerMessage = message.toLowerCase();
      
      // Bugünkü maçlar
      if (lowerMessage.includes('bugün')) {
        const todayMatches = await this.getTodayMatches();
        
        if (!todayMatches || todayMatches.length === 0) {
          return {
            text: 'Bugün planlanmış maç bulunmuyor. 😔 Yeni bir maç organize etmek ister misin?',
            quickActions: [
              { text: '⚽ Maç Organize Et', action: 'organize-match' },
              { text: '📅 Yarınki Maçlar', action: 'tomorrow-matches' },
              { text: '🏟️ Saha Bul', action: 'find-venues' }
            ]
          };
        }

        const matchList = todayMatches.slice(0, 3).map(match => 
          `⚽ **${match.title}**\n🏟️ ${match.venue?.name}\n⏰ ${match.startTime} - ${match.endTime}\n👥 ${match.players.length}/${match.maxPlayers} oyuncu\n💰 ${match.price} TL`
        ).join('\n\n');

        return {
          text: `Bugün ${todayMatches.length} maç planlanmış! 🔥\n\n${matchList}\n\nHangi maça katılmak istersin?`,
          quickActions: [
            { text: '🎯 Maça Katıl', action: 'join-match' },
            { text: '📋 Tüm Maçlar', action: 'all-matches' },
            { text: '⚽ Yeni Maç Kur', action: 'create-match' }
          ],
          data: { matches: todayMatches }
        };
      }

      // Belirli saha için maçlar
      const venueMatch = lowerMessage.match(/(.+)\s*sahasında/);
      if (venueMatch) {
        const venueName = venueMatch[1].trim();
        const venueMatches = await this.getVenueMatches(venueName);
        
        if (venueMatches.length === 0) {
          return {
            text: `${venueName} sahasında yakın zamanda planlanmış maç yok. 🤔`,
            quickActions: [
              { text: '📅 Farklı Tarih', action: 'other-dates' },
              { text: '🏟️ Başka Sahalar', action: 'other-venues' }
            ]
          };
        }

        const matchList = venueMatches.map(match => 
          `📅 ${new Date(match.date).toLocaleDateString('tr-TR')}\n⏰ ${match.startTime}\n⚽ ${match.title}`
        ).join('\n\n');

        return {
          text: `${venueName} sahasındaki yaklaşan maçlar:\n\n${matchList}`,
          quickActions: [
            { text: '🎯 Maça Katıl', action: 'join-match' },
            { text: '📋 Detayları Gör', action: 'match-details' }
          ]
        };
      }

      // Genel maç listesi
      const allMatches = await this.getUpcomingMatches();
      
      if (allMatches.length === 0) {
        return {
          text: 'Şu anda yaklaşan maç bulunmuyor. Sen ilk maçı organize et! 🚀',
          quickActions: [
            { text: '⚽ Maç Organize Et', action: 'organize-match' },
            { text: '👥 Oyuncu Bul', action: 'find-players' }
          ]
        };
      }

      const matchList = allMatches.slice(0, 3).map(match => 
        `⚽ **${match.title}**\n📅 ${new Date(match.date).toLocaleDateString('tr-TR')}\n🏟️ ${match.venue?.name}\n👥 ${match.players.length}/${match.maxPlayers}`
      ).join('\n\n');

      return {
        text: `Yaklaşan maçlar:\n\n${matchList}`,
        quickActions: [
          { text: '🎯 Maça Katıl', action: 'join-match' },
          { text: '📋 Tüm Maçlar', action: 'all-matches' },
          { text: '⚽ Yeni Maç Kur', action: 'create-match' }
        ],
        data: { matches: allMatches }
      };

    } catch (error) {
      console.error('Match query error:', error);
      return {
        text: 'Maç bilgilerini getirirken sorun yaşadım. 😅',
        quickActions: []
      };
    }
  }

  // Motivasyon sorguları işleyicisi
  async handleMotivationQuery(user, message) {
    const motivationQuotes = [
      "⚽ 'Futbol sadece bir oyun değil, hayattır!' - Pelé",
      "🔥 'Başarı, hazırlık fırsatla buluştuğunda doğar!' - Bobby Unser",
      "💪 'Kazanmak her şey değildir, ama kazanmaya çalışmak her şeydir!' - Vince Lombardi",
      "🎯 'Mükemmellik bir hedefe ulaşmak değil, sürekli gelişmektir!' - Tony Robbins",
      "⭐ 'Büyük rüyalar kuran insanlar, büyük başarılar elde eder!' - David Schwartz",
      "🚀 'Bugün yapamayacağın şey, yarın yapabileceğin şeydir!' - Muhammad Ali",
      "🏆 'Şampiyon olmak istiyorsan, şampiyon gibi antrenman yap!' - Mo Farah",
      "💯 'Başarı %1 ilham, %99 ter!' - Thomas Edison"
    ];

    const randomQuote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
    const userName = user ? user.firstName : 'dostum';

    // Kullanıcının son performansına göre kişiselleştirilmiş motivasyon
    let personalMessage = '';
    if (user) {
      const userStats = await this.getUserStats(user.id);
      if (userStats && userStats.totalMatches > 0) {
        if (userStats.totalMatches < 5) {
          personalMessage = `\n\n🌟 ${userName}, futbol yolculuğunun başındasın! Her maç seni daha iyi yapacak.`;
        } else if (userStats.totalMatches < 20) {
          personalMessage = `\n\n🔥 ${userName}, ${userStats.totalMatches} maçla güzel bir deneyim kazandın! Devam et!`;
        } else {
          personalMessage = `\n\n👑 ${userName}, ${userStats.totalMatches} maçla gerçek bir futbol veteranısın!`;
        }
      }
    }

    return {
      text: `${randomQuote}${personalMessage}`,
      quickActions: [
        { text: '⚽ Maça Katıl', action: 'join-match' },
        { text: '🏋️ Antrenman Bul', action: 'find-training' },
        { text: '🎯 Hedef Belirle', action: 'set-goals' },
        { text: '📊 Gelişimimi Gör', action: 'view-progress' }
      ]
    };
  }

  // Destek sorguları işleyicisi
  async handleSupportQuery(user, message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hata') || lowerMessage.includes('sorun')) {
      return {
        text: `Yaşadığın sorunu çözmek için elimden geleni yapacağım! 🛠️\n\nHata bildirimi için:\n📧 support@futbolx.com\n📱 WhatsApp: +90 555 123 4567\n\nYa da uygulama içinden "Ayarlar > Hata Bildir" menüsünü kullanabilirsin.`,
        quickActions: [
          { text: '📧 E-posta Gönder', action: 'send-email' },
          { text: '📱 WhatsApp', action: 'whatsapp-support' },
          { text: '❓ SSS', action: 'view-faq' },
          { text: '🔄 Uygulamayı Yenile', action: 'refresh-app' }
        ]
      };
    }

    return {
      text: `Merhaba! FutbolX destek ekibi olarak size yardımcı olmaktan mutluluk duyarım! 😊\n\n📞 **İletişim Kanalları:**\n📧 E-posta: support@futbolx.com\n📱 WhatsApp: +90 555 123 4567\n💬 Canlı Destek: Pazartesi-Cuma 09:00-18:00\n\n🕐 Ortalama yanıt süresi: 2 saat`,
      quickActions: [
        { text: '📧 E-posta Gönder', action: 'send-email' },
        { text: '📱 WhatsApp Destek', action: 'whatsapp-support' },
        { text: '❓ Sık Sorulan Sorular', action: 'view-faq' },
        { text: '📋 Kullanım Kılavuzu', action: 'user-guide' }
      ]
    };
  }

  // Rastgele öneriler işleyicisi
  async handleRandomQuery(user, message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('maç')) {
      // Rastgele maç önerisi
      const matches = await this.getUpcomingMatches();
      if (matches.length > 0) {
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        return {
          text: `🎲 **Rastgele Maç Önerisi:**\n\n⚽ ${randomMatch.title}\n📅 ${new Date(randomMatch.date).toLocaleDateString('tr-TR')}\n🏟️ ${randomMatch.venue?.name}\n⏰ ${randomMatch.startTime}\n👥 ${randomMatch.players.length}/${randomMatch.maxPlayers} oyuncu\n💰 ${randomMatch.price} TL\n\nBu maça katılmak ister misin?`,
          quickActions: [
            { text: '🎯 Bu Maça Katıl', action: 'join-this-match' },
            { text: '🎲 Başka Maç Öner', action: 'random-match' },
            { text: '📋 Tüm Maçlar', action: 'all-matches' }
          ]
        };
      }
    }

    if (lowerMessage.includes('oyuncu') || message.includes('tavsiye')) {
      // Bugünkü oyuncu tavsiyesi
      const tips = [
        "🎯 **Bugünkü İpucu:** Pas verirken karşı takım oyuncusunun pozisyonunu kontrol et!",
        "⚽ **Teknik İpucu:** Top kontrolünde vücudunu topla rakip arasına koy!",
        "🏃 **Kondisyon İpucu:** Maç öncesi 10 dakika ısınma yapmayı unutma!",
        "🧠 **Taktik İpucu:** Savunmada kompakt kal, hücumda genişlik kullan!",
        "💪 **Mental İpucu:** Hata yaptığında kendini topla, bir sonraki hamlene odaklan!",
        "🎨 **Yaratıcılık İpucu:** Bazen beklenmedik paslar en etkili çözümdür!",
        "🤝 **Takım İpucu:** Takım arkadaşlarınla sürekli iletişim halinde ol!"
      ];
      
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      
      return {
        text: randomTip,
        quickActions: [
          { text: '🎲 Başka İpucu', action: 'random-tip' },
          { text: '📚 Antrenman Programı', action: 'training-program' },
          { text: '🎯 Beceri Geliştir', action: 'skill-development' }
        ]
      };
    }

    // Genel rastgele öneri
    const randomSuggestions = [
      {
        text: "🌟 **Rastgele Öneri:** Bugün yeni bir pozisyon denemeye ne dersin? Farklı pozisyonlar oynamak genel futbol anlayışını geliştirir!",
        actions: [
          { text: '👥 Farklı Pozisyon Oyuncuları', action: 'different-positions' },
          { text: '📚 Pozisyon Rehberi', action: 'position-guide' }
        ]
      },
      {
        text: "🎯 **Rastgele Aktivite:** Bugün bir arkadaşını futbola davet et! Futbol paylaştıkça güzelleşir.",
        actions: [
          { text: '📤 Arkadaş Davet Et', action: 'invite-friend' },
          { text: '👥 Yeni Oyuncular', action: 'find-new-players' }
        ]
      },
      {
        text: "🏆 **Rastgele Hedef:** Bu hafta 3 farklı sahada oynamayı hedefle! Farklı sahalar farklı deneyimler sunar.",
        actions: [
          { text: '🏟️ Yeni Sahalar Keşfet', action: 'explore-venues' },
          { text: '📍 Yakın Sahalar', action: 'nearby-venues' }
        ]
      }
    ];

    const randomSuggestion = randomSuggestions[Math.floor(Math.random() * randomSuggestions.length)];

    return {
      text: randomSuggestion.text,
      quickActions: randomSuggestion.actions
    };
  }

  // Veri tabanı fonksiyonları
  async getVenuesFromDB() {
    try {
      const response = await fetch(`${API_BASE_URL}/venues`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.venues : [];
    } catch (error) {
      console.error('Get venues error:', error);
      return [];
    }
  }

  async getPlayersFromDB(excludeUserId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/players?exclude=${excludeUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.users : [];
    } catch (error) {
      console.error('Get players error:', error);
      return [];
    }
  }

  async getUserRecentActivity(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.activity : {};
    } catch (error) {
      console.error('Get user activity error:', error);
      return {};
    }
  }

  async getVenueReservations(venueId, date) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/venue/${venueId}?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.reservations : [];
    } catch (error) {
      console.error('Get venue reservations error:', error);
      return [];
    }
  }

  async getUserReservations(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.reservations : [];
    } catch (error) {
      console.error('Get user reservations error:', error);
      return [];
    }
  }

  async getSystemStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/system`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.stats : {};
    } catch (error) {
      console.error('Get system stats error:', error);
      return {};
    }
  }

  async getUserStats(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.stats : null;
    } catch (error) {
      console.error('Get user stats error:', error);
      return null;
    }
  }

  async getUserTeams(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.teams : [];
    } catch (error) {
      console.error('Get user teams error:', error);
      return [];
    }
  }

  async getAvailableTeams(excludeUserId) {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/available?exclude=${excludeUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.teams : [];
    } catch (error) {
      console.error('Get available teams error:', error);
      return [];
    }
  }

  async getPriceAnalysis() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/price-analysis`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.analysis : null;
    } catch (error) {
      console.error('Get price analysis error:', error);
      return null;
    }
  }

  async getUserBudgetAnalysis(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/user/${userId}/budget`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.budget : null;
    } catch (error) {
      console.error('Get user budget error:', error);
      return null;
    }
  }

  // Maç veri tabanı fonksiyonları
  async getTodayMatches() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/matches/today?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.matches : [];
    } catch (error) {
      console.error('Get today matches error:', error);
      return [];
    }
  }

  async getUpcomingMatches() {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/upcoming`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.matches : [];
    } catch (error) {
      console.error('Get upcoming matches error:', error);
      return [];
    }
  }

  async getVenueMatches(venueName) {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/venue?name=${encodeURIComponent(venueName)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.matches : [];
    } catch (error) {
      console.error('Get venue matches error:', error);
      return [];
    }
  }

  // Gelişmiş oyuncu arama fonksiyonları
  async getPlayersByPosition(position, excludeUserId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/players/position?position=${encodeURIComponent(position)}&exclude=${excludeUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.users : [];
    } catch (error) {
      console.error('Get players by position error:', error);
      return [];
    }
  }

  async getTopScorers() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/top-scorers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.players : [];
    } catch (error) {
      console.error('Get top scorers error:', error);
      return [];
    }
  }

  async getMostActiveTeams() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/most-active-teams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.teams : [];
    } catch (error) {
      console.error('Get most active teams error:', error);
      return [];
    }
  }

  // Takım için oyuncu önerisi
  async getTeamPlayerSuggestions(teamId, missingPositions) {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/player-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ missingPositions })
      });
      const data = await response.json();
      return data.success ? data.suggestions : [];
    } catch (error) {
      console.error('Get team player suggestions error:', error);
      return [];
    }
  }

  // Kullanıcı gelişim analizi
  async getUserProgressAnalysis(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/user/${userId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data.progress : null;
    } catch (error) {
      console.error('Get user progress error:', error);
      return null;
    }
  }

  // Yardımcı fonksiyonlar
  getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  }

  calculateAvailableSlots(reservations) {
    const totalSlots = 14; // 08:00-22:00 arası saatlik slotlar
    return Math.max(0, totalSlots - reservations.length);
  }

  getNextAvailableTime(reservations) {
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let hour = Math.max(8, currentHour + 1); hour <= 22; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = reservations.some(r => r.time === timeSlot);
      if (!isBooked) {
        return timeSlot;
      }
    }
    return 'Yarın 08:00';
  }

  async calculatePlayerMatches(user, players) {
    const matches = [];
    
    for (const player of players) {
      let score = 50; // Base score
      
      // Seviye uyumluluğu
      if (user.footballExperience && player.footballExperience) {
        if (user.footballExperience === player.footballExperience) {
          score += 30;
        }
      }
      
      // Pozisyon uyumluluğu
      if (user.position && player.position) {
        const complementary = {
          'Kaleci': ['Defans'],
          'Defans': ['Kaleci', 'Orta Saha'],
          'Orta Saha': ['Defans', 'Forvet'],
          'Forvet': ['Orta Saha']
        };
        
        if (complementary[user.position]?.includes(player.position)) {
          score += 20;
        }
      }
      
      // Lokasyon uyumluluğu
      if (user.location && player.location && user.location === player.location) {
        score += 15;
      }
      
      matches.push({
        player,
        compatibilityScore: Math.min(100, score)
      });
    }
    
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  async getAvailableVenuesToday() {
    const venues = await this.getVenuesFromDB();
    const today = new Date().toISOString().split('T')[0];
    const availableVenues = [];
    
    for (const venue of venues) {
      const reservations = await this.getVenueReservations(venue._id, today);
      if (this.calculateAvailableSlots(reservations) > 0) {
        availableVenues.push(venue);
      }
    }
    
    return availableVenues;
  }

  getErrorResponse() {
    return {
      text: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. 😅 Biraz sonra tekrar dener misin?',
      quickActions: [
        { text: '🔄 Tekrar Dene', action: 'retry' },
        { text: '🏠 Ana Sayfa', action: 'home' }
      ]
    };
  }

  // Konuşma geçmişini temizle
  clearConversationHistory() {
    this.conversationHistory = [];
  }

  // Akıllı yanıt üretici (AIAssistant için)
  getSmartResponse(userMessage, context = {}) {
    try {
      const { userProfile, currentPage, timeOfDay } = context;
      const message = userMessage.toLowerCase().trim();
      
      // Basit akıllı yanıtlar
      const smartResponses = [];
      
      if (message.includes('saha') || message.includes('rezervasyon')) {
        smartResponses.push({
          message: '🏟️ Saha rezervasyonu için size yardımcı olabilirim! Hangi tarih ve saatte oynamak istiyorsunuz?',
          confidence: 0.9
        });
      }
      
      if (message.includes('oyuncu') || message.includes('takım')) {
        smartResponses.push({
          message: '⚽ Oyuncu eşleştirme konusunda uzmanım! Hangi pozisyonda oyuncu arıyorsunuz?',
          confidence: 0.8
        });
      }
      
      if (message.includes('fiyat') || message.includes('ücret')) {
        smartResponses.push({
          message: '💰 Güncel fiyat listesi: Hafta içi 150₺/saat, Hafta sonu 200₺/saat. Öğrenci indirimi %20!',
          confidence: 0.9
        });
      }
      
      return smartResponses;
    } catch (error) {
      console.error('Smart response error:', error);
      return [];
    }
  }

  // Otomatik öneriler üretici (AIAssistant için)
  getAutoSuggestions(context = {}) {
    try {
      const { userProfile, currentPage, timeOfDay } = context;
      const suggestions = [];
      
      // Sayfa bazlı öneriler
      if (currentPage === 'reservation') {
        suggestions.push({
          type: 'Saha Önerisi',
          message: 'Bu saatte Halı Saha 2 müsait! Hemen rezervasyon yapabilirsiniz.'
        });
      }
      
      if (currentPage === 'teams') {
        suggestions.push({
          type: 'Takım Önerisi',
          message: 'Seviyenize uygun 3 takım bulundu. Katılım talebinde bulunmak ister misiniz?'
        });
      }
      
      // Zaman bazlı öneriler
      if (timeOfDay >= 18 && timeOfDay <= 22) {
        suggestions.push({
          type: 'Akşam Maçı',
          message: 'Akşam saatleri için ideal! Bugün 2 maç organize ediliyor.'
        });
      }
      
      // Kullanıcı profili bazlı öneriler
      if (userProfile?.position) {
        suggestions.push({
          type: 'Pozisyon Eşleştirme',
          message: `${userProfile.position} pozisyonunda 5 oyuncu sizi bekliyor!`
        });
      }
      
      return suggestions;
    } catch (error) {
      console.error('Auto suggestions error:', error);
      return [];
    }
  }
}

// Singleton instance
const aiService = new AIService();

export default aiService; 