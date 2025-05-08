import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Card, CardContent,
  Avatar, Chip, Grid, IconButton, Button, Divider,
  Rating, Alert, CircularProgress
} from '@mui/material';
import {
  SportsSoccer, EmojiEvents, Star, Place,
  ThumbUp, Comment, Share, CalendarToday
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
    const venue = ['Yıldız Halı Saha', 'Gol Park', 'Futbol Arena', 'Yeşil Vadi'][Math.floor(Math.random() * 4)];
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
  const [matches, setMatches] = useState(generateRandomMatches());
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
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

  const filteredMatches = matches.filter(match => {
    if (filter === 'high-scoring') return match.totalGoals >= 5;
    if (filter === 'recent') return new Date(match.date) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return true;
  });

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
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* Başlık ve Filtreler */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <SportsSoccer sx={{ color: '#4CAF50' }} />
          Maç Sonuçları
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              bgcolor: filter === 'all' ? '#4CAF50' : 'transparent',
              '&:hover': { bgcolor: filter === 'all' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
            }}
          >
            Tümü
          </Button>
          <Button
            variant={filter === 'high-scoring' ? 'contained' : 'outlined'}
            onClick={() => setFilter('high-scoring')}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              bgcolor: filter === 'high-scoring' ? '#4CAF50' : 'transparent',
              '&:hover': { bgcolor: filter === 'high-scoring' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
            }}
          >
            Gollü Maçlar
          </Button>
          <Button
            variant={filter === 'recent' ? 'contained' : 'outlined'}
            onClick={() => setFilter('recent')}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              bgcolor: filter === 'recent' ? '#4CAF50' : 'transparent',
              '&:hover': { bgcolor: filter === 'recent' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
            }}
          >
            Son Maçlar
          </Button>
        </Box>
      </Box>

      {/* Maç Kartları */}
      <Grid container spacing={3}>
        {filteredMatches.map(match => (
          <Grid item xs={12} md={6} key={match.id}>
            <Card sx={{ 
              borderRadius: 3,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}>
              <CardContent>
                {/* Maç Detayları */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ color: '#666', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {match.date} - {match.time}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Place sx={{ color: '#666', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {match.venue}
                  </Typography>
                </Box>

                {/* Skor */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  borderRadius: 2,
                  p: 2,
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: match.homeTeam.color }}>
                      {match.homeTeam.name[0]}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {match.homeTeam.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {match.homeScore} - {match.awayScore}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {match.awayTeam.name}
                    </Typography>
                    <Avatar sx={{ bgcolor: match.awayTeam.color }}>
                      {match.awayTeam.name[0]}
                    </Avatar>
                  </Box>
                </Box>

                {/* Maç İstatistikleri */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip 
                    icon={<EmojiEvents sx={{ color: '#FFD700' }} />}
                    label={`Maçın Yıldızı: ${match.manOfTheMatch}`}
                    sx={{ 
                      bgcolor: 'rgba(255, 215, 0, 0.1)',
                      '& .MuiChip-label': { color: '#B7950B' }
                    }}
                  />
                  <Chip 
                    icon={<SportsSoccer />}
                    label={`${match.totalGoals} Gol`}
                    sx={{ 
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      '& .MuiChip-label': { color: '#388E3C' }
                    }}
                  />
                  <Chip 
                    icon={<Star sx={{ color: '#FFA000' }} />}
                    label={`${match.highlights} Öne Çıkan`}
                    sx={{ 
                      bgcolor: 'rgba(255, 160, 0, 0.1)',
                      '& .MuiChip-label': { color: '#FFA000' }
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Etkileşim Butonları */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <ThumbUp />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {match.likes}
                    </Typography>
                    <IconButton size="small">
                      <Comment />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {match.comments}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <Share />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Daha Fazla Maç Butonu */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setMatches(generateRandomMatches())}
          sx={{ 
            borderRadius: '20px',
            textTransform: 'none',
            px: 4
          }}
        >
          Daha Fazla Maç
        </Button>
      </Box>
    </Container>
  );
}

export default MatchResults;
