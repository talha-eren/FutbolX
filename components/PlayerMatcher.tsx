import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';
import PlayerMatchingService, { PlayerMatch, TeamMatchingResult } from '../services/PlayerMatchingService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  position: string;
  phone?: string;
  email?: string;
  location?: string;
  bio?: string;
  footballExperience?: string;
}

interface PlayerMatcherProps {
  visible: boolean;
  onClose: () => void;
  userPosition?: string;
  userLocation?: string;
  onMatchPlayers: () => Promise<any>;
}

const PlayerMatcher: React.FC<PlayerMatcherProps> = ({
  visible,
  onClose,
  userPosition,
  userLocation,
  onMatchPlayers
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Başlangıç, 1: Arama, 2: Sonuçlar
  const [teamResult, setTeamResult] = useState<TeamMatchingResult | null>(null);
  const [error, setError] = useState('');
  const [searchProgress] = useState(new Animated.Value(0));

  // Tema renkleri
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');

  // Pozisyon renkleri
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'Kaleci': '#FF5722',
      'Defans': '#2196F3',
      'Orta Saha': '#4CAF50',
      'Forvet': '#FF9800'
    };
    return colors[position] || '#757575';
  };

  // Pozisyon bazlı takım ihtiyaçları mesajları
  const getTeamNeeds = (position: string) => {
    const messages: Record<string, string> = {
      'Kaleci': 'Kaleci olarak sizin için 6 kişilik takım oluşturuluyor...',
      'Defans': 'Defans oyuncusu olarak sizin için uygun takım arkadaşları aranıyor...',
      'Orta Saha': 'Orta saha oyuncusu olarak sizin için ideal takım kurgusu hazırlanıyor...',
      'Forvet': 'Forvet olarak sizin için mükemmel bir takım oluşturuluyor...'
    };
    return messages[position] || 'Sizin için uygun takım arkadaşları aranıyor...';
  };

  // Takım arkadaşı arama - Yeni servis ile
  const searchPlayers = async () => {
    console.log('🔍 Arama başlatılıyor...');
    console.log('👤 Kullanıcı pozisyonu:', userPosition);
    console.log('📍 Kullanıcı konumu:', userLocation);
    
    if (!userPosition) {
      setError('Önce profilinizde pozisyonunuzu belirtmelisiniz.');
      return;
    }

    setLoading(true);
    setError('');
    setStep(1);

    // Arama animasyonu
    Animated.timing(searchProgress, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false
    }).start();

    try {
      console.log('🔄 PlayerMatchingService.getTeamMatches() çağrılıyor...');
      
      // Yeni TeamMatching servisini kullan
      const result = await PlayerMatchingService.getTeamMatches();
      
      console.log('📊 Eşleştirme sonucu:', result);
      
      if (result.success) {
        setTimeout(() => {
          setTeamResult(result);
          setStep(2);
          setLoading(false);
        }, 3000);
      } else {
        console.log('❌ Eşleştirme başarısız:', result.message);
        setError(result.message || 'Takım eşleştirmesi sırasında hata oluştu');
        setLoading(false);
        setStep(0);
      }
    } catch (error: any) {
      console.error('❌ Arama hatası:', error);
      setError(error.message || 'Bağlantı hatası');
      setLoading(false);
      setStep(0);
    }
  };

  // WhatsApp ile iletişim
  const contactPlayer = (player: Player) => {
    if (player.phone) {
      let phoneNumber = player.phone.replace(/\s+/g, '');
      
      // Türkiye telefon numarası formatı
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '90' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('90') && !phoneNumber.startsWith('+90')) {
        phoneNumber = '90' + phoneNumber;
      } else if (phoneNumber.startsWith('+90')) {
        phoneNumber = phoneNumber.substring(1);
      }

      const message = encodeURIComponent(
        `Merhaba ${player.firstName}! 👋\n\n` +
        `FutbolX uygulaması üzerinden sizinle takım arkadaşı olarak eşleştik. ` +
        `Pozisyonunuz: ${player.position}\n\n` +
        `6 kişilik takımımızda birlikte futbol oynamak için iletişime geçmek istedim. ⚽\n\n` +
        `FutbolX ile güzel maçlar! 🏆`
      );

      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
      
      Linking.canOpenURL(whatsappUrl).then(supported => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Hata', 'WhatsApp yüklü değil');
        }
      });
    } else if (player.email) {
      const subject = encodeURIComponent('FutbolX - Takım Arkadaşı Teklifi');
      const body = encodeURIComponent(
        `Merhaba ${player.firstName},\n\n` +
        `FutbolX uygulaması üzerinden sizinle takım arkadaşı olarak eşleştik. ` +
        `Pozisyonunuz: ${player.position}\n\n` +
        `6 kişilik takımımızda birlikte futbol oynamak için iletişime geçmek istedim.\n\n` +
        `İyi maçlar!\n\n` +
        `FutbolX ile`
      );
      Linking.openURL(`mailto:${player.email}?subject=${subject}&body=${body}`);
    } else {
      Alert.alert('Bilgi', 'Bu oyuncunun iletişim bilgisi bulunmuyor');
    }
  };

  // Modal'ı sıfırla
  const resetMatcher = () => {
    setStep(0);
    setTeamResult(null);
    setError('');
    searchProgress.setValue(0);
    setLoading(false);
  };

  // Modal kapatma
  const handleClose = () => {
    resetMatcher();
    onClose();
  };

  // Başlangıç ekranı
  const renderStartScreen = () => (
    <ScrollView style={styles.startScreen} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        style={styles.headerGradient}
      >
        <IconSymbol name="person.3.fill" size={48} color="white" />
        <ThemedText style={styles.headerGradientTitle}>Takım Arkadaşı Bul</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          6 kişilik takım için uygun oyuncular bulun
        </ThemedText>
      </LinearGradient>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <IconSymbol name="location.fill" size={24} color="#4CAF50" />
          <View style={styles.infoText}>
            <ThemedText style={styles.infoTitle}>Konum Bazlı</ThemedText>
            <ThemedText style={styles.infoDescription}>
              Yakınınızdaki oyuncularla eşleşin
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <IconSymbol name="sportscourt.fill" size={24} color="#4CAF50" />
          <View style={styles.infoText}>
            <ThemedText style={styles.infoTitle}>Pozisyon Uyumlu</ThemedText>
            <ThemedText style={styles.infoDescription}>
              Sizin pozisyonunuza uygun takım oluşturulur
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <IconSymbol name="message.fill" size={24} color="#4CAF50" />
          <View style={styles.infoText}>
            <ThemedText style={styles.infoTitle}>Anında İletişim</ThemedText>
            <ThemedText style={styles.infoDescription}>
              WhatsApp ile doğrudan iletişim kurun
            </ThemedText>
          </View>
        </View>
      </View>

      {userPosition && (
        <View style={styles.userPositionInfo}>
          <ThemedText style={styles.userPositionText}>
            Sizin Pozisyonunuz: 
            <Text style={[styles.positionBadge, { color: getPositionColor(userPosition) }]}>
              {' ' + userPosition}
            </Text>
          </ThemedText>
        </View>
      )}

      {/* Hata Mesajı */}
      {error && (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#e53935" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {/* Ana Buton */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.mainSearchButton, 
            { 
              backgroundColor: userPosition && !loading ? tintColor : '#ccc',
              opacity: loading ? 0.7 : 1
            }
          ]}
          onPress={searchPlayers}
          disabled={!userPosition || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <IconSymbol name="magnifyingglass" size={20} color="white" />
              <ThemedText style={styles.mainSearchButtonText}>
                Takım Arkadaşlarını Bul
              </ThemedText>
            </>
          )}
        </TouchableOpacity>

        {!userPosition && (
          <ThemedText style={styles.warningText}>
            Eşleştirme yapabilmek için profilinizde pozisyonunuzu belirtmelisiniz
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );

  // Arama ekranı
  const renderSearchScreen = () => (
    <View style={styles.centerContainer}>
      <IconSymbol name="magnifyingglass" size={60} color={tintColor} />
      <ThemedText style={styles.searchTitle}>
        🔍 Size uygun takım arkadaşları bulunuyor...
      </ThemedText>
      <ThemedText style={styles.searchSubtitle}>
        Pozisyonunuza göre ideal oyuncular aranıyor
      </ThemedText>
      
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: searchProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: tintColor
            }
          ]}
        />
      </View>
      <ThemedText style={styles.progressText}>Arama devam ediyor...</ThemedText>
    </View>
  );

  // Sonuç ekranı
  const renderResultsScreen = () => (
    <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.successHeader}>
        <IconSymbol name="checkmark.circle.fill" size={60} color="#4CAF50" />
        <ThemedText style={styles.successTitle}>
          ✨ Harika! Size uygun takım arkadaşları bulundu
        </ThemedText>
        <ThemedText style={styles.successSubtitle}>
          Aşağıdaki oyuncularla iletişime geçerek takımınızı oluşturabilirsiniz
        </ThemedText>
      </View>

      {teamResult && teamResult.teamMembers.length > 0 && (
        <View style={styles.positionSection}>
          <View style={styles.positionHeader}>
            <View style={[styles.positionBadgeHeader, { backgroundColor: getPositionColor(teamResult.userPosition) }]}>
              <IconSymbol name="sportscourt.fill" size={16} color="white" />
              <Text style={styles.positionBadgeText}>{teamResult.userPosition}</Text>
            </View>
            <ThemedText style={styles.playerCount}>({teamResult.teamMembers.length} takım arkadaşı)</ThemedText>
          </View>
          
          {teamResult.teamMembers.map((match) => (
            <ThemedView key={match.player._id} style={[styles.playerCard, { backgroundColor: cardColor }]}>
              <View style={styles.playerInfo}>
                <View style={styles.playerHeader}>
                  <ThemedText style={styles.playerName}>
                    {match.player.firstName} {match.player.lastName}
                  </ThemedText>
                  <View style={[styles.playerPositionBadge, { backgroundColor: getPositionColor(match.player.position) }]}>
                    <Text style={styles.playerPositionText}>{match.player.position}</Text>
                  </View>
                </View>
                
                <ThemedText style={styles.playerUsername}>@{match.player.username}</ThemedText>
                
                {match.player.location && (
                  <View style={styles.locationContainer}>
                    <IconSymbol name="location.fill" size={12} color={secondaryTextColor} />
                    <ThemedText style={styles.locationText}>{match.player.location}</ThemedText>
                  </View>
                )}
                
                {match.player.bio && (
                  <ThemedText style={styles.playerBio} numberOfLines={2}>
                    {match.player.bio}
                  </ThemedText>
                )}

                {/* Uyumluluk Skoru */}
                <View style={styles.compatibilityContainer}>
                  <ThemedText style={styles.compatibilityLabel}>Uyumluluk:</ThemedText>
                  <View style={styles.compatibilityBar}>
                    <View 
                      style={[
                        styles.compatibilityFill, 
                        { 
                          width: `${match.compatibilityScore}%`,
                          backgroundColor: match.compatibilityScore > 80 ? '#4CAF50' : 
                                         match.compatibilityScore > 60 ? '#FF9800' : '#F44336'
                        }
                      ]} 
                    />
                  </View>
                  <ThemedText style={styles.compatibilityScore}>
                    {Math.round(match.compatibilityScore)}%
                  </ThemedText>
                </View>

                {/* Eşleştirme Nedenleri */}
                {match.matchReasons && match.matchReasons.length > 0 && (
                  <View style={styles.reasonsContainer}>
                    {match.matchReasons.map((reason, index) => (
                      <View key={index} style={styles.reasonChip}>
                        <ThemedText style={styles.reasonText}>{reason}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* WhatsApp Butonu */}
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => contactPlayer(match.player)}
                >
                  <IconSymbol name="message.fill" size={16} color="white" />
                  <Text style={styles.contactButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))}
        </View>
      )}

      {teamResult && teamResult.teamMembers.length === 0 && (
        <View style={styles.noResultsContainer}>
          <IconSymbol name="person.crop.circle.badge.questionmark" size={50} color={secondaryTextColor} />
          <ThemedText style={styles.noResultsTitle}>Takım arkadaşı bulunamadı</ThemedText>
          <ThemedText style={styles.noResultsText}>
            {teamResult.message || 'Şu anda sizin pozisyonunuza uygun oyuncu bulunmuyor. Daha sonra tekrar deneyin.'}
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>🤝 Takım Arkadaşı Eşleştirme</ThemedText>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {step === 0 && renderStartScreen()}
          {step === 1 && renderSearchScreen()}
          {step === 2 && renderResultsScreen()}
        </View>

        {/* Footer - Sadece gerekli durumlarda göster */}
        {(step === 2 || error) && (
          <View style={styles.footer}>
            {step === 2 && (
              <TouchableOpacity
                style={[styles.retryButton, { borderColor: tintColor }]}
                onPress={resetMatcher}
              >
                <IconSymbol name="arrow.clockwise" size={20} color={tintColor} />
                <Text style={[styles.retryButtonText, { color: tintColor }]}>Yeniden Ara</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={[styles.cancelButtonText, { color: secondaryTextColor }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  startScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerGradient: {
    padding: 30,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  headerGradientTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    color: 'white',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  userPositionInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
  },
  userPositionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positionBadge: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e53935',
  },
  errorText: {
    marginLeft: 10,
    flex: 1,
    color: '#e53935',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainSearchButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    minWidth: '80%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mainSearchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  warningText: {
    color: '#757575',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    marginBottom: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  searchSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    opacity: 0.7,
  },
  progressContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  resultsContainer: {
    flex: 1,
  },
  successHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.7,
  },
  positionSection: {
    marginBottom: 20,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  positionBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  positionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  playerCount: {
    marginLeft: 10,
    fontSize: 14,
    opacity: 0.7,
  },
  playerCard: {
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerInfo: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerUsername: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  playerPositionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playerPositionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  playerBio: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  compatibilityLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  compatibilityBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  compatibilityScore: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 35,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  reasonChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    marginRight: 6,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default PlayerMatcher; 