import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Person as PersonIcon, Star as StarIcon } from '@mui/icons-material';

// Örnek kullanıcı isimleri
const userNames = [
  'Ahmet Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Fatma Şahin', 'Ali Yıldız',
  'Mustafa Çelik', 'Zeynep Kara', 'Hüseyin Arslan', 'Esra Koç', 'Burak Öztürk',
  'Emre Yavuz', 'Deniz Aydın', 'Canan Güneş', 'Serkan Yılmaz', 'Gamze Demir',
  'Tolga Can', 'Sevgi Aktaş', 'Onur Kılıç', 'Melek Yıldırım', 'Murat Şahin'
];

// Gerçekçi yorum içerikleri
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
const generateMockReviews = (facilityId, count = 128) => {
  const reviews = [];
  
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
      facilityId,
      rating,
      text: reviewText,
      date: randomDate()
    });
  }
  
  // Tarihe göre sırala, en yeniler önce
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ReviewsPage = () => {
  const { facilityId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [facilityInfo, setFacilityInfo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    author: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Tesis adını belirle
  const getFacilityName = (id) => {
    switch(id) {
      case 'sporium23': return 'Sporium 23 Halı Saha';
      case 'saha1': return 'Halı Saha 1';
      case 'saha2': return 'Halı Saha 2';
      case 'saha3': return 'Halı Saha 3';
      default: return 'Merkez Spor Tesisi';
    }
  };

  // Ortalama puanı hesapla
  const calculateAverageRating = (reviewsList) => {
    if (reviewsList.length === 0) return 0;
    const sum = reviewsList.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviewsList.length) * 10) / 10;
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      const mockReviews = generateMockReviews(facilityId);
      const averageRating = calculateAverageRating(mockReviews);
      
      setFacilityInfo({
        id: facilityId,
        name: getFacilityName(facilityId),
        address: 'Atatürk Mahallesi, Spor Caddesi No:15',
        averageRating: averageRating,
        totalReviews: mockReviews.length
      });

      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, [facilityId]);

  const handleSubmitReview = () => {
    if (newReview.rating === 0) {
      setSnackbarMessage('Lütfen puanlama yapın.');
      setSnackbarOpen(true);
      return;
    }

    if (!newReview.comment.trim() || newReview.comment.trim().length < 5) {
      setSnackbarMessage('Lütfen en az 5 karakter içeren bir yorum yazın.');
      setSnackbarOpen(true);
      return;
    }

    setSubmitting(true);

    // Yeni yorum oluştur
    const review = {
      id: `rev-${Date.now()}`,
      userId: 'current-user',
      userName: newReview.author || 'Anonim Kullanıcı',
      userImage: 'https://randomuser.me/api/portraits/lego/1.jpg',
      facilityId: facilityId,
      rating: newReview.rating,
      text: newReview.comment,
      date: new Date().toISOString()
    };

    // Yorum gönderme simülasyonu
    setTimeout(() => {
      const updatedReviews = [review, ...reviews];
      setReviews(updatedReviews);
      
      // Ortalama puanı güncelle
      const newAverage = calculateAverageRating(updatedReviews);
      setFacilityInfo(prev => ({
        ...prev,
        averageRating: newAverage,
        totalReviews: updatedReviews.length
      }));

      setNewReview({ rating: 0, comment: '', author: '' });
      setOpenDialog(false);
      setSubmitting(false);
      setSnackbarMessage('Yorumunuz başarıyla eklendi. Teşekkürler!');
      setSnackbarOpen(true);
    }, 1500);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Yorumlar yükleniyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      {/* Tesis Bilgileri */}
      {facilityInfo && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {facilityInfo.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {facilityInfo.address}
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Rating value={facilityInfo.averageRating} readOnly precision={0.1} size="large" />
            <Typography variant="h5" fontWeight="bold">{facilityInfo.averageRating}</Typography>
            <Chip 
              label={`${facilityInfo.totalReviews} değerlendirme`} 
              variant="outlined" 
              size="medium"
              icon={<StarIcon />}
            />
          </Box>
        </Paper>
      )}

      {/* Yorum Ekleme Formu */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
          Değerlendirmenizi Yazın
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="body1">Puanlama:</Typography>
          <Rating
            value={newReview.rating}
            onChange={(event, newValue) => {
              setNewReview(prev => ({ ...prev, rating: newValue }));
            }}
            size="large"
          />
        </Box>
        
        <TextField
          fullWidth
          label="Adınız (isteğe bağlı)"
          value={newReview.author}
          onChange={(e) => setNewReview(prev => ({ ...prev, author: e.target.value }))}
          margin="normal"
          variant="outlined"
        />
        
        <TextField
          fullWidth
          label="Yorumunuz"
          multiline
          rows={4}
          value={newReview.comment}
          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
          margin="normal"
          required
          variant="outlined"
          placeholder="Deneyiminizi paylaşın..."
        />
        
        <Button
          variant="contained"
          onClick={handleSubmitReview}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
          sx={{ mt: 2, borderRadius: 2, py: 1.5 }}
          fullWidth
        >
          {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
        </Button>
      </Paper>

      {/* Yorumlar Başlığı */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Kullanıcı Yorumları ({reviews.length})
        </Typography>
      </Box>

      {/* Değerlendirmeler Listesi */}
      {reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <StarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Bu saha için henüz yorum yapılmamış.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            İlk yorumu siz yapın!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar 
                      src={review.userImage} 
                      sx={{ width: 50, height: 50 }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.date)}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {review.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ReviewsPage; 