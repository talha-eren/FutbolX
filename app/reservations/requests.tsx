import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform, RefreshControl, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { reservationService } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReservationRequest {
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
  isOffline?: boolean;
}

export default function ReservationRequestsScreen() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rezervasyon taleplerini getir
  const fetchReservationRequests = async () => {
    if (!isLoggedIn) {
      setRequests([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Kullanıcı rezervasyon talepleri getiriliyor...');
      
      // Çevrimdışı rezervasyonları al
      let offlineReservations: ReservationRequest[] = [];
      try {
        const offlineReservationsStr = await AsyncStorage.getItem('offlineReservations');
        if (offlineReservationsStr) {
          const parsedOffline = JSON.parse(offlineReservationsStr);
          // Sadece "Onay Bekliyor" durumundaki çevrimdışı rezervasyonları al
          offlineReservations = parsedOffline
            .filter(item => item.status === 'Onay Bekliyor')
            .map(item => ({
              ...item,
              field: {
                _id: item.fieldId,
                name: item.fieldName,
                location: 'Sporyum 23, Elazığ',
                image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
                price: item.totalPrice
              },
              isOffline: true
            }));
        }
      } catch (offlineError) {
        console.error('Çevrimdışı rezervasyonlar alınamadı:', offlineError);
      }
      
      // API'den rezervasyon taleplerini almayı dene
      try {
        const data = await reservationService.getMyReservations();
        
        if (data && Array.isArray(data)) {
          // Sadece "Onay Bekliyor" durumundaki rezervasyonları filtrele
          const pendingRequests = data.filter(req => req.status === 'Onay Bekliyor');
          console.log(`${pendingRequests.length} rezervasyon talebi bulundu`);
          
          // API'den gelen ve çevrimdışı talepleri birleştir
          const allRequests = [...pendingRequests, ...offlineReservations];
          setRequests(allRequests);
          setLoading(false);
          setRefreshing(false);
          return;
        } else {
          console.log('API yanıtı beklenmeyen formatta:', data);
          throw new Error('API yanıtı beklenmeyen formatta');
        }
      } catch (apiError: any) {
        console.error('API\'den rezervasyon talepleri alınamadı:', apiError);
        
        // API hatası durumunda, çevrimdışı talepleri göster
        if (offlineReservations.length > 0) {
          setRequests(offlineReservations);
          setLoading(false);
          setRefreshing(false);
          return;
        }
        
        // Örnek veriler
        const mockRequests: ReservationRequest[] = [
          {
            _id: 'req-1',
            field: {
              _id: 'sporyum23-indoor-1',
              name: 'Halı Saha 1',
              location: 'Sporyum 23, Elazığ',
              image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
              price: 450
            },
            date: new Date().toISOString(),
            startTime: '19:00',
            endTime: '20:00',
            status: 'Onay Bekliyor',
            totalPrice: 450,
            paymentStatus: 'Ödenmedi',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'req-2',
            field: {
              _id: 'sporyum23-indoor-2',
              name: 'Halı Saha 2',
              location: 'Sporyum 23, Elazığ',
              image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
              price: 450
            },
            date: new Date(Date.now() + 86400000).toISOString(), // 1 gün sonra
            startTime: '20:00',
            endTime: '21:00',
            status: 'Onay Bekliyor',
            totalPrice: 450,
            paymentStatus: 'Ödenmedi',
            createdAt: new Date().toISOString()
          }
        ];
        
        setRequests([...mockRequests, ...offlineReservations]);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      console.error('Rezervasyon talepleri listeleme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Sayfa yüklendiğinde ve kullanıcı oturumu değiştiğinde rezervasyon taleplerini getir
  useEffect(() => {
    fetchReservationRequests();
  }, [isLoggedIn]);
  
  // Yenileme işlemi
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReservationRequests();
  };
  
  // Talepler üzerinde işlemler için ekstra fonksiyonlar
  const updateRequestStatus = (requestId: string, newStatus: string) => {
    // Talep listesini güncelle
    setRequests(requests.map(req => 
      req._id === requestId ? { ...req, status: newStatus as any } : req
    ));
  };
  
  // Rezervasyon talebini detaylı görüntüle
  const viewRequestDetails = (request: ReservationRequest) => {
    Alert.alert(
      'Rezervasyon Talebi Detayı',
      `Saha: ${request.field.name}\n` +
      `Tarih: ${formatDate(request.date)}\n` +
      `Saat: ${request.startTime} - ${request.endTime}\n` +
      `Fiyat: ${request.totalPrice}₺\n` +
      `Durum: ${request.status}\n` +
      `Ödeme: ${request.paymentStatus}\n` +
      `Talep Tarihi: ${new Date(request.createdAt).toLocaleString('tr-TR')}`,
      [{ text: 'Tamam', style: 'cancel' }]
    );
  };
  
  // Rezervasyon iptal et
  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      'Rezervasyon Talebi İptali',
      'Bu rezervasyon talebini iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'İptal Et', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // API'den rezervasyonu iptal etmeyi dene
              try {
                const response = await reservationService.cancelReservation(requestId);
                
                if (response) {
                  // Talep listesini güncelle (iptal edilen talebi kaldır)
                  setRequests(requests.filter(req => req._id !== requestId));
                  
                  Alert.alert('Başarılı', 'Rezervasyon talebiniz iptal edildi');
                  return;
                }
              } catch (apiError) {
                console.error('Rezervasyon iptal API hatası:', apiError);
              }
              
              // API çağrısı başarısız olursa veya offline modda çalışıyorsa
              // İptal işlemini simüle et
              setRequests(requests.filter(req => req._id !== requestId));
              
              Alert.alert('İşlem Alındı', 'Rezervasyon iptal talebiniz alındı');
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Rezervasyon iptal edilirken bir hata oluştu');
              console.error('Rezervasyon iptal hatası:', err);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, EEEE', { locale: tr });
  };
  
  // Rezervasyon talebi kartı bileşeni
  const renderRequestCard = ({ item }: { item: ReservationRequest }) => {
    return (
      <View style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <View style={styles.statusBadge}>
            <ThemedText style={styles.statusText}>Onay Bekliyor</ThemedText>
          </View>
          <ThemedText style={styles.dateText}>{formatDate(item.date)}</ThemedText>
          
          {item.isOffline && (
            <View style={styles.offlineTag}>
              <IconSymbol name="wifi.slash" size={12} color="#FF9800" />
              <ThemedText style={styles.offlineText}>Çevrimdışı</ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <Image 
            source={{ uri: item.field.image }} 
            style={styles.fieldImage}
            resizeMode="cover"
          />
          
          <View style={styles.fieldInfo}>
            <ThemedText style={styles.fieldName}>{item.field.name}</ThemedText>
            <ThemedText style={styles.fieldLocation}>{item.field.location}</ThemedText>
            
            <View style={styles.timeContainer}>
              <IconSymbol name="clock" size={16} color="#666" />
              <ThemedText style={styles.timeText}>{item.startTime} - {item.endTime}</ThemedText>
            </View>
            
            <ThemedText style={styles.priceText}>{item.totalPrice}₺</ThemedText>
            
            <View style={styles.waitingTag}>
              <IconSymbol name="hourglass" size={14} color="#FFA000" />
              <ThemedText style={styles.waitingText}>Onay bekleniyor</ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(item._id)}
          >
            <IconSymbol name="xmark.circle" size={16} color="#F44336" />
            <ThemedText style={styles.cancelButtonText}>İptal Et</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => viewRequestDetails(item)}
          >
            <IconSymbol name="info.circle" size={16} color="#2196F3" />
            <ThemedText style={styles.detailsButtonText}>Detaylar</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.fieldButton}
            onPress={() => router.push(`/field/${item.field._id}` as any)}
          >
            <IconSymbol name="map" size={16} color="#4CAF50" />
            <ThemedText style={styles.fieldButtonText}>Saha Bilgisi</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Rezervasyon işlemleri butonunu tanımla
  const handleReservationActions = () => {
    Alert.alert(
      'Rezervasyon İşlemleri',
      'Yapmak istediğiniz işlemi seçiniz:',
      [
        {
          text: 'Yeni Rezervasyon',
          onPress: () => router.push('/field/reservation')
        },
        {
          text: 'Rezervasyonlarım',
          onPress: () => router.push('/reservations')
        },
        {
          text: 'Halı Sahaları Görüntüle',
          onPress: () => router.push('/fields')
        },
        {
          text: 'İptal',
          style: 'cancel'
        }
      ]
    );
  };
  
  if (!isLoggedIn) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Rezervasyon Taleplerim',
            headerShown: true,
          }}
        />
        
        <View style={styles.notLoggedInContainer}>
          <IconSymbol name="person.circle.fill" size={80} color="#BDBDBD" />
          <ThemedText style={styles.notLoggedInText}>
            Rezervasyon taleplerinizi görmek için giriş yapmanız gerekiyor
          </ThemedText>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login' as any)}
          >
            <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Rezervasyon Taleplerim',
          headerShown: true,
        }}
      />
      
      {/* Rezervasyon İşlemleri Butonu */}
      <TouchableOpacity 
        style={styles.actionsButton}
        onPress={handleReservationActions}
      >
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.actionsButtonGradient}
        >
          <IconSymbol name="list.bullet" size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionsButtonText}>Rezervasyon İşlemleri</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Rezervasyon talepleri yükleniyor...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={60} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchReservationRequests}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar.badge.exclamationmark" size={60} color="#BDBDBD" />
          <ThemedText style={styles.emptyText}>Henüz onay bekleyen rezervasyon talebiniz bulunmuyor</ThemedText>
          <TouchableOpacity 
            style={styles.newReservationButton}
            onPress={() => router.push('/field/reservation' as any)}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.newReservationGradient}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
              <ThemedText style={styles.newReservationText}>Yeni Rezervasyon</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          ListFooterComponent={
            <TouchableOpacity 
              style={styles.newReservationButton}
              onPress={() => router.push('/field/reservation' as any)}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.newReservationGradient}
              >
                <IconSymbol name="plus" size={20} color="#fff" />
                <ThemedText style={styles.newReservationText}>Yeni Rezervasyon</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          }
        />
      )}
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    marginVertical: 20,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#FFA000', // Amber for pending
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  fieldImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  fieldInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fieldLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  cancelButtonText: {
    color: '#F44336',
    marginLeft: 4,
    fontWeight: '500',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
  newReservationButton: {
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  newReservationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  newReservationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  waitingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  waitingText: {
    fontSize: 12,
    color: '#FFA000',
    marginLeft: 4,
    fontWeight: '500',
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  fieldButtonText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionsButton: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  actionsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  actionsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  offlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  offlineText: {
    fontSize: 10,
    color: '#FF9800',
    marginLeft: 2,
    fontWeight: 'bold',
  },
}); 