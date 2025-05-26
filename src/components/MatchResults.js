import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Card, CardContent,
  Avatar, Chip, Grid, IconButton, Button, Divider,
  Rating, Alert, CircularProgress, Paper, Tabs, Tab, Tooltip,
  List, ListItem, ListItemText
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

// Projenin yeşil rengi
const primaryGreen = '#4caf50';
const secondaryGreen = '#81c784';
const lightGreen = '#e8f5e9';

function MatchResults() {
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [matches, setMatches] = useState([]);
  const [venues, setVenues] = useState([]);
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

  // Veri yükleme
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const config = getConfig();
        if (!config) {
          setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
          setLoading(false);
          return;
        }
        
        // API'den maçları çek
        const matchesResponse = await axios.get(`${API_URL}/matches`, config);
        console.log('Maçlar yanıtı:', matchesResponse.data);
        
        // API'den halı sahaları çek
        const venuesResponse = await axios.get(`${API_URL}/venues`, config);
        console.log('Halı sahalar yanıtı:', venuesResponse.data);
        
        if (matchesResponse.data && matchesResponse.data.matches) {
          // API'den gelen maçları formatlayarak state'e kaydet
          const formattedMatches = matchesResponse.data.matches.map(match => {
            // Takım bilgilerini oluştur ve goals değerini doğru şekilde al
            const teamA = {
              name: match.score?.teamA?.name || 'Formalı Takım',
              score: match.score?.teamA?.goals || 0
            };
            
            const teamB = {
              name: match.score?.teamB?.name || 'Formasız Takım',
              score: match.score?.teamB?.goals || 0
            };
            
            // Maç tarihini formatla
            const matchDate = new Date(match.date);
            const formattedDate = matchDate.toLocaleDateString('tr-TR');
            
            return {
              id: match._id,
              title: match.title || `${teamA.name} vs ${teamB.name}`,
              teamA: teamA,
              teamB: teamB,
              venue: match.venue || {},
              venueName: match.venue?.name || 'Sporyum 23',
              venueId: match.venue?._id || '',
              date: formattedDate,
              time: `${match.startTime} - ${match.endTime}`,
              status: match.status,
              rawDate: new Date(match.date) // Sıralama için ham tarih
            };
          });
          
          // Maçları tarihe göre sırala (en yeni maçlar önce)
          formattedMatches.sort((a, b) => b.rawDate - a.rawDate);
          
          setMatches(formattedMatches);
        } else {
          // API'den veri gelmezse boş dizi kullan
          setMatches([]);
        }
        
        // Halı sahaları kaydet
        if (venuesResponse.data) {
          setVenues(venuesResponse.data);
        } else {
          setVenues([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        
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
          setError('Maç verileri yüklenirken bir hata oluştu.');
        }
        
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtreleme fonksiyonu
  const filterMatches = () => {
    if (selectedVenue === 'all') {
      return matches;
    } else if (selectedVenue === 'halisaha1') {
      // Halı Saha 1 için filtreleme - API'den gelen sahalardan birincisini göster
      // veya isim olarak "Halı Saha 1" geçenleri göster
      return matches.filter(match => 
        (match.venueId && venues.length > 0 && match.venueId === venues[0]._id) || 
        match.venueName?.includes('Halı Saha 1') ||
        match.venueName?.includes('Saha 1')
      );
    } else if (selectedVenue === 'halisaha2') {
      // Halı Saha 2 için filtreleme
      return matches.filter(match => 
        (match.venueId && venues.length > 1 && match.venueId === venues[1]._id) || 
        match.venueName?.includes('Halı Saha 2') ||
        match.venueName?.includes('Saha 2')
      );
    } else if (selectedVenue === 'halisaha3') {
      // Halı Saha 3 için filtreleme
      return matches.filter(match => 
        (match.venueId && venues.length > 2 && match.venueId === venues[2]._id) || 
        match.venueName?.includes('Halı Saha 3') ||
        match.venueName?.includes('Saha 3')
      );
    } else {
      // Diğer venue ID'leri için filtreleme (eski mantık)
      return matches.filter(match => match.venueId === selectedVenue);
    }
  };

  // Takım avatar harfini belirle
  const getAvatarLetter = (teamName) => {
    if (!teamName) return 'T';
    return teamName.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: primaryGreen }} />
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
      {/* Başlık Kısmı */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1, 
          backgroundColor: primaryGreen,
          p: 2,
          borderRadius: 1,
          color: 'white'
        }}>
          <SportsSoccer sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Sporyum 23
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3, pl: 1 }}>
          Son Oynanan Maçlar
        </Typography>
      </Box>
      
      {/* Halı Saha Filtreleme */}
      <Box sx={{ mb: 3, pl: 1 }}>
        <Button 
          variant={selectedVenue === 'all' ? "contained" : "outlined"} 
          color="success"
          onClick={() => setSelectedVenue('all')}
          sx={{ 
            borderRadius: 4,
            mr: 1,
            bgcolor: selectedVenue === 'all' ? primaryGreen : 'transparent',
            '&:hover': {
              bgcolor: selectedVenue === 'all' ? primaryGreen : lightGreen
            }
          }}
          startIcon={<SportsSoccer />}
        >
          Tüm Halı Sahalar
        </Button>
        
        {/* Sabit halı saha seçenekleri */}
        <Button 
          variant={selectedVenue === 'halisaha1' ? "contained" : "outlined"} 
          color="success"
          onClick={() => setSelectedVenue('halisaha1')}
          sx={{ 
            borderRadius: 4,
            mr: 1,
            mb: 1,
            bgcolor: selectedVenue === 'halisaha1' ? primaryGreen : 'transparent',
            '&:hover': {
              bgcolor: selectedVenue === 'halisaha1' ? primaryGreen : lightGreen
            }
          }}
          startIcon={<Place />}
        >
          Halı Saha 1
        </Button>
        
        <Button 
          variant={selectedVenue === 'halisaha2' ? "contained" : "outlined"} 
          color="success"
          onClick={() => setSelectedVenue('halisaha2')}
          sx={{ 
            borderRadius: 4,
            mr: 1,
            mb: 1,
            bgcolor: selectedVenue === 'halisaha2' ? primaryGreen : 'transparent',
            '&:hover': {
              bgcolor: selectedVenue === 'halisaha2' ? primaryGreen : lightGreen
            }
          }}
          startIcon={<Place />}
        >
          Halı Saha 2
        </Button>
        
        <Button 
          variant={selectedVenue === 'halisaha3' ? "contained" : "outlined"} 
          color="success"
          onClick={() => setSelectedVenue('halisaha3')}
          sx={{ 
            borderRadius: 4,
            mr: 1,
            mb: 1,
            bgcolor: selectedVenue === 'halisaha3' ? primaryGreen : 'transparent',
            '&:hover': {
              bgcolor: selectedVenue === 'halisaha3' ? primaryGreen : lightGreen
            }
          }}
          startIcon={<Place />}
        >
          Halı Saha 3
        </Button>
      </Box>

      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : (
        <Box>
          {filterMatches().map((match) => (
            <Paper 
              key={match.id}
              elevation={1} 
              sx={{ 
                borderRadius: 0, 
                overflow: 'hidden',
                mb: 2,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
                }
              }}
            >
              {/* Maç Başlığı */}
              <Box sx={{ 
                bgcolor: primaryGreen, 
                color: 'white', 
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {match.title}
                </Typography>
              </Box>
              
              {/* Maç Detayları */}
              <Box sx={{ p: 2 }}>
                {/* Tarih, Saat ve Yer */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonth fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {match.date}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {match.time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <Place fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {match.venueName}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Takımlar ve Skor */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  bgcolor: lightGreen,
                  p: 2,
                  borderRadius: 0
                }}>
                  {/* Takım A */}
                  <Box sx={{ textAlign: 'center', width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: primaryGreen, 
                        width: 45, 
                        height: 45, 
                        fontSize: 20,
                        mr: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {getAvatarLetter(match.teamA.name)}
                    </Avatar>
                    <Typography variant="body1" fontWeight="bold">
                      {match.teamA.name}
                    </Typography>
                  </Box>
                  
                  {/* Skor */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      Maç Skoru
                    </Typography>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      border: `2px solid ${primaryGreen}`,
                      borderRadius: 1,
                      px: 3,
                      py: 1,
                      minWidth: 100,
                      textAlign: 'center',
                      boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
                    }}>
                      <Typography 
                        variant="h4" 
                        fontWeight="bold" 
                        color={primaryGreen}
                        sx={{ letterSpacing: 1 }}
                      >
                        {match.teamA.score} - {match.teamB.score}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Takım B */}
                  <Box sx={{ textAlign: 'center', width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body1" fontWeight="bold" sx={{ mr: 2 }}>
                      {match.teamB.name}
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#d32f2f', 
                        width: 45, 
                        height: 45, 
                        fontSize: 20,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {getAvatarLetter(match.teamB.name)}
                    </Avatar>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
      
      {filterMatches().length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Bu halı sahada henüz maç bulunmuyor.
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default MatchResults;
