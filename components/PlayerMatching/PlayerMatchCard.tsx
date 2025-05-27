import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Linking, Alert } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import CompatibilityScore from './CompatibilityScore';
import { PlayerMatch } from '../../services/PlayerMatchingService';
import PlayerMatchingService from '../../services/PlayerMatchingService';

interface PlayerMatchCardProps {
  match: PlayerMatch;
  onPress: (player: any) => void;
  onMessage: (player: any) => void;
  onFavorite: (player: any) => void;
}

const PlayerMatchCard: React.FC<PlayerMatchCardProps> = ({ match, onPress, onMessage, onFavorite }) => {
  const { player, compatibilityScore, distance } = match;

  // Mevki bazlı renkler
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'Kaleci': '#FF6B35',      // Turuncu - Kaleci
      'Defans': '#4285F4',      // Mavi - Defans
      'Orta Saha': '#34A853',   // Yeşil - Orta Saha
      'Forvet': '#EA4335'       // Kırmızı - Forvet
    };
    return colors[position] || '#757575';
  };

  const getPositionIcon = (position: string) => {
    const icons: Record<string, any> = {
      'Kaleci': 'shield.fill',
      'Defans': 'shield',
      'Orta Saha': 'sportscourt.fill',
      'Forvet': 'flame.fill'
    };
    return icons[position] || 'person.fill';
  };

  const getExperienceColor = (experience: string) => {
    const colors: Record<string, string> = {
      'Başlangıç': '#4CAF50',
      'Orta': '#FF9800',
      'İleri': '#F44336',
      'Profesyonel': '#9C27B0'
    };
    return colors[experience] || '#757575';
  };

  // WhatsApp ile iletişim
  const handleWhatsApp = async () => {
    try {
      console.log('🔄 WhatsApp iletişimi başlatılıyor...');
      console.log('👤 Oyuncu bilgileri:', {
        name: `${player.firstName} ${player.lastName}`,
        phone: player.phone,
        email: player.email
      });

      if (!player.phone || player.phone.trim() === '') {
        Alert.alert(
          'Telefon Numarası Bulunamadı', 
          `${player.firstName} ${player.lastName} adlı oyuncunun telefon numarası kayıtlı değil.`,
          [
            { text: 'Tamam', style: 'default' },
            { 
              text: 'Email Gönder', 
              onPress: () => handleEmail(),
              style: 'default'
            }
          ]
        );
        return;
      }

      // Telefon numarasını temizle
      let cleanPhone = player.phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('90')) {
        cleanPhone = cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        cleanPhone = '90' + cleanPhone.substring(1);
      } else if (cleanPhone.length === 10) {
        cleanPhone = '90' + cleanPhone;
      }

      const message = encodeURIComponent(
        `Merhaba ${player.firstName}! FutbolX uygulaması üzerinden sizi buldum. ${player.position} pozisyonunda takımımızda yer almak ister misiniz? ⚽`
      );

      // Önce whatsapp:// protokolünü dene
      const whatsappProtocolUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
      console.log('📱 WhatsApp Protocol URL:', whatsappProtocolUrl);
      
      const protocolSupported = await Linking.canOpenURL(whatsappProtocolUrl);
      console.log('🔍 WhatsApp Protocol destekleniyor mu?', protocolSupported);
      
      if (protocolSupported) {
        await Linking.openURL(whatsappProtocolUrl);
        console.log('✅ WhatsApp Protocol ile açıldı');
        return;
      }

      // whatsapp:// çalışmazsa https://wa.me/ dene
      const webUrl = `https://wa.me/${cleanPhone}?text=${message}`;
      console.log('🌐 WhatsApp Web URL:', webUrl);
      
      const webSupported = await Linking.canOpenURL(webUrl);
      console.log('🔍 WhatsApp Web destekleniyor mu?', webSupported);
      
      if (webSupported) {
        await Linking.openURL(webUrl);
        console.log('✅ WhatsApp Web ile açıldı');
        return;
      }

      // Hiçbiri çalışmazsa hata mesajı
      Alert.alert(
        'WhatsApp Bulunamadı', 
        'WhatsApp uygulaması cihazınızda yüklü değil. Lütfen WhatsApp\'ı yükleyin veya email ile iletişime geçin.',
        [
          { text: 'Tamam', style: 'default' },
          { 
            text: 'Email Gönder', 
            onPress: () => handleEmail(),
            style: 'default'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ WhatsApp açma hatası:', error);
      Alert.alert(
        'Hata', 
        'WhatsApp açılırken bir hata oluştu. Email ile iletişime geçmeyi deneyin.',
        [
          { text: 'Tamam', style: 'default' },
          { 
            text: 'Email Gönder', 
            onPress: () => handleEmail(),
            style: 'default'
          }
        ]
      );
    }
  };

  // Email ile iletişim
  const handleEmail = async () => {
    try {
      console.log('🔄 Email iletişimi başlatılıyor...');
      
      const emailUrl = PlayerMatchingService.openEmail(player);
      
      if (!emailUrl) {
        Alert.alert(
          'Email Adresi Bulunamadı', 
          `${player.firstName} ${player.lastName} adlı oyuncunun email adresi kayıtlı değil veya geçersiz.`,
          [
            { text: 'Tamam', style: 'default' },
            { 
              text: 'WhatsApp Dene', 
              onPress: () => handleWhatsApp(),
              style: 'default'
            }
          ]
        );
        return;
      }
      
      console.log('📧 Email URL oluşturuldu:', emailUrl);
      
      const supported = await Linking.canOpenURL(emailUrl);
      console.log('🔍 Email destekleniyor mu?', supported);
      
      if (supported) {
        await Linking.openURL(emailUrl);
        console.log('✅ Email uygulaması başarıyla açıldı');
      } else {
        Alert.alert(
          'Email Uygulaması Bulunamadı', 
          'Cihazınızda email uygulaması bulunamadı. Lütfen bir email uygulaması yükleyin.',
          [
            { text: 'Tamam', style: 'default' },
            { 
              text: 'WhatsApp Dene', 
              onPress: () => handleWhatsApp(),
              style: 'default'
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Email açma hatası:', error);
      Alert.alert(
        'Hata', 
        'Email uygulaması açılırken bir hata oluştu. WhatsApp ile iletişime geçmeyi deneyin.',
        [
          { text: 'Tamam', style: 'default' },
          { 
            text: 'WhatsApp Dene', 
            onPress: () => handleWhatsApp(),
            style: 'default'
          }
        ]
      );
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(player)}>
      {/* Profil Resmi */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: player.profileImage || 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />
        <View style={[styles.positionBadge, { backgroundColor: getPositionColor(player.position) }]}>
          <IconSymbol name={getPositionIcon(player.position)} size={12} color="white" />
        </View>
      </View>

      {/* Oyuncu Bilgileri */}
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {player.firstName} {player.lastName}
        </Text>
        <Text style={styles.username}>@{player.username}</Text>
        
        <View style={styles.positionContainer}>
          <View style={[styles.positionTag, { backgroundColor: getPositionColor(player.position) }]}>
            <Text style={styles.positionText}>{player.position}</Text>
          </View>
          <View style={[styles.experienceTag, { backgroundColor: getExperienceColor(player.footballExperience || 'Başlangıç') }]}>
            <Text style={styles.experienceText}>{player.footballExperience || 'Başlangıç'}</Text>
          </View>
        </View>

        {/* Yaş ve Konum */}
        <View style={styles.detailsRow}>
          {player.age && (
            <View style={styles.detailItem}>
              <IconSymbol name="person.fill" size={12} color="#666" />
              <Text style={styles.detailText}>{player.age} yaşında</Text>
            </View>
          )}
          {player.location && (
            <View style={styles.detailItem}>
              <IconSymbol name="location.fill" size={12} color="#666" />
              <Text style={styles.detailText}>{player.location}</Text>
            </View>
          )}
        </View>

        {/* Mesafe */}
        {distance && (
          <View style={styles.detailItem}>
            <IconSymbol name="map" size={12} color="#4CAF50" />
            <Text style={styles.distanceText}>{distance.toFixed(1)} km uzakta</Text>
          </View>
        )}

        {/* Bio */}
        {player.bio && player.bio.trim() !== '' && (
          <Text style={styles.bio} numberOfLines={2}>
            "{player.bio}"
          </Text>
        )}

        {/* İstatistikler */}
        {player.stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{player.stats.matches || 0}</Text>
              <Text style={styles.statLabel}>Maç</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{player.stats.goals || 0}</Text>
              <Text style={styles.statLabel}>Gol</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{player.stats.assists || 0}</Text>
              <Text style={styles.statLabel}>Asist</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{player.stats.rating || 0}</Text>
              <Text style={styles.statLabel}>Puan</Text>
            </View>
          </View>
        )}

        {/* İletişim Bilgileri */}
        <View style={styles.contactInfo}>
          {player.phone && player.phone.trim() !== '' && (
            <View style={styles.contactItem}>
              <IconSymbol name="phone.fill" size={10} color="#25D366" />
              <Text style={styles.contactText}>WhatsApp</Text>
            </View>
          )}
          {player.email && player.email.trim() !== '' && (
            <View style={styles.contactItem}>
              <IconSymbol name="envelope.fill" size={10} color="#2196F3" />
              <Text style={styles.contactText}>Email</Text>
            </View>
          )}
          {(!player.phone || player.phone.trim() === '') && (!player.email || player.email.trim() === '') && (
            <View style={styles.contactItem}>
              <IconSymbol name="exclamationmark.triangle" size={10} color="#FF9800" />
              <Text style={styles.contactText}>İletişim bilgisi yok</Text>
            </View>
          )}
        </View>
      </View>

      {/* Uyumluluk Skoru */}
      <View style={styles.scoreContainer}>
        <CompatibilityScore score={compatibilityScore} />
      </View>

      {/* Eylem Butonları */}
      <View style={styles.actionButtons}>
        {player.phone && player.phone.trim() !== '' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#25D366' }]}
            onPress={handleWhatsApp}
          >
            <IconSymbol name="message.fill" size={16} color="white" />
          </TouchableOpacity>
        )}
        {player.email && player.email.trim() !== '' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={handleEmail}
          >
            <IconSymbol name="envelope.fill" size={16} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={() => onFavorite(player)}
        >
          <IconSymbol name="heart.fill" size={16} color="white" />
        </TouchableOpacity>
        
        {/* İletişim bilgisi yoksa bilgi butonu */}
        {(!player.phone || player.phone.trim() === '') && (!player.email || player.email.trim() === '') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => {
              Alert.alert(
                'İletişim Bilgisi Yok',
                `${player.firstName} ${player.lastName} adlı oyuncunun telefon numarası ve email adresi kayıtlı değil.`,
                [{ text: 'Tamam', style: 'default' }]
              );
            }}
          >
            <IconSymbol name="exclamationmark.triangle" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  positionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  positionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  positionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  experienceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  experienceText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  bio: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  scoreContainer: {
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 6,
    alignSelf: 'flex-start',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerMatchCard; 