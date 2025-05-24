import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Yorum veri tipi
interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  fieldId: string;
  rating: number;
  text: string;
  date: string;
}

// Örnek yorumlar için isim verileri
const userNames = [
  'Ahmet Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Fatma Şahin', 'Ali Yıldız',
  'Mustafa Çelik', 'Zeynep Kara', 'Hüseyin Arslan', 'Esra Koç', 'Burak Öztürk',
  'Emre Yavuz', 'Deniz Aydın', 'Canan Güneş', 'Serkan Yılmaz', 'Gamze Demir',
  'Tolga Can', 'Sevgi Aktaş', 'Onur Kılıç', 'Melek Yıldırım', 'Murat Şahin'
];

// Yorum içerikleri
const reviewTexts = [
  'Saha zemini çok iyi durumda, tesisler temiz ve bakımlı. Fiyat/performans açısından da oldukça uygun. Kesinlikle tavsiye ederim.',
  'Saha güzel ve bakımlı ancak soyunma odaları biraz daha temiz olabilir. Genel olarak memnun kaldım, tekrar geleceğim.',
  'Harika bir deneyimdi! Personel çok ilgili, saha bakımlı ve ekipmanlar yeni.',
  'Saha ortalama seviyede. Aydınlatma biraz zayıf ve duşlar bazen soğuk oluyor. Ama fiyatı uygun olduğu için tercih ediyoruz.',
  'Güzel bir saha, özellikle antrenman için ideal boyutta. Kafeteryası da gayet iyi, maç sonrası dinlenebiliyorsunuz.',
  'Zemini kaliteli, sahayı çok beğendik. Arkadaşlarla her hafta burada oynuyoruz artık.',
  'Duşlar temiz ve sıcak su problemi yok. Soyunma odaları yeterli büyüklükte. Tavsiye ederim.',
  'Otopark sorunu olmaması büyük avantaj. Sahaya ulaşım çok kolay.',
  'Fiyatı biraz yüksek ama hizmeti de ona göre iyi. Kale fileleri yeni değişmiş.',
  'Halı biraz eskimiş durumda. Yenilense çok daha iyi olacak.',
  'Gece aydınlatması mükemmel, hiç görüş sorunu yaşamadık.',
  'Personel çok yardımcı. Ekstra forma ihtiyacımız olduğunda hemen tedarik ettiler.',
  'Saha kenarında su sebili olması büyük artı. Detaylara önem vermişler.',
  'Top kalitesi iyi olabilirdi. Kendi topumuzu getirmek zorunda kaldık.',
  'Rezervasyon sistemi çok pratik. Uygulama üzerinden kolayca yer ayırtabildik.',
  'Soyunma odasında askı az, eşyalarımızı koymakta zorlandık biraz.',
  'Kaleler sağlam ve fileleri yeni. Topun sekme problemi hiç yok.',
  'Zemin kaymıyor, ayakkabılar iyi tutuyor. Güvenli bir oyun alanı.',
  'Kafeterya fiyatları uygun, maç sonrası atıştırmalıklar iyi geldi.',
  'Havalandırma sistemi iyi çalışıyor, kapalı sahada bunalma olmuyor.'
];

