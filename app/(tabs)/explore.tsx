import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Halı saha tipi tanımı
interface Field {
  id: string;
  name: string;
  image: string;
  location: string;
  city: string;
  district: string;
  rating: number;
  priceRange: string;
  features: string[];
  openHours: string;
}

// Örnek veri
const sampleFields: Field[] = [
  {
    id: '1',
    name: 'Futbol Arena',
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    location: 'Kadıköy, İstanbul',
    city: 'İstanbul',
    district: 'Kadıköy',
    rating: 4.5,
    priceRange: '₺350-450/saat',
    features: ['Kapalı', 'Duş', 'Otopark'],
    openHours: '09:00 - 23:00'
  },
  {
    id: '2',
    name: 'Yeşil Vadi Spor Tesisleri',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1593&q=80',
    location: 'Beşiktaş, İstanbul',
    city: 'İstanbul',
    district: 'Beşiktaş',
    rating: 4.2,
    priceRange: '₺400-500/saat',
    features: ['Açık', 'Soyunma Odası', 'Kafeterya'],
    openHours: '10:00 - 22:00'
  },
  {
    id: '3',
    name: 'Gol Akademi',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    location: 'Ümraniye, İstanbul',
    city: 'İstanbul',
    district: 'Ümraniye',
    rating: 4.8,
    priceRange: '₺300-400/saat',
    features: ['Kapalı', 'Duş', 'Otopark', 'Kafeterya'],
    openHours: '08:00 - 24:00'
  }
];

