import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  buttons?: ChatButton[];
}

interface ChatButton {
  text: string;
  action: string;
  icon?: string;
}

interface ChatBotProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ visible, onClose, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // İlk mesajı yükle
  useEffect(() => {
    if (visible && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "Merhaba! 🤖 Ben **FutbolX AI Asistan**ınızım.\n\n🚀 Size nasıl yardımcı olabilirim:\n• 🏟️ Saha rezervasyonu\n• ⚽ Maç organizasyonu\n• 📊 İstatistik analizi\n• 🏃‍♂️ Antrenman programı\n• 👥 Takım yönetimi\n• 🎯 Oyuncu eşleştirme\n\nHangi konuda yardıma ihtiyacınız var?",
          [
            { text: "🏟️ Saha Rezervasyonu", action: "saha_rezervasyon" },
            { text: "👥 Oyuncu Eşleştir", action: "navigate_oyuncu" },
            { text: "⚽ Maç Organize Et", action: "mac_organize" },
            { text: "📊 İstatistik Analizi", action: "istatistik_analiz" },
            { text: "🏃‍♂️ Antrenman Programı", action: "antrenman_program" },
            { text: "🎯 Takım Yönetimi", action: "takim_yonetim" }
          ]
        );
      }, 500);
    }
  }, [visible]);

  // Typing animasyonu
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  // Bot mesajı ekle
  const addBotMessage = (text: string, buttons?: ChatButton[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      buttons
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => scrollToBottom(), 100);
  };

  // Kullanıcı mesajı ekle
  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => scrollToBottom(), 100);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Mesaj gönder
  const sendMessage = () => {
    if (inputText.trim()) {
      addUserMessage(inputText);
      setInputText('');
      
      // Bot yanıtını simüle et
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        handleBotResponse(inputText);
      }, 1500);
    }
  };

  // Bot yanıtı - Gelişmiş komutlar
  const handleBotResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('saha') || message.includes('rezervasyon')) {
      addBotMessage(
        "🤖 FutbolX AI Asistan olarak saha rezervasyonu için size yardımcı olabilirim! 🏟️\n\n• Yakınımdaki sahalar\n• Müsaitlik durumu\n• Fiyat karşılaştırması\n• Anında rezervasyon",
        [
          { text: "🏟️ Yakın Sahalar", action: "yakin_sahalar" },
          { text: "💰 Fiyat Karşılaştır", action: "fiyat_karsilastir" },
          { text: "📅 Rezervasyon Yap", action: "rezervasyon_yap" },
          { text: "⭐ Popüler Sahalar", action: "populer_sahalar" }
        ]
      );
    } else if (message.includes('oyuncu') || message.includes('takım') || message.includes('eşleş')) {
      addBotMessage(
        "🤖 FutbolX AI Asistan olarak takım arkadaşı bulma konusunda uzmanım! 👥\n\n• Pozisyon bazlı eşleştirme\n• Seviye uyumluluğu\n• Konum bazlı arama\n• Uyumluluk analizi",
        [
          { text: "🎯 Akıllı Eşleştirme", action: "navigate_oyuncu" },
          { text: "📍 Yakınımdaki Oyuncular", action: "yakin_oyuncular" },
          { text: "⚽ Pozisyon Bazlı", action: "pozisyon_bazli" },
          { text: "🏆 Seviye Uyumlu", action: "seviye_uyumlu" }
        ]
      );
    } else if (message.includes('maç') || message.includes('organize')) {
      addBotMessage(
        "🤖 FutbolX AI Asistan olarak maç organizasyonu için her şeyi düşündüm! ⚽\n\n• Takım kurma\n• Saha rezervasyonu\n• Oyuncu davetiyesi\n• Maç takibi",
        [
          { text: "⚽ Hızlı Maç Kur", action: "hizli_mac" },
          { text: "🏆 Turnuva Organize Et", action: "turnuva_organize" },
          { text: "📅 Düzenli Maçlar", action: "duzenli_maclar" },
          { text: "👥 Takım Davet Et", action: "takim_davet" }
        ]
      );
    } else if (message.includes('istatistik') || message.includes('performans') || message.includes('analiz')) {
      addBotMessage(
        "🤖 FutbolX AI Asistan olarak performans analizinizi detaylı inceleyebilirim! 📊\n\n• Maç istatistikleri\n• Gelişim grafiği\n• Pozisyon analizi\n• Karşılaştırma",
        [
          { text: "📈 Gelişim Grafiği", action: "gelisim_grafigi" },
          { text: "⚽ Gol/Asist Analizi", action: "gol_asist_analiz" },
          { text: "🎯 Pozisyon Performansı", action: "pozisyon_performans" },
          { text: "🏆 Başarı Rozetleri", action: "basari_rozetleri" }
        ]
      );
    } else if (message.includes('antrenman') || message.includes('program') || message.includes('egzersiz')) {
      addBotMessage(
        "🤖 FutbolX AI Asistan olarak kişiselleştirilmiş antrenman programı hazırlayabilirim! 🏃‍♂️\n\n• Pozisyon odaklı egzersizler\n• Kondisyon programı\n• Teknik gelişim\n• Haftalık plan",
        [
          { text: "🏃‍♂️ Kondisyon Programı", action: "kondisyon_program" },
          { text: "⚽ Teknik Antrenman", action: "teknik_antrenman" },
          { text: "🎯 Pozisyon Odaklı", action: "pozisyon_antrenman" },
          { text: "📅 Haftalık Plan", action: "haftalik_plan" }
        ]
      );
    } else if (message.includes('hava') || message.includes('durum')) {
      addBotMessage(
        "🤖 FutbolX AI Asistan hava durumu bilgisi! ☀️\n\nBugün futbol oynamak için harika bir gün! Sıcaklık 22°C, rüzgar hafif.",
        [
          { text: "🏟️ Uygun Sahalar", action: "uygun_sahalar" },
          { text: "⚽ Maç Organize Et", action: "mac_organize" }
        ]
      );
    } else if (message.includes('yardım') || message.includes('komut')) {
      addBotMessage(
        "🤖 FutbolX AI Asistan kullanabileceğiniz komutlar:\n\n• 'saha bul' - Saha arama\n• 'oyuncu ara' - Takım arkadaşı\n• 'maç organize et' - Maç kurma\n• 'istatistiklerim' - Performans\n• 'antrenman programı' - Egzersiz\n• 'hava durumu' - Hava bilgisi\n• 'takım kur' - Takım oluşturma",
        [
          { text: "🏟️ Saha Bul", action: "navigate_saha" },
          { text: "👥 Oyuncu Ara", action: "navigate_oyuncu" },
          { text: "⚽ Maç Organize Et", action: "mac_organize" }
        ]
      );
    } else {
      addBotMessage(
        "🤖 FutbolX AI Asistan olarak size nasıl yardımcı olabilirim? 🤔\n\nPopüler komutlar:",
        [
          { text: "🏟️ Saha Rezervasyonu", action: "saha_rezervasyon" },
          { text: "👥 Oyuncu Eşleştir", action: "navigate_oyuncu" },
          { text: "⚽ Maç Organize Et", action: "mac_organize" },
          { text: "📊 İstatistiklerim", action: "navigate_istatistik" },
          { text: "❓ Yardım", action: "yardim" }
        ]
      );
    }
  };

  // Buton tıklama
  const handleButtonPress = (action: string) => {
    switch (action) {
      // Saha işlemleri
      case 'saha_rezervasyon':
      case 'navigate_saha':
        addUserMessage('Saha Rezervasyonu');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Saha rezervasyonu için size en iyi seçenekleri sunuyorum! 🏟️",
            [{ text: "🔍 Saha Ara", action: "go_saha" }]
          );
        }, 1000);
        break;

      case 'yakin_sahalar':
        addUserMessage('Yakın Sahalar');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Size en yakın 5 saha:\n\n🏟️ Spor Kompleksi (2.1 km)\n⚽ Futbol Sahası (3.5 km)\n🌟 Premium Saha (4.2 km)\n\nHangisini tercih edersiniz?",
            [
              { text: "📅 Rezervasyon Yap", action: "rezervasyon_yap" },
              { text: "💰 Fiyatları Gör", action: "fiyat_karsilastir" }
            ]
          );
        }, 1500);
        break;

      case 'fiyat_karsilastir':
        addUserMessage('Fiyat Karşılaştır');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Saha fiyat karşılaştırması:\n\n💰 Spor Kompleksi: 150₺/saat\n💰 Futbol Sahası: 120₺/saat\n💰 Premium Saha: 200₺/saat\n\nEn uygun fiyat: Futbol Sahası! 🎯"
          );
        }, 1500);
        break;

      // Oyuncu eşleştirme
      case 'navigate_oyuncu':
        addUserMessage('Oyuncu Eşleştir');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Akıllı oyuncu eşleştirme sistemi aktif! 🎯",
            [{ text: "🤝 Takım Arkadaşı Bul", action: "go_oyuncu" }]
          );
        }, 1000);
        break;

      case 'yakin_oyuncular':
        addUserMessage('Yakınımdaki Oyuncular');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Yakınınızda 12 aktif oyuncu bulundu! 👥\n\n⚽ 3 Forvet\n🛡️ 4 Defans\n🏃‍♂️ 3 Orta Saha\n🥅 2 Kaleci\n\nHemen eşleştirme yapalım!",
            [{ text: "🎯 Eşleştir", action: "go_oyuncu" }]
          );
        }, 1500);
        break;

      // Maç organizasyonu
      case 'mac_organize':
        addUserMessage('Maç Organize Et');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Maç organizasyonu başlatılıyor! ⚽\n\n✅ Takım kurulumu\n✅ Saha rezervasyonu\n✅ Oyuncu davetiyesi\n✅ Maç takibi\n\nHer şey hazır!"
          );
        }, 1500);
        break;

      case 'hizli_mac':
        addUserMessage('Hızlı Maç Kur');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Hızlı maç kurulumu! ⚡\n\n📅 Bugün 19:00\n🏟️ Spor Kompleksi\n👥 14 oyuncu hazır\n💰 Kişi başı 25₺\n\nKatılmak ister misiniz?"
          );
        }, 1500);
        break;

      // İstatistik analizi
      case 'istatistik_analiz':
      case 'navigate_istatistik':
        addUserMessage('İstatistik Analizi');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Performans analiziniz hazırlanıyor! 📊",
            [{ text: "👤 Profilim", action: "go_profil" }]
          );
        }, 1000);
        break;

      case 'gelisim_grafigi':
        addUserMessage('Gelişim Grafiği');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Son 6 aydaki gelişiminiz:\n\n📈 Gol ortalaması: +15%\n📈 Pas başarısı: +8%\n📈 Kondisyon: +12%\n📈 Genel performans: +11%\n\nHarika ilerleme! 🎉"
          );
        }, 1500);
        break;

      // Antrenman programı
      case 'antrenman_program':
        addUserMessage('Antrenman Programı');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Kişiselleştirilmiş antrenman programınız hazır! 🏃‍♂️\n\n📅 Haftalık 3 gün\n⏱️ Günde 45 dakika\n🎯 Pozisyon odaklı\n💪 Kondisyon + Teknik"
          );
        }, 1500);
        break;

      case 'kondisyon_program':
        addUserMessage('Kondisyon Programı');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Kondisyon programınız:\n\n🏃‍♂️ Pazartesi: Dayanıklılık (30 dk)\n💪 Çarşamba: Kuvvet (25 dk)\n⚡ Cuma: Hız (20 dk)\n\nBaşlamaya hazır mısınız?"
          );
        }, 1500);
        break;

      // Yardım
      case 'yardim':
        addUserMessage('Yardım');
        handleBotResponse('yardım');
        break;

      // Navigasyon
      case 'go_saha':
        onNavigate?.('explore');
        onClose();
        break;
      
      case 'go_oyuncu':
        onNavigate?.('player-matching');
        onClose();
        break;
      
      case 'go_profil':
        onNavigate?.('profile');
        onClose();
        break;
      
      default:
        addUserMessage(action);
        handleBotResponse(action);
    }
  };

  // Mesaj render
  const renderMessage = (message: ChatMessage) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isBot ? styles.botMessageContainer : styles.userMessageContainer
    ]}>
      {message.isBot && (
        <View style={styles.botAvatar}>
          <Text style={{ fontSize: 16 }}>🤖</Text>
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.isBot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botText : styles.userText
        ]}>
          {message.text}
        </Text>
        
        {message.buttons && (
          <View style={styles.buttonsContainer}>
            {message.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleButtonPress(button.action)}
              >
                <Text style={styles.buttonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // Typing indicator
  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessageContainer]}>
      <View style={styles.botAvatar}>
        <Text style={{ fontSize: 16 }}>🤖</Text>
      </View>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingContainer}>
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1]
              })
            }
          ]} />
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1, 0.3]
              })
            }
          ]} />
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.3]
              })
            }
          ]} />
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header - Görseldeki gibi */}
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.botHeaderAvatar}>
                <Text style={{ fontSize: 22 }}>🤖</Text>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>FutbolX AI Asistan</Text>
                <Text style={styles.headerSubtitle}>🟢 Veri Tabanından Bağlı • 15+ Komut Türü</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages */}
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map(renderMessage)}
            {isTyping && renderTypingIndicator()}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: inputText.trim() ? '#4CAF50' : '#ccc' }]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <IconSymbol name="paperplane.fill" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleButtonPress('saha_rezervasyon')}
            >
              <Text style={styles.quickButtonText}>🏟️ Saha</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleButtonPress('navigate_oyuncu')}
            >
              <Text style={styles.quickButtonText}>👥 Oyuncu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleButtonPress('mac_organize')}
            >
              <Text style={styles.quickButtonText}>⚽ Maç</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleButtonPress('istatistik_analiz')}
            >
              <Text style={styles.quickButtonText}>📊 İstatistik</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 1,
  },
  closeButton: {
    padding: 6,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#e9ecef',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: 'white',
  },
  buttonsContainer: {
    marginTop: 8,
    gap: 6,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 80,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: 'white',
  },
  quickButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  quickButtonText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ChatBot; 