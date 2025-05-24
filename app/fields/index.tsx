import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, Platform, Alert, ScrollView, Text, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { primaryColor, secondaryColor, backgroundColor, textColor } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StatusBar } from 'expo-status-bar';

// API URL'sini platform'a göre ayarla
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

// Sabit halı saha verileri (API çalışmadığında kullanılacak)
const mockFields: Field[] = [
  {
    _id: 'field-1',
    name: 'Halı Saha 1',
    location: 'Sporyum 23, Elazığ',
    description: 'Tam boy profesyonel kapalı halı saha (30m x 50m). FIFA standartlarına uygun zemin, profesyonel aydınlatma ve kaliteli fileler.',
    price: 450,
    rating: 4.8,
    reviewCount: 128,
    image: require('@/assets/images/pitch1.jpg'),
    availability: 'available',
    features: ['Profesyonel Zemin', 'Tam Boy', 'Klima', 'Soyunma Odası', 'Duş'],
    size: '30m x 50m'
  },
  {
    _id: 'field-2',
    name: 'Halı Saha 2',
    location: 'Sporyum 23, Elazığ',
    description: 'Orta boy kapalı halı saha (25m x 40m). Bakımlı zemin, kaliteli aydınlatma ve konforlu seyirci alanı.',
    price: 450,
    rating: 4.6,
    reviewCount: 96,
    image: require('@/assets/images/pitch2.jpg'),
    availability: 'available',
    features: ['Standart Zemin', 'Orta Boy', 'Klima', 'Soyunma Odası', 'Duş'],
    size: '25m x 40m'
  },
  {
    _id: 'field-3',
    name: 'Halı Saha 3',
    location: 'Sporyum 23, Elazığ',
    description: 'Küçük boy antrenman sahası (20m x 30m). Takım antrenmanları ve küçük grup maçları için ideal boyut.',
    price: 450,
    rating: 4.5,
    reviewCount: 72,
    image: require('@/assets/images/pitch3.jpg'),
    availability: 'available',
    features: ['Standart Zemin', 'Küçük Boy', 'Klima', 'Soyunma Odası'],
    size: '20m x 30m'
  }
];

interface Field {
  _id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  reviewCount?: number;
  image: any;
  availability: string;
  features?: string[];
  size?: string;
}

