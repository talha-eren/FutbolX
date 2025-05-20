import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Card, CardContent,
  Avatar, Chip, Grid, IconButton, Button, Divider,
  Rating, Alert, CircularProgress, Paper, Tabs, Tab, Tooltip
} from '@mui/material';
import {
  SportsSoccer, EmojiEvents, Star, Place,
  ThumbUp, Comment, Share, CalendarToday, Today,
  CalendarMonth, AccessTime, ArrowForward
} from '@mui/icons-material';

// API URL
const API_URL = 'http://localhost:5000/api';

// Token'ı localStorage'dan al
const getToken = () => {
  return localStorage.getItem('userToken');
};

// API isteği için config oluştur
const getConfig = () => {
  const token = getToken();
  if (!token) {
    console.error('Token bulunamadı');
    return null;
  }
  
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
};

const generateRandomMatches = () => {
  const teams = [
    { name: 'Yıldızlar', color: '#1976d2' },
    { name: 'Kartallar', color: '#d32f2f' },
    { name: 'Aslanlar', color: '#ff9800' },
    { name: 'Şimşekler', color: '#9c27b0' },
    { name: 'Boğalar', color: '#2e7d32' },
    { name: 'Atmacalar', color: '#795548' }
  ];

  return Array.from({ length: 6 }, () => {
    const homeTeam = teams[Math.floor(Math.random() * teams.length)];
    let awayTeam;
    do {
      awayTeam = teams[Math.floor(Math.random() * teams.length)];
    } while (awayTeam === homeTeam);

    const homeScore = Math.floor(Math.random() * 6);
    const awayScore = Math.floor(Math.random() * 6);
    const totalGoals = homeScore + awayScore;
    const manOfTheMatch = ['Ahmet', 'Mehmet', 'Ali', 'Can', 'Burak'][Math.floor(Math.random() * 5)];
    const venue = ['Yıldız Halı Saha', 'Gol Park', 'Futbol Arena', 'Sporyum 23'][Math.floor(Math.random() * 4)];
    const highlights = Math.floor(Math.random() * 8) + 2;
    const likes = Math.floor(Math.random() * 50) + 10;
    const comments = Math.floor(Math.random() * 20) + 5;

    return {
      id: Math.random().toString(36).substr(2, 9),
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      manOfTheMatch,
      venue,
      totalGoals,
      highlights,
      likes,
      comments,
      date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      time: `${Math.floor(Math.random() * 12 + 10)}:00`
    };
  });
};

