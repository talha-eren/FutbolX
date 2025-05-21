import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';

export default function ReservationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isLoggedIn, user } = useAuth();
  
  // State tanımlamaları
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [note, setNote] = useState('');
  
  // Saha bilgileri (gerçek uygulamada API'den çekilecek)
  const fieldInfo = {
    name: "Sporyum 23",
    rating: 4.8,
    reviewCount: 56,
    price: 450,
    phoneNumber: "0555 123 45 67",
    address: "Cumhuriyet Mah. 7. Ahmet Baba Bulvarı No:112, Merkez/Elazığ",
    openingHours: "09:00 - 01:00"
  };
  
  // Rezervasyon saatleri
  const timeSlots = [
    "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00",
    "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00",
    "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00",
    "21:00 - 22:00", "22:00 - 23:00", "23:00 - 00:00", "00:00 - 01:00"
  ];
  
  // Tarih formatı
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tarih seçimi işleyicisi
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };
  
  // Rezervasyon tamamlama işleyicisi
  const handleCompleteReservation = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Uyarı', 'Lütfen bir saat dilimi seçin');
      return;
    }
    
    // Burada rezervasyon API'sine istek atılabilir
    Alert.alert(
      'Başarılı', 
      `Rezervasyonunuz başarıyla oluşturuldu!\nTarih: ${formatDate(selectedDate)}\nSaat: ${selectedTimeSlot}`,
      [
        { text: 'Tamam', onPress: () => router.push('/(tabs)' as any) }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Saha Rezervasyonu',
          headerShown: true,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Üst Bilgi Bölümü */}
        <View style={styles.fieldInfoContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <IconSymbol name="soccerball" size={30} color="#fff" />
            </View>
            <View style={styles.fieldInfoText}>
              <ThemedText style={styles.fieldName}>{fieldInfo.name}</ThemedText>
              <View style={styles.ratingContainer}>
                <IconSymbol name="star.fill" size={16} color="#FFD700" />
                <IconSymbol name="star.fill" size={16} color="#FFD700" />
                <IconSymbol name="star.fill" size={16} color="#FFD700" />
                <IconSymbol name="star.fill" size={16} color="#FFD700" />
                <IconSymbol name="star.lefthalf.fill" size={16} color="#FFD700" />
                <ThemedText style={styles.ratingText}>{fieldInfo.rating} • {fieldInfo.reviewCount}</ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <ThemedText style={styles.priceLabel}>Saatlik Ücret</ThemedText>
            <ThemedText style={styles.price}>{fieldInfo.price}₺</ThemedText>
          </View>
        </View>
        
        {/* Bilgi Kartları */}
        <View style={styles.infoCardsContainer}>
          {/* Sahayı Seçtiniz */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
            </View>
            <ThemedText style={styles.infoCardText}>Sahayı Seçtiniz</ThemedText>
          </View>
          
          {/* Kullanım Amacı */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <IconSymbol name="flag.fill" size={20} color="#4CAF50" />
            </View>
            <ThemedText style={styles.infoCardText}>Halı Saha Maçı</ThemedText>
          </View>
          
          {/* Fiyat */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <IconSymbol name="creditcard.fill" size={20} color="#4CAF50" />
            </View>
            <ThemedText style={styles.infoCardText}>Yerinde Ödenecek</ThemedText>
          </View>
        </View>
        
        {/* Rezervasyon Formu */}
        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Rezervasyon Bilgileri</ThemedText>
          
          {/* Tarih Seçimi */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Tarih Seçin</ThemedText>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol name="calendar" size={20} color="#4CAF50" />
              <ThemedText style={styles.dateText}>{formatDate(selectedDate)}</ThemedText>
              <IconSymbol name="chevron.down" size={16} color="#777" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          {/* Saat Seçimi */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Saati Seçin</ThemedText>
            <View style={styles.timeSlotContainer}>
              {timeSlots.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedTimeSlot === time && styles.selectedTimeSlot
                  ]}
                  onPress={() => setSelectedTimeSlot(time)}
                >
                  <ThemedText style={[
                    styles.timeSlotText,
                    selectedTimeSlot === time && styles.selectedTimeSlotText
                  ]}>
                    {time}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Not Ekleme */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Not Ekleyin (Opsiyonel)</ThemedText>
            <TextInput
              style={styles.noteInput}
              placeholder="Özel isteklerinizi belirtin..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={note}
              onChangeText={setNote}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Alt Buton Bölümü */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.cancelButtonText}>İptal</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reserveButton}
          onPress={handleCompleteReservation}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.reserveButtonGradient}
          >
            <ThemedText style={styles.reserveButtonText}>Rezervasyon Yap</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  fieldInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldInfoText: {
    flex: 1,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 14,
    color: '#777',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardIcon: {
    marginRight: 8,
  },
  infoCardText: {
    fontSize: 12,
    flex: 1,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    width: '23%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    margin: '1%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTimeSlot: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  timeSlotText: {
    fontSize: 12,
  },
  selectedTimeSlotText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noteInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  reserveButton: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  reserveButtonGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 