export default function FieldsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('hali_sahalari');
  
  // URL parametrelerini kontrol et
  useEffect(() => {
    // URL parametrelerinden activeTab değerini al
    if (params.activeTab) {
      setActiveTab(params.activeTab as string);
    }
  }, [params]);
  
  // Halı sahaları getir
  const fetchFields = async () => {
    try {
      setLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/fields`);
        
        if (!response.ok) {
          throw new Error('Halı sahalar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setFields(data as Field[]);
        setFilteredFields(data as Field[]);
      } catch (apiError) {
        console.error('API hatası, mock veriler kullanılıyor:', apiError);
        // API hatası durumunda mock verileri kullan
        setFields(mockFields);
        setFilteredFields(mockFields);
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      console.error('Halı saha listeleme hatası:', err);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Sayfa yüklendiğinde halı sahaları getir
  useEffect(() => {
    fetchFields();
  }, []);
  
  // Arama işlemi
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFields(fields);
    } else {
      const filtered = fields.filter(field => 
        field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFields(filtered);
    }
  }, [searchQuery, fields]);
  
  // Yenileme işlemi
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFields();
  };
  
  // Rezervasyon fonksiyonu
  const handleReservation = (fieldId: string) => {
    router.push(`/field/${fieldId}/reservation` as any);
  };

  // Yorumlar fonksiyonu
  const handleReviews = (fieldId: string) => {
    router.push(`/field/reviews?id=${fieldId}`);
  };
  
  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Halı sahalar yükleniyor...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <IconSymbol name="exclamationmark.triangle" size={50} color="#F44336" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchFields}
        >
          <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <IconSymbol name="chevron.left" size={24} color={primaryColor} />
        <ThemedText style={styles.backButtonText}>FutbolX</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.calendarButton}
        onPress={() => router.push('/reservations' as any)}
      >
        <IconSymbol name="calendar" size={24} color="#000000" />
      </TouchableOpacity>
    </View>
  );
  
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'kesfet' && styles.activeTabButton]}
        onPress={() => setActiveTab('kesfet')}
      >
        <IconSymbol name="sparkles" size={22} color={activeTab === 'kesfet' ? primaryColor : '#757575'} />
        <ThemedText style={[styles.tabText, activeTab === 'kesfet' && styles.activeTabText]}>Keşfet</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'hali_sahalari' && styles.activeTabButton]}
        onPress={() => setActiveTab('hali_sahalari')}
      >
        <IconSymbol name="house" size={22} color={activeTab === 'hali_sahalari' ? primaryColor : '#757575'} />
        <ThemedText style={[styles.tabText, activeTab === 'hali_sahalari' && styles.activeTabText]}>Halı Sahalarımız</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'takimlarimiz' && styles.activeTabButton]}
        onPress={() => setActiveTab('takimlarimiz')}
      >
        <IconSymbol name="person.3" size={22} color={activeTab === 'takimlarimiz' ? primaryColor : '#757575'} />
        <ThemedText style={[styles.tabText, activeTab === 'takimlarimiz' && styles.activeTabText]}>Takımlarımız</ThemedText>
      </TouchableOpacity>
    </View>
  );
  
  const renderHaliSahaContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>Halı Sahalarımız</ThemedText>
        <TouchableOpacity onPress={() => router.push('/about')}>
          <ThemedText style={styles.viewAllButton}>Tümünü Gör</ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fieldCardContainer}>
        {filteredFields.map((field) => (
          <TouchableOpacity 
            key={field._id}
            style={styles.fieldCard}
            onPress={() => router.push(`/field/${field._id}` as any)}
          >
            <Image 
              source={field.image} 
              style={styles.fieldImage} 
              resizeMode="cover"
            />
            <View style={styles.fieldOverlay}>
              <ThemedText style={styles.fieldName}>{field.name}</ThemedText>
              <View style={styles.fieldDetails}>
                <View style={styles.locationContainer}>
                  <IconSymbol name="mappin" size={14} color="#757575" />
                  <Text style={styles.locationText}>{field.location}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <IconSymbol name="star.fill" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{field.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewText}>({field.reviewCount || 0})</Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{field.price} ₺</Text>
                <Text style={styles.priceUnit}>/ saat</Text>
                <TouchableOpacity 
                  style={styles.reservationButton}
                  onPress={() => handleReservation(field._id)}
                >
                  <Text style={styles.reservationButtonText}>Rezerve Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      
      {renderHeader()}
      
      {/* Arama Kutusu */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Halı saha veya konum ara..."
          placeholderTextColor="#9E9E9E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <IconSymbol name="xmark.circle.fill" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </View>
      
      {renderTabs()}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[primaryColor]}
            tintColor={primaryColor}
          />
        }
        style={styles.scrollView}
      >
        {activeTab === 'hali_sahalari' && renderHaliSahaContent()}
        
        {activeTab === 'kesfet' && (
          <View style={styles.emptyTabContainer}>
            <IconSymbol name="sparkles" size={60} color="#CCCCCC" />
            <ThemedText style={styles.emptyTabText}>Keşfet özelliği yakında gelecek</ThemedText>
          </View>
        )}
        
        {activeTab === 'takimlarimiz' && (
          <View style={styles.emptyTabContainer}>
            <IconSymbol name="person.3" size={60} color="#CCCCCC" />
            <ThemedText style={styles.emptyTabText}>Takımlar özelliği yakında gelecek</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: primaryColor,
    marginLeft: 4,
  },
  calendarButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: textColor,
    height: 46,
  },
  clearButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: primaryColor,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginLeft: 6,
  },
  activeTabText: {
    color: primaryColor,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllButton: {
    fontSize: 14,
    color: primaryColor,
    fontWeight: '500',
  },
  fieldCardContainer: {
    flexDirection: 'row',
  },
  fieldCard: {
    width: 300,
    height: 220,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  fieldImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  fieldOverlay: {
    padding: 12,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  fieldDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  priceUnit: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  reservationButton: {
    backgroundColor: primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
  emptyTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTabText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
  },
});
