import AsyncStorage from '@react-native-async-storage/async-storage';

// NetworkConfig'i CommonJS require ile import et
const { getApiUrl } = require('./networkConfig');

export interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  name?: string; // Backward compatibility için
  position: string;
  phone?: string;
  email?: string;
  location?: string;
  bio?: string;
  footballExperience?: string;
  age?: number;
  profileImage?: string;
  profilePicture?: string; // Backend'den gelen alan
  stats?: {
    matches: number;
    goals: number;
    assists: number;
    rating: number;
  };
}

export interface MatchingPreferences {
  maxDistance: number; // km
  skillLevelRange: number; // ±seviye
  ageRange: [number, number];
  preferredPositions: string[];
  preferredTimes: string[];
  onlyActiveUsers: boolean;
}

export interface PlayerMatch {
  player: Player;
  compatibilityScore: number;
  distance?: number;
  matchReasons: string[];
}

export interface TeamMatchingResult {
  success: boolean;
  teamMembers: PlayerMatch[];
  userPosition: string;
  requiredPositions: { [key: string]: number };
  totalMatches: number;
  positionAlternatives: { [key: string]: PlayerMatch[] };
  message?: string;
}

class PlayerMatchingService {
  private userProfile: Player | null = null;
  private preferences: MatchingPreferences | null = null;

  // 6 kişilik takım için pozisyon gereksinimleri
  private getTeamRequirements(userPosition: string): { [key: string]: number } {
    const requirements: { [key: string]: number } = {
      'Kaleci': 1,
      'Defans': 2,
      'Orta Saha': 2,
      'Forvet': 1
    };

    // Kullanıcının pozisyonunu çıkar
    if (requirements[userPosition]) {
      requirements[userPosition] -= 1;
    }

    return requirements;
  }

