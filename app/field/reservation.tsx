import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card } from '@/components/ui/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { reservationService } from '@/services/api';

const { width } = Dimensions.get('window');

// Saha bilgileri
const fieldData = {
  id: 'sporium23',
  name: 'Sporium 23 Halı Saha',
  description: 'Elazığ\'ın en modern halı saha tesisi, gece aydınlatmalı kapalı sahaları ile kaliteli bir oyun deneyimi sunuyor.',
  address: 'Çaydaçıra Mahallesi, Zübeyde Hanım Caddesi No:23, Elazığ/Merkez',
  image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
  price: 450,
  facilities: ['Duş ve Soyunma Odaları', 'Ücretsiz Otopark', '7/24 Aydınlatma'],
  priceUnit: '₺',
  rating: 4.8,
  totalReviews: 128,
  size: '30m x 50m',
  phone: '0424 238 23 23',
  openHours: '09:00 - 01:00',
  location: {
    latitude: 38.674953,
    longitude: 39.186031
  }
};

// Müsait saatler
const availableTimeSlots = [
  { id: '2', time: '10:00 - 11:00', price: 450, available: true },
  { id: '3', time: '11:00 - 12:00', price: 450, available: true },
  { id: '4', time: '12:00 - 13:00', price: 450, available: true },
  { id: '5', time: '13:00 - 14:00', price: 450, available: true },
  { id: '6', time: '14:00 - 15:00', price: 450, available: true },
  { id: '7', time: '15:00 - 16:00', price: 450, available: true },
  { id: '8', time: '16:00 - 17:00', price: 450, available: true },
  { id: '9', time: '17:00 - 18:00', price: 450, available: true },
  { id: '10', time: '18:00 - 19:00', price: 450, available: true },
  { id: '11', time: '19:00 - 20:00', price: 450, available: true },
  { id: '12', time: '20:00 - 21:00', price: 450, available: true },
  { id: '13', time: '21:00 - 22:00', price: 450, available: true },
  { id: '14', time: '22:00 - 23:00', price: 450, available: true },
  { id: '15', time: '23:00 - 00:00', price: 450, available: true },
  { id: '16', time: '00:00 - 01:00', price: 450, available: true },
];

