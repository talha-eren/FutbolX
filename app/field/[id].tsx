import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { primaryColor, secondaryColor, backgroundColor, textColor } from '@/constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

// API URL'sini platform'a göre ayarla
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

interface Field {
  _id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  availability: string;
  description: string;
  features: string[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isLoggedIn, token, logout } = useAuth();
  
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  // Halı saha detaylarını getir
  useEffect(() => {
    const fetchFieldDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/fields/${id}`);
        
        if (!response.ok) {
          throw new Error('Halı saha bilgileri alınamadı');
        }
        
        const data = await response.json();
        setField(data);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu');
        console.error('Halı saha detay hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchFieldDetails();
    }
  }, [id]);
  
  // Seçilen tarih için müsait saatleri getir
  const fetchAvailableTimeSlots = async (date: Date) => {
    try {
      setLoadingTimeSlots(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log('Müsait saatleri getirme isteği gönderiliyor:', {
        fieldId: id,
        date: formattedDate
      });
      
      // Bu endpoint için token gerekmiyor, herkes müsait saatleri görebilir
      const response = await fetch(`${API_URL}/reservations/available/${id}/${formattedDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Müsait saatler alınamadı');
      }
      
      const data = await response.json();
      console.log('Müsait saatler alındı:', data);
      setTimeSlots(data);
      setSelectedTimeSlot(null); // Yeni tarih seçildiğinde seçili saati sıfırla
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Müsait saatler yüklenirken bir hata oluştu');
      console.error('Müsait saatler hatası:', err);
    } finally {
      setLoadingTimeSlots(false);
    }
  };
  
  // Tarih değiştiğinde müsait saatleri getir
  useEffect(() => {
    if (field) {
      fetchAvailableTimeSlots(selectedDate);
    }
  }, [selectedDate, field]);
  