// 128 adet değerlendirme oluştur
const generateMockReviews = (fieldId: string, count: number = 128): Review[] => {
  const reviews: Review[] = [];
  
  // Puan dağılımı: 5 yıldız ağırlıklı olacak şekilde
  const ratings = [3, 4, 4, 4, 5, 5, 5, 5, 5, 5];
  
  // Son 6 ay içerisinde rastgele tarih üret
  const randomDate = () => {
    const now = new Date();
    const monthsAgo = Math.floor(Math.random() * 6); // 0-6 ay öncesi
    const daysAgo = Math.floor(Math.random() * 30); // 0-30 gün öncesi
    now.setMonth(now.getMonth() - monthsAgo);
    now.setDate(now.getDate() - daysAgo);
    return now.toISOString();
  };
  
  for (let i = 0; i < count; i++) {
    const userName = userNames[Math.floor(Math.random() * userNames.length)];
    const reviewText = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    const gender = Math.random() > 0.7 ? 'women' : 'men';
    const userNum = Math.floor(Math.random() * 99) + 1;
    
    reviews.push({
      id: `rev-${i+1}`,
      userId: `user-${i+1}`,
      userName,
      userImage: `https://randomuser.me/api/portraits/${gender}/${userNum}.jpg`,
      fieldId,
      rating,
      text: reviewText,
      date: randomDate()
    });
  }
  
  // Tarihe göre sırala, en yeniler önce
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Varsayılan avatar URL'si
const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg';

export default function FieldReviewsScreen() {
  const params = useLocalSearchParams();
  const fieldId = params.id as string || 'field-1'; // Varsayılan olarak ilk sahayı kullan
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Tema renkleri
  const primaryColor = '#4CAF50';
  const secondaryColor = '#2196F3';
  
  // Sayfanın başlığını ayarla
  const fieldName = fieldId === 'sporium23' ? 'Sporium 23 Halı Saha' : 
                   fieldId === 'saha1' ? 'Halı Saha 1' : 
                   fieldId === 'saha2' ? 'Halı Saha 2' : 
                   fieldId === 'saha3' ? 'Halı Saha 3' : 'Halı Saha';
  
  // Yorumları yükle
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      
      try {
        // Mock verileri kullan
        setTimeout(() => {
          const allMockReviews = generateMockReviews(fieldId);
          setReviews(allMockReviews);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Yorumlar yüklenirken hata oluştu:', error);
        setLoading(false);
      }
    };
    
    loadReviews();
  }, [fieldId]);
  
  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy', { locale: tr });
  };
  
  // Yorum gönder
  const handleSubmitReview = () => {
    if (!isLoggedIn) {
      Alert.alert('Uyarı', 'Yorum yapabilmek için giriş yapmanız gerekiyor.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/login' as any) }
      ]);
      return;
    }
    
    if (userRating === 0) {
      Alert.alert('Hata', 'Lütfen puanlama yapın.');
      return;
    }
    
    if (reviewText.trim().length < 5) {
      Alert.alert('Hata', 'Lütfen en az 5 karakter içeren bir yorum yazın.');
      return;
    }
    
    setSubmitting(true);
    
    // Yeni yorum oluştur
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userId: user?.id || 'guest',
      userName: user?.name || 'Misafir',
      userImage: DEFAULT_AVATAR, // Varsayılan avatar kullan
      fieldId: fieldId,
      rating: userRating,
      text: reviewText.trim(),
      date: new Date().toISOString()
    };
    
    // Yorum gönderme simülasyonu
    setTimeout(() => {
      // Yeni yorumu ekle
      setReviews([newReview, ...reviews]);
      
      // Form alanlarını temizle
      setUserRating(0);
      setReviewText('');
      setSubmitting(false);
      
      Alert.alert('Başarılı', 'Yorumunuz başarıyla eklendi. Teşekkürler!');
    }, 1500);
  };
  
  // Yıldız puanlama bileşeni
  const RatingStars = ({ rating, size = 20, onPress = null }: { rating: number, size?: number, onPress?: any }) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <IconSymbol 
              name={star <= rating ? "star.fill" : "star"} 
              size={size} 
              color={star <= rating ? "#FFD700" : "#BDBDBD"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Yorum kartı bileşeni
  const renderReviewItem = ({ item }: { item: Review }) => {
    return (
      <Card style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: item.userImage }}
              style={styles.userImage}
            />
            <View>
              <ThemedText style={styles.userName}>{item.userName}</ThemedText>
              <ThemedText style={styles.reviewDate}>{formatDate(item.date)}</ThemedText>
            </View>
          </View>
          <RatingStars rating={item.rating} size={16} />
        </View>
        
        <ThemedText style={styles.reviewText}>{item.text}</ThemedText>
      </Card>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: `${fieldName} Yorumları`,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={styles.loadingText}>Yorumlar yükleniyor...</ThemedText>
          </View>
        ) : (
          <>
            {/* Yorum ekleme formu */}
            <Card style={styles.formCard}>
              <ThemedText style={styles.formTitle}>Değerlendirmenizi Yazın</ThemedText>
              
              <View style={styles.ratingSection}>
                <ThemedText style={styles.ratingLabel}>Puanlama:</ThemedText>
                <RatingStars rating={userRating} onPress={setUserRating} />
              </View>
              
              <TextInput
                style={styles.reviewInput}
                placeholder="Yorumunuzu buraya yazın..."
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
                value={reviewText}
                onChangeText={setReviewText}
              />
              
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  { backgroundColor: submitting ? '#BDBDBD' : primaryColor }
                ]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Yorum Gönder</ThemedText>
                )}
              </TouchableOpacity>
            </Card>
            
            <View style={styles.reviewsSection}>
              <ThemedText style={styles.reviewsTitle}>Kullanıcı Yorumları ({reviews.length})</ThemedText>
              
              {reviews.length === 0 ? (
                <View style={styles.emptyReviewsContainer}>
                  <IconSymbol name="message" size={60} color="#BDBDBD" />
                  <ThemedText style={styles.emptyReviewsText}>
                    Bu saha için henüz yorum yapılmamış. İlk yorumu siz yapın!
                  </ThemedText>
                </View>
              ) : (
                <FlatList
                  data={reviews}
                  renderItem={renderReviewItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.reviewsList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: '#212121',
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reviewsSection: {
    flex: 1,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyReviewsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyReviewsText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#757575',
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 