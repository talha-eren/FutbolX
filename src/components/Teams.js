import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Avatar, Chip, Grid, Button, Rating, Divider,
  IconButton, LinearProgress, Tooltip, CircularProgress, Alert
} from '@mui/material';
import {
  SportsSoccer, EmojiEvents, Star, Group,
  Timeline, Speed, FitnessCenter, Psychology,
  Bolt, Shield, Public, LocalFireDepartment,
  WhatsApp, Add
} from '@mui/icons-material';
import axios from 'axios';

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

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('rating');

  // Takımları API'den çek
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Config oluştur (token varsa ekle)
        const config = getConfig();
        
        console.log('Takımlar isteği gönderiliyor...');
        
        // API isteği yap
        const response = await axios.get(`${API_URL}/teams`, config || {});
        
        console.log('Takımlar yanıtı alındı');
        console.log(`Bulunan takım sayısı: ${response.data ? response.data.length : 0}`);
        
        if (response.data && response.data.length > 0) {
          console.log('Takım isimleri:', response.data.map(t => t.name));
          
          // Takımları state'e kaydet
          setTeams(response.data);
        } else {
          console.log('API\'den takım bulunamadı veya boş dizi döndü');
          setTeams([]);
          setError('Henüz takım bulunmuyor. Takım ekle butonuna tıklayarak yeni bir takım oluşturabilirsiniz.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Takımlar yüklenirken hata:', error);
        
        // Hata detaylarını logla
        if (error.response) {
          console.error('Sunucu yanıtı:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('İstek yapıldı ancak yanıt alınamadı:', error.request);
        } else {
          console.error('İstek yapılırken hata:', error.message);
        }
        
        // Oturum hatası kontrolü
        if (error.response && error.response.status === 401) {
          setError('Oturumunuz sonlanmış görünüyor. Lütfen tekrar giriş yapın.');
          
          // Token'ı temizle ve kullanıcıyı login sayfasına yönlendir
          localStorage.removeItem('userToken');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userInfo');
          
          // 2 saniye sonra login sayfasına yönlendir
          setTimeout(() => {
            window.location.href = '/login?redirect=/teams';
          }, 2000);
        } else {
          // Genel hata mesajı
          setError('Takım verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.');
          setTeams([]);
        }
        
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, []);

  // Takımları sırala
  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'matches') {
      const aMatches = a.matches?.length || 0;
      const bMatches = b.matches?.length || 0;
      return bMatches - aMatches;
    }
    if (sortBy === 'goals') {
      const aGoals = (a.matchStats?.goalsFor || 0) - (a.matchStats?.goalsAgainst || 0);
      const bGoals = (b.matchStats?.goalsFor || 0) - (b.matchStats?.goalsAgainst || 0);
      return bGoals - aGoals;
    }
    return 0;
  });

  // Takım rengi için varsayılan renk belirle
  const getTeamColor = (team) => {
    // Takım adının ilk harfine göre renk belirle
    const colors = ['#9c27b0', '#d32f2f', '#1976d2', '#2e7d32', '#ff9800', '#795548'];
    const firstLetter = team.name ? team.name.charAt(0).toLowerCase() : 'a';
    const index = firstLetter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Takım logosu için avatar harfini belirle
  const getAvatarLetter = (teamName) => {
    if (!teamName) return 'T';
    return teamName.charAt(0).toUpperCase();
  };

  // Takım istatistiklerini formatla
  const formatTeamStats = (team) => {
    const stats = team.matchStats || {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0
    };
    
    return {
      matches: stats.played,
      wins: stats.won,
      draws: stats.drawn,
      losses: stats.lost,
      goalsScored: stats.goalsFor,
      goalsConceded: stats.goalsAgainst
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#4CAF50' }} />
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
      {/* Başlık ve Açıklama */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          mb: 1, 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Group sx={{ color: '#4CAF50' }} />
          Sporyum 23 Takımları
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Sporyum 23 Halı Saha tesisimizde düzenli olarak maç yapan takımlar ve performans istatistikleri. 
          Yeni rakipler arıyor veya takıma katılmak istiyorsanız iletişime geçebilirsiniz.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={sortBy === 'rating' ? 'contained' : 'outlined'}
              onClick={() => setSortBy('rating')}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                bgcolor: sortBy === 'rating' ? '#4CAF50' : 'transparent',
                '&:hover': { bgcolor: sortBy === 'rating' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
              }}
            >
              Rating'e Göre
            </Button>
            <Button
              variant={sortBy === 'matches' ? 'contained' : 'outlined'}
              onClick={() => setSortBy('matches')}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                bgcolor: sortBy === 'matches' ? '#4CAF50' : 'transparent',
                '&:hover': { bgcolor: sortBy === 'matches' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
              }}
            >
              Maç Sayısına Göre
            </Button>
            <Button
              variant={sortBy === 'goals' ? 'contained' : 'outlined'}
              onClick={() => setSortBy('goals')}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                bgcolor: sortBy === 'goals' ? '#4CAF50' : 'transparent',
                '&:hover': { bgcolor: sortBy === 'goals' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
              }}
            >
              Gol Averajına Göre
            </Button>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => window.location.href = '/teams/create'}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#388E3C' }
            }}
          >
            Takım Ekle
          </Button>
        </Box>
      </Box>

      {/* Takım Kartları */}
      <Grid container spacing={3}>
        {sortedTeams.length > 0 ? (
          sortedTeams.map(team => {
            const teamColor = getTeamColor(team);
            const stats = formatTeamStats(team);
            
            return (
              <Grid item xs={12} md={6} key={team._id || team.id}>
                <Card sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Box sx={{ 
                    bgcolor: teamColor, 
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'white', 
                          color: teamColor, 
                          fontWeight: 'bold',
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        {getAvatarLetter(team.name)}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {team.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating 
                        value={team.rating || 4.5} 
                        readOnly 
                        precision={0.1}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {team.rating?.toFixed(1) || '4.5'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <CardContent>
                    {/* Takım Bilgileri */}
                    <Grid container spacing={2}>
                      {/* Sol Sütun */}
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Seviye
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {team.level || 'Orta'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Oyuncu Sayısı
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {team.currentPlayerCount || team.players?.length || 0}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Oyuncu Arıyor
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {team.neededPlayers > 0 ? `${team.neededPlayers} oyuncu` : 'Hayır'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Sağ Sütun */}
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Maç Günü
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {team.regularPlayDays?.length > 0 ? team.regularPlayDays[0] : 'Belirtilmemiş'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Tercih Edilen Saat
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {team.preferredTime || '20:00'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Konum
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {team.location?.district || 'İstanbul'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Maç İstatistikleri */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <EmojiEvents sx={{ mr: 1, color: teamColor }} />
                        Maç İstatistikleri
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h5" fontWeight="bold" color={teamColor}>
                              {stats.matches}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Maç
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {stats.wins}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Galibiyet
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h5" fontWeight="bold" color="error.main">
                              {stats.losses}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Mağlubiyet
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Gol Atılan:</span>
                          <span>{stats.goalsScored}</span>
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Gol Yenilen:</span>
                          <span>{stats.goalsConceded}</span>
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>Averaj:</span>
                          <span>{stats.goalsScored - stats.goalsConceded}</span>
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Takım Yetenekleri */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Timeline sx={{ mr: 1, color: teamColor }} />
                        Takım Özellikleri
                      </Typography>
                      
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Bolt sx={{ mr: 0.5, fontSize: 16, color: '#ff9800' }} />
                            Hücum
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {team.stats?.attack || 85}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={team.stats?.attack || 85} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(255, 152, 0, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#ff9800'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Shield sx={{ mr: 0.5, fontSize: 16, color: '#2196f3' }} />
                            Defans
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {team.stats?.defense || 80}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={team.stats?.defense || 80} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(33, 150, 243, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#2196f3'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Speed sx={{ mr: 0.5, fontSize: 16, color: '#f44336' }} />
                            Hız
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {team.stats?.speed || 75}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={team.stats?.speed || 75} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(244, 67, 54, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#f44336'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Psychology sx={{ mr: 0.5, fontSize: 16, color: '#9c27b0' }} />
                            Takım Oyunu
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {team.stats?.teamwork || 90}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={team.stats?.teamwork || 90} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(156, 39, 176, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#9c27b0'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* İletişim Butonu */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      {team.contactNumber ? (
                        <Button 
                          variant="contained"
                          href={`https://wa.me/${team.contactNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          startIcon={<WhatsApp />}
                          sx={{ 
                            bgcolor: teamColor,
                            '&:hover': {
                              bgcolor: teamColor,
                              filter: 'brightness(0.9)'
                            },
                            borderRadius: '20px',
                            px: 3
                          }}
                        >
                          WhatsApp ile İletişim
                        </Button>
                      ) : (
                        <Button 
                          variant="contained"
                          onClick={() => alert('Bu takım için iletişim bilgisi bulunmuyor.')}
                          sx={{ 
                            bgcolor: teamColor,
                            '&:hover': {
                              bgcolor: teamColor,
                              filter: 'brightness(0.9)'
                            },
                            borderRadius: '20px',
                            px: 3
                          }}
                        >
                          İletişime Geç
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              Henüz takım bulunmuyor.
            </Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
}

export default Teams;
