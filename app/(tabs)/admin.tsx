import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Text } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { fieldService } from '../../services/fieldService';

export default function AdminScreen() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [addingData, setAddingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [halisahaData, setHalisahaData] = useState<any[]>([]);
  
  const { user } = useAuth();
  const router = useRouter();
  
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  
  useEffect(() => {
    // Admin değilse ana sayfaya yönlendir
    if (!user || !user.isAdmin) {
      Alert.alert('Yetkisiz Erişim', 'Bu sayfaya erişim yetkiniz bulunmamaktadır.');
      router.replace('/');
    }
  }, [user, router]);
  
  // Sosyal Halı Saha verilerini çek
  const fetchSosyalHalisahaData = async () => {
    try {
      setFetchingData(true);
      setError(null);
      setSuccess(null);
      
      const data = await fieldService.fetchFromSosyalHalisaha();
      
      if (data && data.length > 0) {
        setHalisahaData(data);
        setSuccess(`${data.length} adet halı saha verisi başarıyla çekildi.`);
      } else {
        setError('Halı saha verisi bulunamadı.');
      }
    } catch (err: any) {
      console.error('Veri çekme hatası:', err);
      setError(`Veri çekme hatası: ${err.message}`);
    } finally {
      setFetchingData(false);
    }
  };
  
  // Verileri veritabanına ekle
  const addDataToDatabase = async () => {
    if (!halisahaData || halisahaData.length === 0) {
      Alert.alert('Hata', 'Veritabanına eklenecek veri bulunamadı. Lütfen önce verileri çekin.');
      return;
    }
    
    try {
      setAddingData(true);
      setError(null);
      setSuccess(null);
      
      const result = await fieldService.addToDatabase(halisahaData);
      
      if (result) {
        setSuccess(`${halisahaData.length} adet halı saha verisi veritabanına başarıyla eklendi.`);
        // Başarılı olunca verileri temizle
        setHalisahaData([]);
      } else {
        setError('Veriler veritabanına eklenemedi.');
      }
    } catch (err: any) {
      console.error('Veritabanına ekleme hatası:', err);
      setError(`Veritabanına ekleme hatası: ${err.message}`);
    } finally {
      setAddingData(false);
    }
  };
  
  // Veritabanından mevcut halı sahaları getir
  const fetchExistingFields = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const data = await fieldService.getAll();
      
      if (data && data.length > 0) {
        setSuccess(`Veritabanında ${data.length} adet halı saha bulunuyor.`);
      } else {
        setSuccess('Veritabanında halı saha verisi bulunmuyor.');
      }
    } catch (err: any) {
      console.error('Veri getirme hatası:', err);
      setError(`Veri getirme hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Admin Paneli</ThemedText>
        </View>
        
        {/* Admin Menüsü */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Veri Yönetimi</ThemedText>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={fetchSosyalHalisahaData}
            disabled={fetchingData}
          >
            {fetchingData ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <IconSymbol name="arrow.down.to.line" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Sosyal Halı Saha Verilerini Çek</ThemedText>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { 
                backgroundColor: halisahaData.length > 0 ? tintColor : '#CCCCCC',
                opacity: addingData ? 0.7 : 1 
              }
            ]}
            onPress={addDataToDatabase}
            disabled={addingData || halisahaData.length === 0}
          >
            {addingData ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <IconSymbol name="plus.square" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Verileri Veritabanına Ekle</ThemedText>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={fetchExistingFields}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <IconSymbol name="list.bullet" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Mevcut Halı Sahaları Göster</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Durum Bilgisi */}
        {error && (
          <View style={[styles.statusCard, { backgroundColor: '#FFEBEE', borderColor: '#F44336' }]}>
            <IconSymbol name="exclamationmark.triangle" size={24} color="#F44336" />
            <ThemedText style={[styles.statusText, { color: '#D32F2F' }]}>{error}</ThemedText>
          </View>
        )}
        
        {success && (
          <View style={[styles.statusCard, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
            <IconSymbol name="checkmark.circle" size={24} color="#4CAF50" />
            <ThemedText style={[styles.statusText, { color: '#2E7D32' }]}>{success}</ThemedText>
          </View>
        )}
        
        {/* Veri Önizleme */}
        {halisahaData.length > 0 && (
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Veri Önizleme ({halisahaData.length} adet)</ThemedText>
            
            <View style={[styles.dataPreview, { backgroundColor: cardColor }]}>
              {halisahaData.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.dataItem}>
                  <ThemedText style={styles.dataItemTitle}>{item.name}</ThemedText>
                  <ThemedText style={styles.dataItemDetail}>{item.location}</ThemedText>
                  <ThemedText style={styles.dataItemDetail}>Tel: {item.phone}</ThemedText>
                  {item.features && item.features.length > 0 && (
                    <View style={styles.featureContainer}>
                      {item.features.map((feature: string, idx: number) => (
                        <View key={idx} style={styles.featureBadge}>
                          <ThemedText style={styles.featureText}>{feature}</ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              
              {halisahaData.length > 3 && (
                <View style={styles.moreDataInfo}>
                  <ThemedText style={styles.moreDataText}>
                    +{halisahaData.length - 3} adet daha...
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}
        
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  dataPreview: {
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dataItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dataItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dataItemDetail: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  featureBadge: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
  },
  featureText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  moreDataInfo: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  moreDataText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
}); 