  // Tarih seçimi değiştiğinde
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };
  
  // Rezervasyon yap
  const handleReservation = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Giriş Yapın',
        'Rezervasyon yapmak için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => router.push('/login' as any) }
        ]
      );
      return;
    }
    
    if (!selectedTimeSlot) {
      Alert.alert('Uyarı', 'Lütfen bir saat aralığı seçin');
      return;
    }
    
    try {
      // Token kontrolü
      if (!token) {
        console.error('Token bulunamadı! Oturum bilgileriniz kaybolmuş olabilir.');
        Alert.alert(
          'Oturum Hatası',
          'Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.',
          [
            { text: 'Tamam', onPress: () => router.push('/login' as any) }
          ]
        );
        return;
      }
      
      // Token'dan "Bearer " önekini kaldır (eğer varsa)
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      console.log('Rezervasyon isteği gönderiliyor:', {
        fieldId: id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        tokenLength: cleanToken.length
      });
      
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': cleanToken
        },
        body: JSON.stringify({
          fieldId: id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime
        })
      });
      
      // Yanıtı bir kez okuyup saklayacağız
      let responseText;
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('Yanıt metni okunamadı:', textError);
        throw new Error('Sunucu yanıtı okunamıyor');
      }
      
      // Başarısız yanıt için
      if (!response.ok) {
        let errorMessage = 'Rezervasyon yapılamadı';
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (jsonError) {
          console.error('Hata mesajı JSON olarak ayrıştırılamadı:', jsonError);
          // Eğer JSON olarak ayrıştırılamazsa, metni olduğu gibi kullan
          if (responseText && responseText.length < 100) { // Çok uzun değilse
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }
      
      // Başarılı yanıt için
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('Başarılı yanıt JSON olarak ayrıştırılamadı:', jsonError);
        // Yanıt ayrıştırılamadı ama işlem muhtemelen başarılı
        data = {};
      }
      
      Alert.alert(
        'Başarılı',
        'Rezervasyonunuz oluşturuldu. Rezervasyonlarım sayfasından takip edebilirsiniz.',
        [
          { text: 'Tamam', onPress: () => router.push('/reservations' as any) }
        ]
      );
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Rezervasyon yapılırken bir hata oluştu');
      console.error('Rezervasyon hatası:', err);
    }
  };
  
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error || !field) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#F44336" />
        <ThemedText style={styles.errorText}>{error || 'Halı saha bulunamadı'}</ThemedText>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Geri Dön</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      {/* Üst Menü */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Halı Saha Detayı</ThemedText>
        
        <View style={styles.headerRightButtons}>
          {isLoggedIn && (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => router.push('/reservations' as any)}
            >
              <Ionicons name="calendar" size={24} color={primaryColor} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => router.push('/fields' as any)}
          >
            <Ionicons name="football" size={24} color={primaryColor} />
          </TouchableOpacity>
          
          {isLoggedIn ? (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => {
                Alert.alert(
                  'Çıkış Yap',
                  'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
                  [
                    { text: 'İptal', style: 'cancel' },
                    { 
                      text: 'Çıkış Yap', 
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await logout();
                          router.push('/' as any);
                          Alert.alert('Başarılı', 'Başarıyla çıkış yapıldı.');
                        } catch (error) {
                          console.error('Çıkış yaparken hata:', error);
                          Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
                        }
                      } 
                    }
                  ]
                );
              }}
            >
              <Ionicons name="log-out" size={24} color="#F44336" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => router.push('/login' as any)}
            >
              <Ionicons name="log-in" size={24} color={primaryColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Halı Saha Resmi */}
        <Image 
          source={{ uri: field.image.startsWith('http') ? field.image : `${API_URL}${field.image}` }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        {/* Halı Saha Bilgileri */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.name}>{field.name}</ThemedText>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={18} color={primaryColor} />
            <ThemedText style={styles.location}>{field.location}</ThemedText>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <ThemedText style={styles.rating}>{field.rating.toFixed(1)}</ThemedText>
          </View>
          
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>{field.price} ₺</ThemedText>
            <ThemedText style={styles.priceUnit}>/ saat</ThemedText>
          </View>
          
          <ThemedText style={styles.description}>{field.description}</ThemedText>
          
          {/* Özellikler */}
          {field.features.length > 0 && (
            <View style={styles.featuresContainer}>
              <ThemedText style={styles.featuresTitle}>Özellikler</ThemedText>
              <View style={styles.featuresList}>
                {field.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialIcons name="check-circle" size={16} color={primaryColor} />
                    <ThemedText style={styles.featureText}>{feature}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Rezervasyon Bölümü */}
          <View style={styles.reservationContainer}>
            <ThemedText style={styles.reservationTitle}>Rezervasyon Yap</ThemedText>
            
            {/* Tarih Seçimi */}
            <View style={styles.datePickerContainer}>
              <ThemedText style={styles.datePickerLabel}>Tarih Seçin</ThemedText>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={styles.datePickerButtonText}>
                  {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
                </ThemedText>
                <Ionicons name="calendar" size={20} color={primaryColor} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 gün sonrası
                />
              )}
            </View>
            
            {/* Saat Seçimi */}
            <View style={styles.timeSlotContainer}>
              <ThemedText style={styles.timeSlotLabel}>Saat Seçin</ThemedText>
              
              {loadingTimeSlots ? (
                <ActivityIndicator size="small" color={primaryColor} style={styles.timeSlotLoading} />
              ) : timeSlots.length === 0 ? (
                <ThemedText style={styles.noTimeSlotsText}>Bu tarih için müsait saat bulunamadı</ThemedText>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.timeSlotScrollView}
                >
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlotButton,
                        !slot.available && styles.timeSlotButtonDisabled,
                        selectedTimeSlot === slot && styles.timeSlotButtonSelected
                      ]}
                      onPress={() => slot.available && setSelectedTimeSlot(slot)}
                      disabled={!slot.available}
                    >
                      <ThemedText 
                        style={[
                          styles.timeSlotButtonText,
                          !slot.available && styles.timeSlotButtonTextDisabled,
                          selectedTimeSlot === slot && styles.timeSlotButtonTextSelected
                        ]}
                      >
                        {slot.startTime} - {slot.endTime}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            
            {/* Rezervasyon Özeti */}
            {selectedTimeSlot && (
              <View style={styles.summaryContainer}>
                <ThemedText style={styles.summaryTitle}>Rezervasyon Özeti</ThemedText>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Tarih:</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Saat:</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Fiyat:</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {field.price} ₺
                  </ThemedText>
                </View>
              </View>
            )}
            
            {/* Rezervasyon Butonu */}
            <TouchableOpacity
              style={[
                styles.reserveButton,
                !selectedTimeSlot && styles.reserveButtonDisabled
              ]}
              onPress={handleReservation}
              disabled={!selectedTimeSlot}
            >
              <ThemedText style={styles.reserveButtonText}>Rezervasyon Yap</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 5,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: primaryColor,
  },
  priceUnit: {
    marginLeft: 5,
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 5,
    fontSize: 14,
  },
  reservationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  reservationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerButtonText: {
    fontSize: 14,
  },
  timeSlotContainer: {
    marginBottom: 16,
  },
  timeSlotLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeSlotLoading: {
    marginVertical: 10,
  },
  noTimeSlotsText: {
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  timeSlotScrollView: {
    flexDirection: 'row',
  },
  timeSlotButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeSlotButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  timeSlotButtonSelected: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  timeSlotButtonText: {
    fontSize: 14,
  },
  timeSlotButtonTextDisabled: {
    color: '#aaa',
  },
  timeSlotButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reserveButton: {
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  reserveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