  // Kullanıcı profilini yükle - AuthContext'ten de dene
  async loadUserProfile(): Promise<Player | null> {
    try {
      // Önce AsyncStorage'dan dene
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
        console.log('✅ AsyncStorage\'dan profil yüklendi:', this.userProfile?.username);
        return this.userProfile;
      }

      // AsyncStorage'da yoksa AuthContext'ten al
      const authUser = await AsyncStorage.getItem('user');
      if (authUser) {
        const user = JSON.parse(authUser);
        this.userProfile = {
          _id: user._id || user.id,
          firstName: user.firstName || user.name?.split(' ')[0] || 'Kullanıcı',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          username: user.username || 'user',
          position: user.position || 'Orta Saha',
          phone: user.phone,
          email: user.email,
          location: user.location,
          bio: user.bio,
          footballExperience: user.footballExperience || 'Başlangıç',
          age: user.age || 25,
          profileImage: user.profilePicture || user.profileImage
        };
        console.log('✅ AuthContext\'ten profil oluşturuldu:', this.userProfile?.username);
        return this.userProfile;
      }

      console.log('❌ Hiçbir yerden profil bulunamadı');
      return null;
    } catch (error) {
      console.error('❌ Profil yükleme hatası:', error);
      return null;
    }
  }

  // Eşleştirme tercihlerini yükle
  async loadPreferences(): Promise<MatchingPreferences> {
    try {
      const prefs = await AsyncStorage.getItem('matchingPreferences');
      const loadedPrefs = prefs ? JSON.parse(prefs) : this.getDefaultPreferences();
      this.preferences = loadedPrefs;
      return loadedPrefs;
    } catch (error) {
      console.error('Tercih yükleme hatası:', error);
      const defaultPrefs = this.getDefaultPreferences();
      this.preferences = defaultPrefs;
      return defaultPrefs;
    }
  }

  // Varsayılan tercihler
  getDefaultPreferences(): MatchingPreferences {
    return {
      maxDistance: 10, // km
      skillLevelRange: 1, // ±1 seviye
      ageRange: [18, 50],
      preferredPositions: [],
      preferredTimes: ['18:00-22:00'],
      onlyActiveUsers: true
    };
  }

  // Gerçek kullanıcılardan takım eşleştirme
  async getTeamMatches(filters: Partial<MatchingPreferences> = {}): Promise<TeamMatchingResult> {
    try {
      console.log('🔄 Takım eşleştirme başlatılıyor...');
      
      await this.loadUserProfile();
      await this.loadPreferences();

      if (!this.userProfile) {
        console.log('❌ Kullanıcı profili bulunamadı');
        return {
          success: false,
          teamMembers: [],
          userPosition: '',
          requiredPositions: {},
          totalMatches: 0,
          positionAlternatives: {},
          message: 'Lütfen önce profilinizi tamamlayın'
        };
      }

      if (!this.userProfile.position) {
        console.log('❌ Kullanıcı pozisyonu belirtilmemiş');
        return {
          success: false,
          teamMembers: [],
          userPosition: '',
          requiredPositions: {},
          totalMatches: 0,
          positionAlternatives: {},
          message: 'Lütfen profilinizde pozisyonunuzu belirtin'
        };
      }

      const userPosition = this.userProfile.position;
      const requiredPositions = this.getTeamRequirements(userPosition);

      console.log('🏃‍♂️ Kullanıcı pozisyonu:', userPosition);
      console.log('📋 Gerekli pozisyonlar:', requiredPositions);

      // Gerçek kullanıcıları API'den çek
      const allUsers = await this.fetchAllUsers();
      
      if (!allUsers || allUsers.length === 0) {
        console.log('❌ API\'den pozisyonu olan kullanıcı bulunamadı');
        return {
          success: false,
          teamMembers: [],
          userPosition,
          requiredPositions,
          totalMatches: 0,
          positionAlternatives: {},
          message: 'Henüz pozisyonu tanımlı başka kullanıcı bulunamadı. Diğer kullanıcıların profillerini tamamlamasını bekleyin.'
        };
      }

      // Kullanıcının kendisini listeden çıkar
      const otherUsers = allUsers.filter(user => user._id !== this.userProfile!._id);
      console.log('👥 Diğer kullanıcı sayısı:', otherUsers.length);

      if (otherUsers.length === 0) {
        return {
          success: false,
          teamMembers: [],
          userPosition,
          requiredPositions,
          totalMatches: 0,
          positionAlternatives: {},
          message: 'Henüz başka kullanıcı bulunamadı. Daha fazla kullanıcının uygulamaya katılmasını bekleyin.'
        };
      }

      // Pozisyonlara göre takım üyelerini seç - Her pozisyon için 3 alternatif
      const teamMembers: PlayerMatch[] = [];
      const positionAlternatives: { [key: string]: PlayerMatch[] } = {};

      for (const [position, count] of Object.entries(requiredPositions)) {
        if (count > 0) {
          const positionPlayers = otherUsers
            .filter(user => user.position === position)
            .slice(0, 3) // Her pozisyon için maksimum 3 alternatif
            .map(player => ({
              player,
              compatibilityScore: this.calculateCompatibilityScore(player),
              distance: Math.random() * 10, // Şimdilik rastgele mesafe
              matchReasons: this.getMatchReasons(player)
            }))
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore); // En uyumludan başla

          console.log(`⚽ ${position} pozisyonunda ${positionPlayers.length} alternatif bulundu`);
          
          // Pozisyon alternatiflerini kaydet
          positionAlternatives[position] = positionPlayers;
          
          // Tüm alternatifleri ana listeye ekle
          teamMembers.push(...positionPlayers);
        }
      }

      console.log('✅ Toplam alternatif oyuncu bulundu:', teamMembers.length);

      return {
        success: true,
        teamMembers: teamMembers.sort((a, b) => b.compatibilityScore - a.compatibilityScore),
        userPosition,
        requiredPositions,
        totalMatches: teamMembers.length,
        positionAlternatives,
        message: 'Takım eşleştirme işlemi başarılı'
      };

    } catch (error) {
      console.error('❌ Takım eşleştirme hatası:', error);
      return {
        success: false,
        teamMembers: [],
        userPosition: this.userProfile?.position || '',
        requiredPositions: {},
        totalMatches: 0,
        positionAlternatives: {},
        message: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.'
      };
    }
  }

  // Tüm kullanıcıları API'den çek - SADECE GERÇEK KULLANICILAR
  private async fetchAllUsers(): Promise<Player[]> {
    try {
      console.log('🔄 Gerçek kullanıcı verileri çekiliyor...');
      
      const token = await this.getAuthToken();
      if (!token) {
        console.log('❌ Auth token bulunamadı');
        return [];
      }

      const apiUrl = await getApiUrl('/users');
      console.log('🔗 Kullanıcılar API URL:', apiUrl);

      // Cache'i bypass etmek için timestamp ekle
      const urlWithTimestamp = `${apiUrl}?t=${Date.now()}`;
      console.log('🔗 Cache bypass URL:', urlWithTimestamp);

      const response = await fetch(urlWithTimestamp, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('📡 API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error Response:', errorText);
        return [];
      }

      const data: any = await response.json();
      console.log('✅ API den gelen ham veri:', {
        length: data.length,
        firstUser: data[0] ? {
          username: data[0].username,
          name: data[0].name,
          position: data[0].position
        } : 'Veri yok'
      });
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log('❌ Geçersiz veri formatı veya boş liste');
        return [];
      }
      
      // Veri dönüşümü - Backend'den gelen User modelini Player interface'ine dönüştür
      const players: Player[] = data
        .filter(user => {
          // Detaylı filtreleme ve loglama
          const hasId = user && user._id;
          const hasPosition = user.position && user.position.trim() !== '';
          const isNotTestUser = !['guest', 'deneme', 'test'].some(testName => 
            user.username?.toLowerCase().includes(testName) || 
            user.name?.toLowerCase().includes(testName)
          );
          
          if (!hasId) {
            console.log('❌ ID olmayan kullanıcı filtrelendi:', user);
            return false;
          }
          
          if (!hasPosition) {
            console.log('❌ Pozisyonu olmayan kullanıcı filtrelendi:', user.username);
            return false;
          }
          
          if (!isNotTestUser) {
            console.log('❌ Test kullanıcısı filtrelendi:', user.username);
            return false;
          }
          
          console.log('✅ Geçerli kullanıcı:', user.username, '|', user.position);
          return true;
        })
        .map((user: any) => {
          // Name alanını firstName ve lastName'e ayır
          const nameParts = (user.name || user.username || 'Kullanıcı').split(' ');
          const firstName = nameParts[0] || user.username || 'Kullanıcı';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Yaş hesaplama (eğer doğum tarihi varsa)
          let age = user.age;
          if (!age && user.birthDate) {
            const birthYear = new Date(user.birthDate).getFullYear();
            age = new Date().getFullYear() - birthYear;
          }

          const player: Player = {
            _id: user._id,
            firstName,
            lastName,
            username: user.username || 'user',
            name: user.name || `${firstName} ${lastName}`, // Backward compatibility
            position: user.position, // Pozisyon zorunlu
            phone: user.phone || '',
            email: user.email || '',
            location: user.location || '',
            bio: user.bio || '',
            footballExperience: user.level || user.footballExperience || 'Başlangıç',
            age: age || 25, // Varsayılan yaş
            profileImage: user.profilePicture || user.profileImage || '',
            profilePicture: user.profilePicture || user.profileImage || '',
            stats: user.stats || {
              matches: 0, // Gerçek veri yoksa 0
              goals: 0,
              assists: 0,
              rating: 70 // Varsayılan rating
            }
          };

          console.log('🔄 Dönüştürülen oyuncu:', {
            username: player.username,
            name: player.name,
            position: player.position,
            hasPhone: !!player.phone,
            hasEmail: !!player.email
          });

          return player;
        });

      console.log('🔄 Pozisyonu olan gerçek oyuncu sayısı:', players.length);
      
      if (players.length > 0) {
        console.log('👤 İlk gerçek oyuncu örneği:', {
          name: `${players[0].firstName} ${players[0].lastName}`,
          position: players[0].position,
          phone: players[0].phone ? '✅' : '❌',
          email: players[0].email ? '✅' : '❌',
          location: players[0].location || 'Belirtilmemiş'
        });

        // Pozisyon dağılımını göster
        const positionCounts = players.reduce((acc, player) => {
          acc[player.position] = (acc[player.position] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('📊 Pozisyon dağılımı:', positionCounts);
      } else {
        console.log('⚠️ Hiçbir kullanıcının pozisyonu tanımlı değil');
      }
      
      return players;
    } catch (error) {
      console.error('❌ Kullanıcı çekme hatası:', error);
      return [];
    }
  }

  // Uyumluluk skoru hesaplama - Sadece pozisyon bazlı
  private calculateCompatibilityScore(player: Player): number {
    if (!this.userProfile) return 0;

    let score = 70; // Başlangıç skoru (pozisyon uyumlu olduğu için yüksek)

    // Pozisyon uyumluluğu ana faktör
    if (player.position !== this.userProfile.position) {
      score += 20; // Farklı pozisyon = takım için ideal
    }

    // Profil tamamlılığı bonusu
    if (player.bio) score += 5;
    if (player.phone) score += 5;

    return Math.min(100, Math.max(60, score)); // En az %60, en fazla %100
  }

  // Eşleştirme nedenlerini getir - Sadece pozisyon bazlı
  private getMatchReasons(player: Player): string[] {
    const reasons: string[] = [];

    // Ana neden: Pozisyon uyumluluğu
    reasons.push(`${player.position} pozisyonu gerekli`);

    // Profil kalitesi
    if (player.bio) {
      reasons.push('Detaylı profil');
    }

    if (player.phone) {
      reasons.push('İletişim bilgisi mevcut');
    }

    return reasons.slice(0, 2); // En fazla 2 neden göster
  }

  // Eşleştirme tercihlerini kaydet
  async savePreferences(preferences: Partial<MatchingPreferences>): Promise<boolean> {
    try {
      const currentPrefs = this.preferences || this.getDefaultPreferences();
      this.preferences = { ...currentPrefs, ...preferences } as MatchingPreferences;
      await AsyncStorage.setItem('matchingPreferences', JSON.stringify(this.preferences));
      return true;
    } catch (error) {
      console.error('Tercih kaydetme hatası:', error);
      return false;
    }
  }

  // Favori oyuncular
  async addToFavorites(playerId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(playerId)) {
        favorites.push(playerId);
        await AsyncStorage.setItem('favoritePlayers', JSON.stringify(favorites));
      }
      return true;
    } catch (error) {
      console.error('Favori ekleme hatası:', error);
      return false;
    }
  }

  async getFavorites(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem('favoritePlayers');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Favori yükleme hatası:', error);
      return [];
    }
  }

  // Auth token al
  private async getAuthToken(): Promise<string> {
    try {
      // Farklı token key'lerini dene
      const tokenKeys = ['authToken', 'token', 'userToken', 'accessToken'];
      
      for (const key of tokenKeys) {
        const token = await AsyncStorage.getItem(key);
        if (token) {
          console.log(`✅ Token bulundu (${key}):`, token.substring(0, 20) + '...');
          return token;
        }
      }
      
      console.log('❌ Hiçbir token bulunamadı');
      return '';
    } catch (error) {
      console.error('❌ Token alma hatası:', error);
      return '';
    }
  }

  // Konum hesaplama (Haversine formülü)
  calculateDistance(coord1: { latitude: number; longitude: number }, coord2: { latitude: number; longitude: number }): number {
    const R = 6371; // Dünya'nın yarıçapı (km)
    
    const lat1 = coord1.latitude * Math.PI / 180;
    const lat2 = coord2.latitude * Math.PI / 180;
    const deltaLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const deltaLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  // WhatsApp ile iletişim
  openWhatsApp(player: Player): string {
    console.log('📱 WhatsApp açılıyor:', player.phone);
    
    if (!player.phone || player.phone.trim() === '') {
      console.log('❌ Telefon numarası bulunamadı');
      return '';
    }
    
    // Telefon numarasını temizle (sadece rakamlar)
    let cleanPhone = player.phone.replace(/\D/g, '');
    console.log('🧹 Temizlenmiş telefon:', cleanPhone);
    
    // Türkiye kodu kontrolü
    if (cleanPhone.startsWith('90')) {
      // Zaten +90 ile başlıyor
      cleanPhone = cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      // 0 ile başlıyorsa 90 ekle
      cleanPhone = '90' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 10) {
      // 10 haneli numara ise başına 90 ekle
      cleanPhone = '90' + cleanPhone;
    }
    
    console.log('🔢 Final telefon numarası:', cleanPhone);
    
    const message = encodeURIComponent(
      `Merhaba ${player.firstName}! FutbolX uygulaması üzerinden sizi buldum. ${player.position} pozisyonunda takımımızda yer almak ister misiniz? ⚽`
    );
    
    // Önce whatsapp:// protokolünü dene, sonra https://wa.me/ formatını dene
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    console.log('🔗 WhatsApp URL:', whatsappUrl);
    
    return whatsappUrl;
  }

  // Email ile iletişim
  openEmail(player: Player): string {
    console.log('📧 Email açılıyor:', player.email);
    
    if (!player.email || player.email.trim() === '') {
      console.log('❌ Email adresi bulunamadı');
      return '';
    }
    
    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(player.email)) {
      console.log('❌ Geçersiz email formatı:', player.email);
      return '';
    }
    
    const subject = encodeURIComponent('FutbolX - Takım Davetiyesi ⚽');
    const body = encodeURIComponent(
      `Merhaba ${player.firstName},

FutbolX uygulaması üzerinden sizi buldum. ${player.position} pozisyonunda takımımızda yer almak ister misiniz?

Hakkımda:
• Pozisyon: ${this.userProfile?.position || 'Belirtilmemiş'}
• Konum: ${this.userProfile?.location || 'Belirtilmemiş'}

Futbol oynamak ve yeni arkadaşlıklar kurmak için birlikte olalım!

Saygılarımla,
${this.userProfile?.firstName || 'FutbolX Kullanıcısı'}

---
Bu mesaj FutbolX mobil uygulaması üzerinden gönderilmiştir.`
    );
    
    const emailUrl = `mailto:${player.email}?subject=${subject}&body=${body}`;
    console.log('🔗 Email URL:', emailUrl);
    
    return emailUrl;
  }
}

export default new PlayerMatchingService(); 