// Örnek bölgeler ve özellikler
const sampleDistricts = ['Tüm Bölgeler', 'Kadıköy', 'Beşiktaş', 'Ümraniye', 'Şişli', 'Maltepe'];
const sampleFeatures = ['Tüm Özellikler', 'Kapalı', 'Açık', 'Duş', 'Otopark', 'Kafeterya', 'Soyunma Odası'];

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Tüm Bölgeler');
  const [selectedFeature, setSelectedFeature] = useState('Tüm Özellikler');
  const [activeTab, setActiveTab] = useState('districts'); // 'districts' veya 'features'
  
  // Halı saha verilerini ve filtre seçeneklerini API'den çek
  const [fields, setFields] = useState<Field[]>(sampleFields);
  const [districts, setDistricts] = useState(sampleDistricts);
  const [features, setFeatures] = useState(sampleFeatures);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#1976D2'; // Ana mavi renk
  const secondaryColor = '#0D47A1'; // Koyu mavi
  const accentColor = '#42A5F5'; // Açık mavi
  const borderColor = '#E0E0E0';

  const router = useRouter();

  // Verileri API'den çek
  useEffect(() => {
    fetchData();
  }, []);

  // Verileri çekme fonksiyonu
  const fetchData = async () => {
    setLoading(true);
    try {
      // API'den veri çekme simülasyonu
      setTimeout(() => {
        setFields(sampleFields);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Veri çekme hatası:', err);
      setError('Veriler yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  // Arama ve filtreleme
  const filteredFields = fields.filter(field => {
    const matchesSearch = searchText === '' || 
      field.name.toLowerCase().includes(searchText.toLowerCase()) ||
      field.location.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDistrict = selectedDistrict === 'Tüm Bölgeler' || 
      field.district === selectedDistrict;
    
    const matchesFeature = selectedFeature === 'Tüm Özellikler' || 
      field.features.includes(selectedFeature);
    
    return matchesSearch && matchesDistrict && matchesFeature;
  });

  // Yıldız derecelendirmesi gösterimi
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars: React.ReactNode[] = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <IconSymbol key={`star-${i}`} name="star.fill" size={14} color="#FFC107" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <IconSymbol key={`star-half-${i}`} name="star.leadinghalf.filled" size={14} color="#FFC107" />
        );
      } else {
        stars.push(
          <IconSymbol key={`star-empty-${i}`} name="star" size={14} color="#FFC107" />
        );
      }
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>{stars}</View>
        <ThemedText style={styles.ratingText}>{rating.toFixed(1)}</ThemedText>
      </View>
    );
  };

  // Halı saha kartı
  const renderFieldCard = ({ item }: { item: Field }) => (
    <TouchableOpacity 
      style={[styles.fieldCard, { backgroundColor }]}
      activeOpacity={0.9}
    >
      <View style={styles.fieldImageContainer}>
        <Image source={{ uri: item.image }} style={styles.fieldImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageGradient}
        />
        <View style={styles.priceTag}>
          <ThemedText style={styles.priceText}>{item.priceRange}</ThemedText>
        </View>
      </View>
      
      <View style={styles.fieldContent}>
        <ThemedText style={styles.fieldName}>{item.name}</ThemedText>
        
        <View style={styles.fieldInfo}>
          <View style={styles.locationRow}>
            <IconSymbol name="mappin.and.ellipse" size={16} color={primaryColor} />
            <ThemedText style={styles.locationText}>{item.location}</ThemedText>
          </View>
          
          {renderRating(item.rating)}
        </View>
        
        <View style={styles.hoursRow}>
          <IconSymbol name="clock" size={16} color={textColor} />
          <ThemedText style={styles.hoursText}>{item.openHours}</ThemedText>
        </View>
        
        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View 
              key={index} 
              style={[styles.featureTag, { backgroundColor: accentColor }]}
            >
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.bookButton, { backgroundColor: primaryColor }]}
          onPress={() => handleBooking(item.id)}
        >
          <ThemedText style={styles.bookButtonText}>Rezervasyon Yap</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleBooking = (fieldId) => {
    router.push(`/reservations?fieldId=${fieldId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#E1F5FE', '#B3E5FC', '#E3F2FD']}
        style={styles.headerGradient}
      >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Halı Saha Keşfet</ThemedText>
          <View style={[styles.searchContainer, { borderColor }]}>
            <IconSymbol name="magnifyingglass" size={20} color={primaryColor} />
          <TextInput
            style={styles.searchInput}
            placeholder="Saha adı veya konum ara..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
              activeTab === 'districts' && { borderBottomColor: primaryColor, borderBottomWidth: 3 }
          ]}
          onPress={() => setActiveTab('districts')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
                activeTab === 'districts' && { color: primaryColor, fontWeight: 'bold' }
            ]}
          >
            Bölgeler
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
              activeTab === 'features' && { borderBottomColor: primaryColor, borderBottomWidth: 3 }
          ]}
          onPress={() => setActiveTab('features')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
                activeTab === 'features' && { color: primaryColor, fontWeight: 'bold' }
            ]}
          >
            Özellikler
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'districts' ? (
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {districts.map((district, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  { 
                      backgroundColor: selectedDistrict === district ? primaryColor : 'white',
                      borderColor
                  }
                ]}
                onPress={() => setSelectedDistrict(district)}
              >
                <ThemedText
                  style={[
                    styles.categoryText,
                    { color: selectedDistrict === district ? '#fff' : textColor }
                  ]}
                >
                  {district}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  { 
                      backgroundColor: selectedFeature === feature ? primaryColor : 'white',
                      borderColor
                  }
                ]}
                onPress={() => setSelectedFeature(feature)}
              >
                <ThemedText
                  style={[
                    styles.categoryText,
                    { color: selectedFeature === feature ? '#fff' : textColor }
                  ]}
                >
                  {feature}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      </LinearGradient>

      <View style={styles.resultsContainer}>
        <ThemedText style={styles.resultsText}>
          {filteredFields.length} sonuç bulundu
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Halı sahalar yükleniyor...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={40} color="#FF5252" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={fetchData}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
      <FlatList
        data={filteredFields}
        renderItem={renderFieldCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.fieldsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="magnifyingglass" size={50} color="#BDBDBD" />
              <ThemedText style={styles.emptyText}>
                Aradığınız kriterlere uygun halı saha bulunamadı.
              </ThemedText>
            </View>
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
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 10,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  fieldsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  fieldCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fieldImageContainer: {
    position: 'relative',
  },
  fieldImage: {
    width: '100%',
    height: 180,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fieldContent: {
    padding: 16,
  },
  fieldName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fieldInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  hoursText: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.8,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureTag: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  bookButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  }
});
