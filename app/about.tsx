import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Linking, Platform, ActivityIndicator } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Stack } from 'expo-router';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useThemeColor } from '../hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import WebView from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Global olarak primaryColor tanımla
const primaryColor = '#4CAF50';

export default function AboutScreen() {
  const router = useRouter();

  // Tema renkleri
  const secondaryColor = '#2196F3';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');

  // Rezervasyon fonksiyonu
  const handleReservation = () => {
    router.push('/field/reservation?id=sporium23');
  };

  // Konum fonksiyonu
  const handleLocation = () => {
    Linking.openURL('https://maps.google.com/?q=38.674953,39.186031');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerTitle: "Sporium 23 Halı Saha",
          headerTitleStyle: { 
            fontWeight: '700', 
            fontSize: 18,
            color: '#FFFFFF'
          },
          headerStyle: { 
            backgroundColor: primaryColor
          },
          headerTintColor: '#FFFFFF',
          headerTitleAlign: 'center'
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/pitch1.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.7)', 'rgba(76, 175, 80, 0.4)']}
            style={styles.gradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
          >
            <View style={styles.heroContent}>
              <View style={styles.titleBadge}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/33/33699.png' }}
                  style={styles.titleIcon}
                  resizeMode="contain"
                />
                <View style={styles.titleTextContainer}>
                  <ThemedText style={styles.heroTitle}>SPORIUM 23</ThemedText>
                  <ThemedText style={styles.heroSubtitle}>Premium Halı Saha Tesisi</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.heroDescription}>
                2020 yılından bu yana Elazığ'da profesyonel halı saha ve spor tesisi olarak hizmet vermekteyiz. Modern tesislerimiz ve profesyonel hizmet anlayışımız ile sportmenliğin keyfini çıkartabilirsiniz.
              </ThemedText>
              
              <View style={styles.heroButtonContainer}>
                <TouchableOpacity 
                  style={[styles.heroButton, { backgroundColor: '#FFFFFF' }]} 
                  onPress={handleReservation}
                >
                  <IconSymbol name="calendar" size={18} color={primaryColor} />
                  <ThemedText style={[styles.buttonText, {color: primaryColor, fontWeight: '700'}]}>Rezervasyon Yap</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.heroButton, styles.outlineButton, { borderColor: '#FFFFFF' }]} 
                  onPress={handleLocation}
                >
                  <IconSymbol name="location.fill" size={18} color="#FFFFFF" />
                  <ThemedText style={[styles.buttonText, {color: '#FFFFFF'}]}>Bize Ulaşın</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Hakkımızda Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleLine} />
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>Sporium 23 Hakkında</ThemedText>
            <View style={styles.sectionTitleLine} />
          </View>
          
          <ThemedText style={styles.paragraph}>
            Sporium 23 Halı Saha, Elazığ'ın en modern ve bakımlı halı saha kompleksidir. 2020 yılında kuruluşu gerçekleşen, Elazığ halkına hizmet vermeyi amaç edinmiştir. Semtinizde 2 adet kapalı halı saha bulunmaktadır. Sahalarımız yüksek kalite çim dokumaya sahip olup FIFA standartlarına uygun şekilde dizayn edilmiştir.
          </ThemedText>
          
          <Image
            source={require('@/assets/images/pitch2.jpg')}
            style={styles.sectionImage}
          />
          
          <ThemedText style={styles.paragraph}>
            Sporium 23 olarak amacımız: sportmenliğin ve futbol sevgisinin yaygınlaştırılmasına katkıda bulunmak, kaliteli ve uygun fiyatlı hizmetlerle müşterilerimizin memnuniyetini en üst düzeyde tutmaktır.
          </ThemedText>
          
          <View style={styles.featureCards}>
            <View style={[styles.featureCard, {backgroundColor: primaryColor}]}>
              <IconSymbol name="soccerball" size={28} color="#FFFFFF" />
              <ThemedText style={styles.featureCardText}>3 Kapalı Saha</ThemedText>
            </View>
            <View style={[styles.featureCard, {backgroundColor: primaryColor}]}>
              <IconSymbol name="clock" size={28} color="#FFFFFF" />
              <ThemedText style={styles.featureCardText}>09:00 - 01:00</ThemedText>
            </View>
            <View style={[styles.featureCard, {backgroundColor: primaryColor}]}>
              <IconSymbol name="car" size={28} color="#FFFFFF" />
              <ThemedText style={styles.featureCardText}>Ücretsiz Otopark</ThemedText>
            </View>
          </View>
        </View>

        {/* Konum Bilgisi */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleLine} />
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>Konum ve İletişim</ThemedText>
            <View style={styles.sectionTitleLine} />
          </View>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <IconSymbol name="location.fill" size={22} color={primaryColor} />
              <ThemedText style={styles.contactText}>Çaydaçıra Mahallesi, Zübeyde Hanım Caddesi, No: 23 Elazığ/Merkez</ThemedText>
            </View>
            <View style={styles.contactItem}>
              <IconSymbol name="phone.fill" size={22} color={primaryColor} />
              <ThemedText style={styles.contactText}>0424 238 23 23</ThemedText>
            </View>
            <View style={styles.contactItem}>
              <IconSymbol name="envelope.fill" size={22} color={primaryColor} />
              <ThemedText style={styles.contactText}>info@sporium23.com</ThemedText>
            </View>
          </View>
          
          {/* Google Harita - Statik görsel ile yedekleme */}
          <View style={styles.mapContainer}>
            {Platform.OS === 'web' ? (
              <Image 
                source={{uri: 'https://maps.googleapis.com/maps/api/staticmap?center=38.674953,39.186031&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C38.674953,39.186031&key=AIzaSyD_ltCBiAtKWsKFDCEcgUfbSiQDyzBg5HE'}}
                style={styles.map}
                resizeMode="cover"
              />
            ) : (
              <WebView
                style={styles.map}
                source={{ 
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body, html { margin: 0; padding: 0; height: 100%; }
                          .map-container { width: 100%; height: 100%; }
                        </style>
                      </head>
                      <body>
                        <div class="map-container">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            frameborder="0" 
                            style="border:0" 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.8938820355946!2d39.183842376446395!3d38.67495295952097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQwJzI5LjgiTiAzOcKwMTEnMDkuNyJF!5e0!3m2!1str!2str!4v1621432512873!5m2!1str!2str" 
                            allowfullscreen>
                          </iframe>
                        </div>
                      </body>
                    </html>
                  `
                }}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <ActivityIndicator size="large" color={primaryColor} />
                  </View>
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
              />
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.directionButton, { backgroundColor: primaryColor }]}
            onPress={handleLocation}
          >
            <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={20} color="white" />
            <ThemedText style={styles.directionButtonText}>Yol Tarifi Al</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Elazığ'da Futbolun Yeni Adresi */}
        <View style={[styles.specialSection, { backgroundColor: primaryColor }]}>
          <IconSymbol name="star.fill" size={32} color="#FFFFFF" style={{marginBottom: 10}} />
          <ThemedText style={styles.specialTitle}>Elazığ'da Futbolun Yeni Adresi</ThemedText>
          <ThemedText style={styles.specialText}>
            Modern tesis ve kaliteli hizmetlerimizde maç yapmanın keyfini çıkarın.
          </ThemedText>
          <TouchableOpacity 
            style={styles.specialButton} 
            onPress={handleReservation}
          >
            <IconSymbol name="calendar" size={18} color={primaryColor} style={{marginRight: 8}} />
            <ThemedText style={styles.specialButtonText}>Rezervasyon Yap</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Neden Sporium 23 */}
        <View style={[styles.whyUsSection, { backgroundColor: primaryColor }]}>
          <IconSymbol name="trophy" size={32} color="#FFFFFF" />
          <ThemedText style={styles.whyUsTitle}>Neden Sporium 23?</ThemedText>
          
          <View style={styles.whyUsList}>
            <View style={styles.whyUsItem}>
              <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" />
              <ThemedText style={styles.whyUsText}>Profesyonel standartlarda sahalar</ThemedText>
            </View>
            <View style={styles.whyUsItem}>
              <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" />
              <ThemedText style={styles.whyUsText}>Modern ve temiz soyunma odaları</ThemedText>
            </View>
            <View style={styles.whyUsItem}>
              <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" />
              <ThemedText style={styles.whyUsText}>Uygun fiyat politikası</ThemedText>
            </View>
            <View style={styles.whyUsItem}>
              <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" />
              <ThemedText style={styles.whyUsText}>Ücretsiz park yeri imkanı</ThemedText>
            </View>
            <View style={styles.whyUsItem}>
              <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" />
              <ThemedText style={styles.whyUsText}>Sosyal ortam imkanı</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Rezervasyon CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={[styles.ctaButton, {backgroundColor: primaryColor}]}
            onPress={handleReservation}
          >
            <IconSymbol name="calendar" size={28} color="#FFFFFF" style={{marginBottom: 12}} />
            <ThemedText style={styles.ctaButtonText}>HEMEN REZERVASYON YAP</ThemedText>
            <ThemedText style={styles.ctaButtonSubtext}>En uygun saat ve fiyatlar için şimdi rezervasyon yapın</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  heroContainer: {
    height: 320,
    position: 'relative',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    paddingHorizontal: 16,
    paddingTop: 40,
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  heroContent: {
    width: '100%',
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleIcon: {
    width: 40,
    height: 40,
    tintColor: primaryColor,
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  heroDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 24,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2
  },
  heroButtonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  heroButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  sectionTitleLine: {
    height: 1,
    backgroundColor: '#4CAF50',
    flex: 1,
    opacity: 0.3,
    maxWidth: 50,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sectionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 16,
  },
  featureCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureCardText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 15,
    flex: 1,
  },
  specialSection: {
    padding: 30,
    alignItems: 'center',
  },
  specialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  specialText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  specialButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialButtonText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 16,
  },
  whyUsSection: {
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  whyUsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 16,
  },
  whyUsList: {
    alignSelf: 'flex-start',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 12,
  },
  whyUsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  whyUsText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  mapContainer: {
    height: 250,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    flex: 1,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  directionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  ctaSection: {
    padding: 20,
    marginBottom: 30,
  },
  ctaButton: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  ctaButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
}); 