import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fade,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  SportsSoccer as SportsIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Group as GroupIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const PlayerMatcher = ({ open, onClose, userPosition, userLocation }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const [error, setError] = useState('');
  const [searchProgress, setSearchProgress] = useState(0);

  // Pozisyon bazlı takım ihtiyaçları
  const getTeamNeeds = (userPosition) => {
    const teamFormation = {
      'Kaleci': {
        needed: ['Defans', 'Defans', 'Orta Saha', 'Orta Saha', 'Forvet'],
        message: 'Kaleci olarak sizin için ideal bir takım oluşturuluyor...'
      },
      'Defans': {
        needed: ['Kaleci', 'Defans', 'Orta Saha', 'Orta Saha', 'Forvet'],
        message: 'Defans oyuncusu olarak sizin için uygun takım arkadaşları aranıyor...'
      },
      'Orta Saha': {
        needed: ['Kaleci', 'Defans', 'Defans', 'Orta Saha', 'Forvet'],
        message: 'Orta saha oyuncusu olarak sizin için ideal takım kurgusu hazırlanıyor...'
      },
      'Forvet': {
        needed: ['Kaleci', 'Defans', 'Defans', 'Orta Saha', 'Orta Saha'],
        message: 'Forvet olarak sizin için mükemmel bir takım oluşturuluyor...'
      }
    };

    return teamFormation[userPosition] || {
      needed: ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'],
      message: 'Sizin için uygun takım arkadaşları aranıyor...'
    };
  };

  const searchPlayers = async () => {
    if (!userPosition) {
      setError('Önce profilinizde pozisyonunuzu belirtmelisiniz.');
      return;
    }

    setLoading(true);
    setError('');
    setStep(1);
    setSearchProgress(0);

    try {
      const teamNeeds = getTeamNeeds(userPosition);
      
      // Arama animasyonu
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/auth/players', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const allPlayers = await response.json();
        
        // Kullanıcının kendisini filtrele
        const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const otherPlayers = allPlayers.filter(player => player.username !== currentUser.username);
        
        // Pozisyon bazlı eşleştirme
        const matchedByPosition = {};
        
        teamNeeds.needed.forEach(position => {
          if (!matchedByPosition[position]) {
            matchedByPosition[position] = [];
          }
          
          const playersInPosition = otherPlayers.filter(player => player.position === position);
          
          // Lokasyon bazlı öncelik (aynı şehirdekileri öne çıkar)
          if (userLocation) {
            playersInPosition.sort((a, b) => {
              const aLocationMatch = a.location && a.location.toLowerCase().includes(userLocation.toLowerCase());
              const bLocationMatch = b.location && b.location.toLowerCase().includes(userLocation.toLowerCase());
              
              if (aLocationMatch && !bLocationMatch) return -1;
              if (!aLocationMatch && bLocationMatch) return 1;
              return 0;
            });
          }
          
          matchedByPosition[position] = playersInPosition.slice(0, 3); // Her pozisyon için en fazla 3 oyuncu
        });

        clearInterval(progressInterval);
        setSearchProgress(100);
        
        setTimeout(() => {
          setMatchedPlayers(matchedByPosition);
          setStep(2);
          setLoading(false);
        }, 500);

      } else {
        setError('Oyuncular yüklenirken hata oluştu');
        setLoading(false);
      }
    } catch (error) {
      console.error('Oyuncu eşleştirme hatası:', error);
      setError('Bağlantı hatası');
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    const colors = {
      'Kaleci': '#FF5722',
      'Defans': '#2196F3',
      'Orta Saha': '#4CAF50',
      'Forvet': '#FF9800'
    };
    return colors[position] || '#757575';
  };

  const getPositionIcon = (position) => {
    return <SportsIcon />;
  };

  const handleContactPlayer = (player) => {
    if (player.phone) {
      // WhatsApp entegrasyonu - Türkiye için +90 ekleme
      let phoneNumber = player.phone.replace(/\s+/g, ''); // Boşlukları kaldır
      
      // Eğer numara 0 ile başlıyorsa, 0'ı kaldır ve +90 ekle
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '90' + phoneNumber.substring(1);
      }
      // Eğer +90 ile başlamıyorsa ve 90 ile de başlamıyorsa, +90 ekle
      else if (!phoneNumber.startsWith('90') && !phoneNumber.startsWith('+90')) {
        phoneNumber = '90' + phoneNumber;
      }
      // Eğer +90 ile başlıyorsa, + işaretini kaldır
      else if (phoneNumber.startsWith('+90')) {
        phoneNumber = phoneNumber.substring(1);
      }
      
      // WhatsApp mesaj metni
      const message = encodeURIComponent(
        `Merhaba ${player.firstName}! 👋\n\n` +
        `FutbolX uygulaması üzerinden sizinle eşleştik. ` +
        `Pozisyonunuz: ${player.position}\n\n` +
        `Birlikte futbol oynamak için iletişime geçmek istedim. ⚽\n\n` +
        `FutbolX ile güzel maçlar! 🏆`
      );
      
      // WhatsApp URL'si oluştur
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      
      // Yeni sekmede WhatsApp'ı aç
      window.open(whatsappUrl, '_blank');
    } else if (player.email) {
      // E-posta alternatifi
      const subject = encodeURIComponent('FutbolX - Takım Arkadaşı Teklifi');
      const body = encodeURIComponent(
        `Merhaba ${player.firstName},\n\n` +
        `FutbolX uygulaması üzerinden sizinle eşleştik. ` +
        `Pozisyonunuz: ${player.position}\n\n` +
        `Birlikte futbol oynamak için iletişime geçmek istedim.\n\n` +
        `İyi maçlar!\n\n` +
        `FutbolX ile`
      );
      window.open(`mailto:${player.email}?subject=${subject}&body=${body}`);
    }
  };

  const resetMatcher = () => {
    setStep(0);
    setMatchedPlayers([]);
    setError('');
    setSearchProgress(0);
    setLoading(false);
  };

  const handleClose = () => {
    resetMatcher();
    onClose();
  };

  const renderStep0 = () => (
    <Box textAlign="center" py={4}>
      <GroupIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom fontWeight="bold">
        🏆 Takım Arkadaşı Bul
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Pozisyonunuza uygun ideal takım arkadaşlarını bulun ve iletişime geçin
      </Typography>
      
      {userPosition ? (
        <Box>
          <Chip
            icon={getPositionIcon(userPosition)}
            label={`Pozisyonunuz: ${userPosition}`}
            sx={{ 
              bgcolor: getPositionColor(userPosition),
              color: 'white',
              mb: 3,
              fontSize: '1rem',
              py: 2
            }}
          />
          <Typography variant="body2" color="text.secondary" mb={3}>
            {getTeamNeeds(userPosition).message}
          </Typography>
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Eşleştirme yapabilmek için önce profilinizde pozisyonunuzu belirtmelisiniz.
        </Alert>
      )}
    </Box>
  );

  const renderStep1 = () => (
    <Box textAlign="center" py={4}>
      <SearchIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        🔍 Size uygun takım arkadaşları bulunuyor...
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Pozisyonunuza göre ideal oyuncular aranıyor
      </Typography>
      
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={searchProgress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        %{searchProgress} tamamlandı
      </Typography>
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Box textAlign="center" mb={3}>
        <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom color="success.main">
          ✨ Harika! Size uygun takım arkadaşları bulundu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aşağıdaki oyuncularla iletişime geçerek takımınızı oluşturabilirsiniz
        </Typography>
      </Box>

      {Object.entries(matchedPlayers).map(([position, players]) => (
        players.length > 0 && (
          <Box key={position} mb={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                icon={getPositionIcon(position)}
                label={position}
                size="small"
                sx={{ 
                  bgcolor: getPositionColor(position),
                  color: 'white',
                  mr: 2
                }}
              />
              ({players.length} oyuncu)
            </Typography>
            
            <Grid container spacing={2}>
              {players.map((player) => (
                <Grid item xs={12} key={player._id}>
                  <Card 
                    sx={{ 
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              mr: 2,
                              bgcolor: getPositionColor(player.position)
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {player.firstName} {player.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              @{player.username}
                            </Typography>
                            {player.location && (
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <LocationIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {player.location}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        
                        <Box textAlign="right">
                          <Chip
                            icon={<StarIcon />}
                            label={player.footballExperience || 'Başlangıç'}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Box>
                            {player.phone ? (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleContactPlayer(player)}
                                sx={{
                                  bgcolor: '#25D366', // WhatsApp yeşili
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: '#128C7E'
                                  }
                                }}
                                startIcon={
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                  </svg>
                                }
                              >
                                WhatsApp
                              </Button>
                            ) : player.email ? (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleContactPlayer(player)}
                                startIcon={<EmailIcon />}
                              >
                                E-posta
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                disabled
                              >
                                İletişim Yok
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      {player.bio && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mt: 2 }}
                        >
                          {player.bio}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      ))}

      {Object.values(matchedPlayers).every(players => players.length === 0) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Şu anda sizin pozisyonunuza uygun aktif oyuncu bulunamadı. Daha sonra tekrar deneyin.
        </Alert>
      )}
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '500px' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            🤝 Takım Arkadaşı Eşleştirme
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Fade in={true} timeout={500}>
          <Box>
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </Box>
        </Fade>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {step === 0 && (
          <Button
            variant="contained"
            onClick={searchPlayers}
            disabled={!userPosition || loading}
            size="large"
            sx={{ minWidth: 200 }}
          >
            {loading ? <CircularProgress size={24} /> : '🔍 Takım Arkadaşı Bul'}
          </Button>
        )}
        
        {step === 2 && (
          <Button
            variant="outlined"
            onClick={resetMatcher}
            size="large"
          >
            🔄 Yeniden Ara
          </Button>
        )}
        
        <Button onClick={handleClose} size="large">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerMatcher; 