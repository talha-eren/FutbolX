import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

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

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Tüm Bölgeler');
  const [selectedFeature, setSelectedFeature] = useState('Tüm Özellikler');
  const [activeTab, setActiveTab] = useState('districts'); // 'districts' veya 'features'
  
  // Halı saha verilerini ve filtre seçeneklerini API'den çek
  const [fields, setFields] = useState<Field[]>([]);
  const [districts, setDistricts] = useState(['Tüm Bölgeler']);
  const [features, setFeatures] = useState(['Tüm Özellikler']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  // Verileri API'den çek
  useEffect(() => {
    fetchData();
  }, []);

  // Verileri çekme fonksiyonu
  const fetchData = async () => {
    setLoading(true);
    try {
      // Halı sahaları çek
      // const fieldsData = await fieldService.getFields();
      // setFields(fieldsData || []);
      
      // Bölgeleri çek
      // const districtsData = await fieldService.getDistricts();
      // setDistricts(['Tüm Bölgeler', ...districtsData]);
      
      // Özellikleri çek
      // const featuresData = await fieldService.getFeatures();
      // setFeatures(['Tüm Özellikler', ...featuresData]);
    } catch (err) {
      console.error('Veri çekme hatası:', err);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Arama ve filtreleme
  const filteredFields = [] as Field[];

  // Yıldız derecelendirmesi gösterimi
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <IconSymbol key={`star-${i}`} name="star.fill" size={12} color="#FFC107" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <IconSymbol key={`star-half-${i}`} name="star.leadinghalf.filled" size={12} color="#FFC107" />
        );
      } else {
        stars.push(
          <IconSymbol key={`star-empty-${i}`} name="star" size={12} color="#FFC107" />
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
    <TouchableOpacity style={[styles.fieldCard, { borderColor: '#E0E0E0', backgroundColor }]}>
      <View style={styles.fieldImageContainer}>
        <Image source={{ uri: item.image }} style={styles.fieldImage} />
        <View style={styles.priceTag}>
          <ThemedText style={styles.priceText}>{item.priceRange}</ThemedText>
        </View>
      </View>
      
      <View style={styles.fieldContent}>
        <ThemedText style={styles.fieldName}>{item.name}</ThemedText>
        
        <View style={styles.fieldInfo}>
          <View style={styles.locationRow}>
            <IconSymbol name="mappin.and.ellipse" size={14} color={textColor} />
            <ThemedText style={styles.locationText}>{item.location}</ThemedText>
          </View>
          
          {renderRating(item.rating)}
        </View>
        
        <View style={styles.hoursRow}>
          <IconSymbol name="clock" size={14} color={textColor} />
          <ThemedText style={styles.hoursText}>{item.openHours}</ThemedText>
        </View>
        
        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View 
              key={index} 
              style={[styles.featureTag, { backgroundColor: tintColor }]}
            >
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={[styles.bookButton, { backgroundColor: tintColor }]}>
          <ThemedText style={styles.bookButtonText}>Rezervasyon Yap</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Halı Saha Keşfet</ThemedText>
        <View style={[styles.searchContainer, { borderColor: '#E0E0E0' }]}>
          <IconSymbol name="magnifyingglass" size={20} color="#999" />
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
            activeTab === 'districts' && { borderBottomColor: tintColor, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('districts')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              activeTab === 'districts' && { color: tintColor, fontWeight: 'bold' }
            ]}
          >
            Bölgeler
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'features' && { borderBottomColor: tintColor, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('features')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              activeTab === 'features' && { color: tintColor, fontWeight: 'bold' }
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
                    backgroundColor: selectedDistrict === district ? tintColor : 'transparent',
                    borderColor: '#E0E0E0' 
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
                    backgroundColor: selectedFeature === feature ? tintColor : 'transparent',
                    borderColor: '#E0E0E0'
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

      <View style={styles.resultsContainer}>
        <ThemedText style={styles.resultsText}>
          {filteredFields.length} sonuç bulundu
        </ThemedText>
      </View>

      <FlatList
        data={filteredFields}
        renderItem={renderFieldCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.fieldsContainer}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  fieldsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  fieldCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  fieldImageContainer: {
    position: 'relative',
  },
  fieldImage: {
    width: '100%',
    height: 150,
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  fieldContent: {
    padding: 16,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fieldInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hoursText: {
    fontSize: 14,
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  bookButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
