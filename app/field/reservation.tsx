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

const { width } = Dimensions.get('window');

// Saha bilgileri
const fieldData = {
  id: 'sporium23',
  name: 'Sporium 23 Halı Saha',
  description: 'Elazığ\'ın en modern halı saha tesisi, gece aydınlatmalı kapalı sahaları ile kaliteli bir oyun deneyimi sunuyor.',
  address: 'Çaydaçıra Mahallesi, Zübeyde Hanım Caddesi No:23, Elazığ/Merkez',
  image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
  price: 350,
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
  { id: '1', time: '09:00 - 10:00', price: 300, available: true },
  { id: '2', time: '10:00 - 11:00', price: 300, available: true },
  { id: '3', time: '11:00 - 12:00', price: 300, available: true },
  { id: '4', time: '12:00 - 13:00', price: 300, available: true },
  { id: '5', time: '13:00 - 14:00', price: 320, available: true },
  { id: '6', time: '14:00 - 15:00', price: 320, available: true },
  { id: '7', time: '15:00 - 16:00', price: 320, available: true },
  { id: '8', time: '16:00 - 17:00', price: 350, available: true },
  { id: '9', time: '17:00 - 18:00', price: 350, available: true },
  { id: '10', time: '18:00 - 19:00', price: 380, available: true },
  { id: '11', time: '19:00 - 20:00', price: 380, available: false },
  { id: '12', time: '20:00 - 21:00', price: 380, available: true },
  { id: '13', time: '21:00 - 22:00', price: 350, available: true },
  { id: '14', time: '22:00 - 23:00', price: 350, available: true },
  { id: '15', time: '23:00 - 00:00', price: 320, available: true },
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
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  
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
  const handleReservation = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Hata', 'Lütfen rezervasyon saatini seçin.');
      return;
    }
    
    if (!name || !phone) {
      Alert.alert('Hata', 'Lütfen isim ve telefon bilgilerinizi girin.');
      return;
    }
    
    setLoading(true);
    
    // Rezervasyon işlemini simüle et
    setTimeout(() => {
      setLoading(false);
      
      Alert.alert(
        'Rezervasyon Başarılı',
        `${fieldData.name} sahasını ${formatDate(date)} tarihinde ${availableTimeSlots.find(slot => slot.id === selectedTimeSlot)?.time} saatinde başarıyla rezerve ettiniz.`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              router.push('/(tabs)');
            }
          }
        ]
      );
    }, 1500);
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
        }}
      />
      
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
              <ThemedText style={styles.fieldName}>{fieldData.name}</ThemedText>
              <View style={styles.ratingContainer}>
                <IconSymbol name="star.fill" size={18} color="#FFC107" />
                <ThemedText style={styles.ratingText}>{fieldData.rating}</ThemedText>
                <ThemedText style={styles.reviewText}>({fieldData.totalReviews} değerlendirme)</ThemedText>
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
                contentContainerStyle={styles.timeSlotContainer}
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
  timeSlotContainer: {
    paddingVertical: 10,
  },
  timeSlot: {
    width: 100,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
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
}); 