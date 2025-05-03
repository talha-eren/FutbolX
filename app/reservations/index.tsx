import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { primaryColor, secondaryColor, backgroundColor, textColor } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

// API URL'sini platform'a göre ayarla
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

interface Reservation {
  _id: string;
  field: {
    _id: string;
    name: string;
    location: string;
    image: string;
    price: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'Onay Bekliyor' | 'Onaylandı' | 'İptal Edildi' | 'Tamamlandı';
  totalPrice: number;
  paymentStatus: string;
  createdAt: string;
}

export default function ReservationsScreen() {
  const router = useRouter();
  const { isLoggedIn, token } = useAuth();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rezervasyonları getir
  const fetchReservations = async () => {
    if (!isLoggedIn) {
      setReservations([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Token kontrolü
      if (!token) {
        console.error('Token bulunamadı! Oturum bilgileriniz kaybolmuş olabilir.');
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      // Token'dan "Bearer " önekini kaldır (eğer varsa)
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      console.log('Rezervasyonları getirme isteği gönderiliyor:', {
        endpoint: `${API_URL}/reservations/my`,
        tokenLength: cleanToken.length
      });

      const response = await fetch(`${API_URL}/reservations/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': cleanToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Rezervasyonlar alınamadı');
      }
      
      const data = await response.json();
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      console.error('Rezervasyon listeleme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Sayfa yüklendiğinde ve kullanıcı oturumu değiştiğinde rezervasyonları getir
  useEffect(() => {
    fetchReservations();
  }, [isLoggedIn, token]);
  
  // Yenileme işlemi
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };
  
  // Rezervasyon iptal et
  const handleCancelReservation = (reservationId: string) => {
    Alert.alert(
      'Rezervasyon İptali',
      'Bu rezervasyonu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'İptal Et', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Token kontrolü
              if (!token) {
                Alert.alert('Hata', 'Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
                return;
              }
              
              // Token'dan "Bearer " önekini kaldır (eğer varsa)
              const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
              
              console.log('Rezervasyon iptal isteği gönderiliyor:', {
                reservationId,
                tokenLength: cleanToken.length
              });

              const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'x-auth-token': cleanToken
                }
              });
              
              if (!response.ok) {
                throw new Error('Rezervasyon iptal edilemedi');
              }
              
              // Rezervasyon listesini güncelle
              setReservations(reservations.map(res => 
                res._id === reservationId ? { ...res, status: 'İptal Edildi' } : res
              ));
              
              Alert.alert('Başarılı', 'Rezervasyonunuz iptal edildi');
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Rezervasyon iptal edilirken bir hata oluştu');
              console.error('Rezervasyon iptal hatası:', err);
            }
          }
        }
      ]
    );
  };
  
  // Rezervasyon durumuna göre renk belirle
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onay Bekliyor':
        return '#FFA000'; // Amber
      case 'Onaylandı':
        return '#4CAF50'; // Green
      case 'İptal Edildi':
        return '#F44336'; // Red
      case 'Tamamlandı':
        return '#2196F3'; // Blue
      default:
        return '#757575'; // Grey
    }
  };
  
  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, EEEE', { locale: tr });
  };
  
  if (!isLoggedIn) {
    return (
      <ThemedView style={styles.notLoggedInContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#BDBDBD" />
        <ThemedText style={styles.notLoggedInText}>
          Rezervasyonlarınızı görmek için giriş yapmanız gerekiyor
        </ThemedText>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login' as any)}
        >
          <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Rezervasyonlar yükleniyor...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Rezervasyonlarım</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.newReservationButton}
          onPress={() => router.push('/fields' as any)}
        >
          <Ionicons name="add" size={20} color="white" />
          <ThemedText style={styles.newReservationButtonText}>Yeni Rezervasyon</ThemedText>
        </TouchableOpacity>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchReservations}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      ) : reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#BDBDBD" />
          <ThemedText style={styles.emptyText}>Henüz rezervasyonunuz bulunmuyor</ThemedText>
          <TouchableOpacity 
            style={styles.newReservationButton}
            onPress={() => router.push('/fields' as any)}
          >
            <Ionicons name="add" size={20} color="white" />
            <ThemedText style={styles.newReservationButtonText}>Yeni Rezervasyon</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.reservationCard}
              onPress={() => router.push(`/field/${item.field._id}` as any)}
            >
              <View style={styles.cardHeader}>
                <ThemedText style={styles.fieldName}>{item.field.name}</ThemedText>
                <View 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(item.status) }
                  ]}
                >
                  <ThemedText style={styles.statusText}>{item.status}</ThemedText>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color={primaryColor} />
                  <ThemedText style={styles.infoText}>{formatDate(item.date)}</ThemedText>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color={primaryColor} />
                  <ThemedText style={styles.infoText}>{item.startTime} - {item.endTime}</ThemedText>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color={primaryColor} />
                  <ThemedText style={styles.infoText}>{item.field.location}</ThemedText>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="cash" size={16} color={primaryColor} />
                  <ThemedText style={styles.infoText}>{item.totalPrice} ₺</ThemedText>
                </View>
              </View>
              
              {item.status === 'Onay Bekliyor' || item.status === 'Onaylandı' ? (
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => handleCancelReservation(item._id)}
                >
                  <Ionicons name="close-circle" size={16} color="white" />
                  <ThemedText style={styles.cancelButtonText}>İptal Et</ThemedText>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  newReservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newReservationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  reservationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