export default function ReservationScreen() {
  const params = useLocalSearchParams();
  const fieldId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  
  // Tema renkleri
  const primaryColor = '#4CAF50';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const cardColor = useThemeColor({}, 'card');
  
  // State değişkenleri
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [selectedField, setSelectedField] = useState('sporyum23-indoor-1');
  
  // Kullanıcı verilerini doldur
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // DatePicker değişim fonksiyonu
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  // Tarih formatını düzenle
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Gün isimlerini Türkçe olarak tanımla
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayName = days[date.getDay()];
    
    return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year} ${dayName}`;
  };
  
  // Rezervasyon işlemini gerçekleştir
  const handleReservation = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Hata', 'Lütfen rezervasyon saatini seçin.');
      return;
    }
    
    if (!name || !phone) {
      Alert.alert('Hata', 'Lütfen isim ve telefon bilgilerinizi girin.');
      return;
    }
    
    // Kullanıcı oturum kontrolü - daha kapsamlı kontrol
    const isLoggedIn = await AsyncStorage.getItem('token');
    
    if (!isLoggedIn) {
      Alert.alert('Giriş Gerekli', 'Rezervasyon yapmak için giriş yapmalısınız.', [
        { text: 'İptal' },
        { text: 'Giriş Yap', onPress: () => router.push('/login' as any) }
      ]);
      return;
    }
    
    if (!user) {
      console.log('Kullanıcı oturumu açık ancak kullanıcı bilgisi alınamadı');
      
      try {
        // AsyncStorage'dan kullanıcı bilgilerini almayı dene
        const userDataStr = await AsyncStorage.getItem('user');
        if (!userDataStr) {
          Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.');
          return;
        }
        
        // Kullanıcı bilgilerini JSON olarak parse et
        const userData = JSON.parse(userDataStr);
        console.log('AsyncStorage\'dan alınan kullanıcı:', userData);
      } catch (error) {
        console.error('Kullanıcı bilgileri alma hatası:', error);
        Alert.alert('Hata', 'Kullanıcı bilgileri alınırken bir hata oluştu. Lütfen tekrar giriş yapın.');
        return;
      }
    }
    
    setLoading(true);
    setLoadingMessage('Rezervasyon işleminiz yapılıyor...');
    
    try {
      // Seçilen saat aralığını al
      const selectedSlot = availableTimeSlots.find(slot => slot.id === selectedTimeSlot);
      if (!selectedSlot) {
        throw new Error('Seçilen saat aralığı bulunamadı');
      }
      
      // Saat aralığını parçalara ayır
      const [startTime, endTime] = selectedSlot.time.split(' - ');
      
      // Kullanıcı ID'sini al (AsyncStorage'dan alınabilir)
      let userId = '';
      if (user && (user._id || user.id)) {
        userId = user._id || user.id || '';
      } else {
        // AsyncStorage'dan almayı dene
        const userDataStr = await AsyncStorage.getItem('user');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          userId = userData._id || userData.id || '';
        }
      }
      
      if (!userId) {
        throw new Error('Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
      }
      
      // Rezervasyon verilerini hazırla
      const reservationData = {
        fieldId: fieldData.id, // Frontend'de görünen ID
        userId: userId, // Kullanıcı ID'si
        field: selectedField === 'sporyum23-indoor-1' ? 1 : 
               selectedField === 'sporyum23-indoor-2' ? 2 : 3, // Seçilen halı sahanın numarası
        indoorFieldId: selectedField, // Kapalı saha ID'si (API için gerekli)
        date: date.toISOString(), // Tarih ISO formatında
        startTime,
        endTime,
        price: 450, // Sabit fiyat
        participants: [], // Boş dizi
        status: "beklemede", // Beklemede durumu
        paymentsStatus: "beklemede", // Ödeme durumu
        notes: note, // Kullanıcı notu
      };
      
      console.log('Rezervasyon verileri:', JSON.stringify(reservationData, null, 2));
      
      // API'ye rezervasyon isteği gönder
      const response = await reservationService.createReservation(reservationData);
      
      console.log('Rezervasyon yanıtı:', response);
      
      if (response && (response._id || response.id)) {
        // Başarılı rezervasyon
        console.log('Rezervasyon başarılı:', response);
        
        // Rezervasyon listesini arka planda güncelle - API yanıtı beklemeden devam et
        try {
          setTimeout(() => {
            reservationService.getMyReservations().catch(err => 
              console.log('Rezervasyon listesi güncellenemedi:', err)
            );
          }, 500);
        } catch (refreshError) {
          console.log('Rezervasyon listesi güncellenemedi:', refreshError);
        }
        
        setLoading(false);
        setLoadingMessage('');
        
        // Kullanıcıya hemen bildir
        Alert.alert(
          'Rezervasyon Başarılı',
          `${fieldData.name} sahasını ${formatDate(date)} tarihinde ${selectedSlot.time} saatinde başarıyla rezerve ettiniz.\n\nRezervasyon ID: ${response._id || response.id}`,
          [
            { text: 'Tamam', onPress: () => router.push('/(tabs)' as any) }
          ]
        );
      } else {
        // Yanıt var ama ID yok - bu muhtemelen bir hata
        console.error('Rezervasyon yanıtında ID bulunamadı:', response);
        setLoading(false);
        setLoadingMessage('');
        
        Alert.alert(
          'İşlem Tamamlanamadı', 
          'Rezervasyon oluşturuldu ancak bazı bilgiler eksik. Lütfen rezervasyonlarınızı kontrol edin.',
          [
            { text: 'Tamam', onPress: () => router.push('/(tabs)' as any) }
          ]
        );
      }
    } catch (error: any) {
      console.error('Rezervasyon hatası:', error);
      
      // Hata mesajını analiz et
      let errorMessage = 'Rezervasyon yapılırken bir hata oluştu.';
      
      if (error.message && error.message.includes('duplicate key')) {
        errorMessage = 'Bu saat aralığı için zaten bir rezervasyon bulunmaktadır.';
      } else if (error.message && error.message.includes('Network')) {
        errorMessage = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      } else if (error.message && error.message.includes('Seçilen saat aralığı dolu')) {
        errorMessage = 'Seçtiğiniz saat aralığı dolu. Lütfen başka bir saat seçin.';
      } else if (error.message && error.message.includes('Geçmiş tarihler')) {
        errorMessage = 'Geçmiş tarihler için rezervasyon yapılamaz.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLoading(false);
      setLoadingMessage('');
      
      Alert.alert('Rezervasyon Hatası', errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerTitle: "Saha Rezervasyonu",
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/reservations' as any)}
            >
              <IconSymbol name="calendar" size={20} color="#FFFFFF" />
              <ThemedText style={styles.headerButtonText}>Rezervasyonlarım</ThemedText>
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={styles.loadingText}>{loadingMessage}</ThemedText>
          </View>
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Saha Bilgileri */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: fieldData.image }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => router.push('/about' as any)}>
                <ThemedText style={styles.fieldName}>{fieldData.name}</ThemedText>
              </TouchableOpacity>
              <View style={styles.ratingContainer}>
                <IconSymbol name="star.fill" size={18} color="#FFC107" />
                <ThemedText style={styles.ratingText}>{fieldData.rating}</ThemedText>
                <TouchableOpacity 
                  style={styles.reviewsButton}
                  onPress={() => router.push(`/field/reviews?id=${fieldData.id}` as any)}
                >
                  <ThemedText style={styles.reviewText}>({fieldData.totalReviews} değerlendirme)</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.fieldInfoRow}>
                <IconSymbol name="mappin" size={16} color="#FFFFFF" />
                <ThemedText style={styles.fieldInfoText} numberOfLines={1}>
                  {fieldData.address}
                </ThemedText>
              </View>
              <View style={styles.fieldInfoRow}>
                <IconSymbol name="phone" size={16} color="#FFFFFF" />
                <ThemedText style={styles.fieldInfoText}>{fieldData.phone}</ThemedText>
              </View>
              <View style={styles.priceTag}>
                <ThemedText style={styles.priceText}>{fieldData.price}{fieldData.priceUnit}</ThemedText>
                <ThemedText style={styles.priceSubtext}>/ saat</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Rezervasyon Formu */}
        <View style={styles.formContainer}>
          <Card style={styles.formCard}>
            <ThemedText style={styles.sectionTitle}>Rezervasyon Detayları</ThemedText>
            
            {/* Halı Saha Seçimi */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Halı Saha Seçimi</ThemedText>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5}}>
                <TouchableOpacity
                  style={[
                    styles.fieldOption,
                    selectedField === 'sporyum23-indoor-1' && styles.selectedFieldOption
                  ]}
                  onPress={() => setSelectedField('sporyum23-indoor-1')}
                >
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop' }} 
                    style={styles.fieldOptionImage} 
                  />
                  <View style={styles.fieldOptionOverlay}>
                    <ThemedText style={styles.fieldOptionOverlayText}>Halı Saha 1</ThemedText>
                  </View>
                  {selectedField === 'sporyum23-indoor-1' && (
                    <View style={styles.selectedFieldIndicator}>
                      <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.fieldOption,
                    selectedField === 'sporyum23-indoor-2' && styles.selectedFieldOption
                  ]}
                  onPress={() => setSelectedField('sporyum23-indoor-2')}
                >
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop' }} 
                    style={styles.fieldOptionImage} 
                  />
                  <View style={styles.fieldOptionOverlay}>
                    <ThemedText style={styles.fieldOptionOverlayText}>Halı Saha 2</ThemedText>
                  </View>
                  {selectedField === 'sporyum23-indoor-2' && (
                    <View style={styles.selectedFieldIndicator}>
                      <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.fieldOption,
                    selectedField === 'sporyum23-indoor-3' && styles.selectedFieldOption
                  ]}
                  onPress={() => setSelectedField('sporyum23-indoor-3')}
                >
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1470&auto=format&fit=crop' }} 
                    style={styles.fieldOptionImage} 
                  />
                  <View style={styles.fieldOptionOverlay}>
                    <ThemedText style={styles.fieldOptionOverlayText}>Halı Saha 3</ThemedText>
                  </View>
                  {selectedField === 'sporyum23-indoor-3' && (
                    <View style={styles.selectedFieldIndicator}>
                      <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Tarih Seçimi */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Tarih</ThemedText>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color={primaryColor} />
                <ThemedText style={styles.dateText}>{formatDate(date)}</ThemedText>
                <IconSymbol name="chevron.down" size={16} color={secondaryTextColor} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 gün sonrası
                />
              )}
            </View>
            
            {/* Saat Seçimi */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Saat Dilimi</ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.timeSlotScrollView}
                contentContainerStyle={styles.timeSlotScrollContent}
              >
                {availableTimeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot === slot.id && styles.selectedTimeSlot,
                      !slot.available && styles.unavailableTimeSlot
                    ]}
                    onPress={() => slot.available && setSelectedTimeSlot(slot.id)}
                    disabled={!slot.available}
                  >
                    <ThemedText
                      style={[
                        styles.timeSlotText,
                        selectedTimeSlot === slot.id && styles.selectedTimeSlotText,
                        !slot.available && styles.unavailableTimeSlotText
                      ]}
                    >
                      {slot.time}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.timeSlotPrice,
                        selectedTimeSlot === slot.id && styles.selectedTimeSlotPrice,
                        !slot.available && styles.unavailableTimeSlotPrice
                      ]}
                    >
                      {slot.price}₺
                    </ThemedText>
                    {!slot.available && (
                      <View style={styles.unavailableBadge}>
                        <ThemedText style={styles.unavailableBadgeText}>Dolu</ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* İletişim Bilgileri */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>İletişim Bilgileri</ThemedText>
              
              <View style={styles.inputContainer}>
                <IconSymbol name="person" size={20} color={primaryColor} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor={secondaryTextColor}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <IconSymbol name="phone" size={20} color={primaryColor} />
                <TextInput
                  style={styles.input}
                  placeholder="Telefon Numarası"
                  placeholderTextColor={secondaryTextColor}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <IconSymbol name="envelope" size={20} color={primaryColor} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta Adresi"
                  placeholderTextColor={secondaryTextColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={[styles.inputContainer, { alignItems: 'flex-start', minHeight: 80 }]}>
                <IconSymbol name="text.bubble" size={20} color={primaryColor} style={{ marginTop: 12 }} />
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Eklemek istediğiniz not (opsiyonel)"
                  placeholderTextColor={secondaryTextColor}
                  value={note}
                  onChangeText={setNote}
                  multiline
                />
              </View>
            </View>
            
            {/* Tesisler */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Tesis Özellikleri</ThemedText>
              <View style={styles.facilitiesContainer}>
                {fieldData.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <IconSymbol name="checkmark.circle.fill" size={18} color={primaryColor} />
                    <ThemedText style={styles.facilityText}>{facility}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Toplam Tutar */}
            <View style={styles.totalSection}>
              <ThemedText style={styles.totalLabel}>Toplam Tutar:</ThemedText>
              <ThemedText style={styles.totalPrice}>
                {selectedTimeSlot 
                  ? `${availableTimeSlots.find(slot => slot.id === selectedTimeSlot)?.price}₺` 
                  : `${fieldData.price}₺`
                }
              </ThemedText>
            </View>
          </Card>
        </View>
      </ScrollView>
      
      {/* Rezervasyon Butonu */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.reserveButton, { backgroundColor: primaryColor }]}
          onPress={handleReservation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
              <ThemedText style={styles.reserveButtonText}>Rezervasyonu Tamamla</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'flex-end',
  },
  headerContent: {
    width: '100%',
  },
  fieldName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  reviewText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 5,
  },
  fieldInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.9,
    flex: 1,
  },
  priceTag: {
    position: 'absolute',
    top: 15,
    right: 0,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 2,
    opacity: 0.9,
  },
  formContainer: {
    padding: 15,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  timeSlotScrollView: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  timeSlotScrollContent: {
    paddingHorizontal: 5,
  },
  timeSlot: {
    width: 120,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    height: 80,
  },
  selectedTimeSlot: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  unavailableTimeSlot: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeSlotPrice: {
    fontSize: 13,
    opacity: 0.7,
  },
  selectedTimeSlotText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  selectedTimeSlotPrice: {
    color: '#4CAF50',
  },
  unavailableTimeSlotText: {
    color: '#9E9E9E',
  },
  unavailableTimeSlotPrice: {
    color: '#9E9E9E',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  unavailableBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 15,
    marginLeft: 10,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  facilityText: {
    fontSize: 14,
    marginLeft: 6,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fieldSelectionContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  fieldOption: {
    width: 105,
    height: 80,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedFieldOption: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  fieldOptionImage: {
    width: '100%',
    height: '100%',
  },
  fieldOptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    alignItems: 'center',
  },
  fieldOptionOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedFieldIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  reviewsButton: {
    paddingLeft: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
}); 