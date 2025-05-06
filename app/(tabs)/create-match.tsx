import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Switch, Platform } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';

// DateTimePicker'ı koşullu import
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    // Native platformlar için dinamik import (iOS, Android)
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (error) {
    console.error('DateTimePicker modülü yüklenemedi:', error);
  }
}

function CreateMatchScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [fieldName, setFieldName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [price, setPrice] = useState('');
  const [totalPlayers, setTotalPlayers] = useState('10');
  const [level, setLevel] = useState('Orta');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop');
  const [isPrivate, setIsPrivate] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  // Form doğrulama
  const validateForm = () => {
    if (!fieldName.trim()) return 'Saha adını giriniz';
    if (!location.trim()) return 'Konum bilgisini giriniz';
    if (!price.trim() || isNaN(Number(price))) return 'Geçerli bir fiyat giriniz';
    if (!totalPlayers.trim() || isNaN(Number(totalPlayers))) return 'Geçerli bir oyuncu sayısı giriniz';
    if (Number(totalPlayers) < 2) return 'En az 2 oyuncu gereklidir';
    if (!imageUrl.trim()) return 'Görsel URL\'i giriniz';
    return null;
  };
  
  // Formatlanmış tarih ve saat
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  const formatTime = (time: Date) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // DatePicker değişim işleyicisi
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };
  
  // Maç oluşturma
  const handleCreateMatch = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Hata', validationError);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const matchData = {
        fieldName,
        location,
        date: formatDate(date),
        time: formatTime(time),
        price: Number(price),
        totalPlayers: Number(totalPlayers),
        level,
        image: imageUrl,
        isPrivate
      };
      
      const response = await fetch(`${API_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(matchData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Maç oluşturulurken bir hata oluştu');
      }
      
      await response.json();
      
      Alert.alert(
        'Başarılı',
        'Maç başarıyla oluşturuldu!',
        [{ text: 'Tamam', onPress: () => router.push('/(tabs)/matches') }]
      );
    } catch (err: any) {
      console.error('Maç oluşturma hatası:', err);
      setError(err.message || 'Maç oluşturulurken bir hata oluştu');
      Alert.alert('Hata', err.message || 'Maç oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // DateTimePicker'ı render etmek için güvenli fonksiyon
  const renderDateTimePicker = () => {
    if (!DateTimePicker) {
      return (
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => Alert.alert('Bilgi', 'DateTimePicker modülü bu platformda desteklenmiyor.')}
        >
          <IconSymbol name="calendar" size={24} color="#4CAF50" />
          <ThemedText style={styles.datePickerButtonText}>
            {date.toLocaleDateString()}, {time.toLocaleTimeString().slice(0, 5)}
          </ThemedText>
        </TouchableOpacity>
      );
    }

    return (
      <>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
        
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Yeni Maç Oluştur</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Saha Adı</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: '#E0E0E0' }]}
            placeholder="Saha adını giriniz"
            placeholderTextColor="#999"
            value={fieldName}
            onChangeText={setFieldName}
          />
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Konum</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: '#E0E0E0' }]}
            placeholder="Saha konumunu giriniz"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <ThemedText style={styles.label}>Tarih</ThemedText>
            <TouchableOpacity
              style={[styles.dateInput, { borderColor: '#E0E0E0' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{formatDate(date)}</ThemedText>
              <IconSymbol name="calendar" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <ThemedText style={styles.label}>Saat</ThemedText>
            <TouchableOpacity
              style={[styles.dateInput, { borderColor: '#E0E0E0' }]}
              onPress={() => setShowTimePicker(true)}
            >
              <ThemedText>{formatTime(time)}</ThemedText>
              <IconSymbol name="clock" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
        
        {renderDateTimePicker()}
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <ThemedText style={styles.label}>Fiyat (TL)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: '#E0E0E0' }]}
              placeholder="Kişi başı fiyat"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <ThemedText style={styles.label}>Oyuncu Sayısı</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: '#E0E0E0' }]}
              placeholder="Toplam oyuncu"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={totalPlayers}
              onChangeText={setTotalPlayers}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Seviye</ThemedText>
          <View style={styles.levelOptions}>
            {['Amatör', 'Orta', 'İleri'].map((levelOption) => (
              <TouchableOpacity
                key={levelOption}
                style={[
                  styles.levelOption,
                  level === levelOption && { backgroundColor: tintColor }
                ]}
                onPress={() => setLevel(levelOption)}
              >
                <ThemedText
                  style={[
                    styles.levelOptionText,
                    level === levelOption && { color: '#FFFFFF' }
                  ]}
                >
                  {levelOption}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Görsel URL</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: '#E0E0E0' }]}
            placeholder="Saha görseli URL'si"
            placeholderTextColor="#999"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <ThemedText style={styles.label}>Özel Maç</ThemedText>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#E0E0E0', true: tintColor }}
            />
          </View>
          <ThemedText style={styles.switchHint}>
            Özel maçlar sadece davet ettiğiniz kişilere görünür.
          </ThemedText>
        </View>
        
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: tintColor }]}
          onPress={handleCreateMatch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText style={styles.createButtonText}>Maç Oluştur</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

// Stilleri tanımla
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
  },
  formContentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  levelOptionText: {
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerButtonText: {
    marginLeft: 8,
  },
});

export default CreateMatchScreen; 