function MatchResults() {
  const [tabValue, setTabValue] = useState(0);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Kullanıcı verilerini çek
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login?redirect=/matches';
        }, 2000);
        return;
      }
      
      console.log('Profil isteği gönderiliyor, config:', config);
      const response = await axios.get(`${API_URL}/auth/profile`, config);
      console.log('Profil yanıtı:', response.data);
      
      setUserData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Kullanıcı verileri çekilirken hata oluştu:', error);
      
      if (error.response && error.response.status === 401) {
        setError('Oturumunuz sonlanmış görünüyor. Lütfen tekrar giriş yapın.');
        // Token'ı temizle ve kullanıcıyı login sayfasına yönlendir
        localStorage.removeItem('userToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login?redirect=/matches';
        }, 2000);
      } else {
        setError('Kullanıcı verileri yüklenirken bir hata oluştu.');
      }
      
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde kullanıcı verilerini çek
  useEffect(() => {
    fetchUserData();
  }, []);

  // Veri yükleme simülasyonu
  useEffect(() => {
    const loadData = async () => {
      try {
        // API çağrısı burada yapılacak
        // const response = await fetch('api/matches/yesilVadi');
        // const data = await response.json();
        
        // Şimdilik mock veri kullanıyoruz
        setTimeout(() => {
          setMatches(generateRandomMatches());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filtreleme fonksiyonları
  const filterMatches = () => {
    switch (tabValue) {
      case 0: // Tümü
        return matches;
      case 1: // Gollü Maçlar (3+ gol)
        return matches.filter(match => match.totalGoals >= 3);
      case 2: // Son Maçlar (son 3 maç)
        return matches.slice(0, 3);
      default:
        return matches;
    }
  };

  const getTeamBgColor = (color) => {
    switch (color) {
      case 'red': return '#e53935';
      case 'blue': return '#1e88e5';
      case 'green': return '#43a047';
      case 'orange': return '#fb8c00';
      case 'purple': return '#8e24aa';
      default: return '#757575';
    }
  };

  // Profil güncellemesi işlemi
  const handleSaveProfile = async (profileData) => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      console.log('Gönderilen profil verileri:', profileData);
      
      // API'ye gönder
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        profileData,
        config
      );
      
      console.log('Profil güncelleme yanıtı:', response.data);
      setUserData(response.data);
      setLoading(false);
      
      return true;
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      
      if (error.response && error.response.status === 401) {
        setError('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
        
        // Token'ı temizle ve kullanıcıyı login sayfasına yönlendir
        localStorage.removeItem('userToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login?redirect=/matches';
        }, 2000);
      } else {
        setError('Profil güncellenirken bir hata oluştu.');
      }
      
      setLoading(false);
      return false;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SportsSoccer sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
            Sporyum 23
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Son Oynanan Maçlar
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label="Tümü" 
              icon={<SportsSoccer />} 
              iconPosition="start" 
              sx={{ 
                minHeight: 48, 
                textTransform: 'none',
                fontWeight: 'medium'
              }} 
            />
            <Tab 
              label="Gollü Maçlar" 
              icon={<SportsSoccer />} 
              iconPosition="start" 
              sx={{ 
                minHeight: 48, 
                textTransform: 'none',
                fontWeight: 'medium'
              }} 
            />
            <Tab 
              label="Son Maçlar" 
              icon={<Today />} 
              iconPosition="start" 
              sx={{ 
                minHeight: 48, 
                textTransform: 'none',
                fontWeight: 'medium'
              }} 
            />
          </Tabs>
        </Box>
      </Box>

      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : (
        <Grid container spacing={3}>
          {filterMatches().map((match) => (
            <Grid item xs={12} md={6} key={match.id}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {/* Tarih ve Yer Bilgisi */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" sx={{ mr: 1 }}>{match.date}</Typography>
                    <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{match.time}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Place fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Sporyum 23</Typography>
                  </Box>
                </Box>
                
                {/* Takımlar ve Skor */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  {/* Takım A */}
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getTeamBgColor(match.homeTeam.color),
                        color: 'white',
                        fontWeight: 'bold',
                        width: 40,
                        height: 40,
                        mr: 1
                      }}
                    >
                      {match.homeTeam.name[0]}
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">{match.homeTeam.name}</Typography>
                  </Box>
                  
                  {/* Skor */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.04)',
                    minWidth: 80
                  }}>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                      {match.homeScore} - {match.awayScore}
                    </Typography>
                  </Box>
                  
                  {/* Takım B */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                    <Typography variant="body1" fontWeight="medium" sx={{ mr: 1 }}>{match.awayTeam.name}</Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: getTeamBgColor(match.awayTeam.color),
                        color: 'white',
                        fontWeight: 'bold',
                        width: 40,
                        height: 40
                      }}
                    >
                      {match.awayTeam.name[0]}
                    </Avatar>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Maç Bilgileri */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Tooltip title="Maçın Yıldızı">
                      <EmojiEvents fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    </Tooltip>
                    <Typography variant="body2">
                      <strong>MVP:</strong> {match.manOfTheMatch}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Tooltip title="Toplam Gol">
                      <SportsSoccer fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    </Tooltip>
                    <Typography variant="body2">
                      <strong>Toplam Gol:</strong> {match.totalGoals}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Etkileşim Düğmeleri */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      startIcon={<ThumbUp />} 
                      variant="text" 
                      color="primary"
                    >
                      {match.likes}
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<Comment />} 
                      variant="text" 
                      color="primary"
                    >
                      {match.comments}
                    </Button>
                  </Box>
                  
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />} 
                    color="primary"
                    variant="text"
                  >
                    Detaylar
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MatchResults;
