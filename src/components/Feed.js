import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Paper, Tabs, Tab, Card, CardMedia, CardContent, Avatar, Button, CircularProgress, Alert, Divider, Chip, Rating } from '@mui/material';
import { SportsSoccer, LocationOn, Star, EmojiEvents, Person, AccessTime } from '@mui/icons-material';
import VideoFeed from './Feed/VideoFeed';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function Feed() {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();
  const [players, setPlayers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // API'den verileri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Paralel olarak her iki isteği de yolla
        const [playersRes, venuesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/players'),
          axios.get('http://localhost:5000/api/venues')
        ]);
        
        setPlayers(playersRes.data);
        setVenues(venuesRes.data);
        setError(null);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu');
        
        // API'den veri çekemediyse örnek veriler kullan
        setPlayers([
          { id: 1, name: 'Erling Haaland', position: 'Forvet', rating: 4.8, matches: 24, goals: 18, image: 'https://img.a.transfermarkt.technology/portrait/big/418560-1695021323.jpg' },
          { id: 2, name: 'Kevin De Bruyne', position: 'Orta Saha', rating: 4.7, matches: 30, goals: 12, image: 'https://img.a.transfermarkt.technology/portrait/big/88755-1695021291.jpg' },
          { id: 3, name: 'Virgil van Dijk', position: 'Defans', rating: 4.6, matches: 28, goals: 3, image: 'https://img.a.transfermarkt.technology/portrait/big/139208-1692877595.jpg' },
          { id: 4, name: 'Alisson Becker', position: 'Kaleci', rating: 4.9, matches: 22, goals: 0, image: 'https://img.a.transfermarkt.technology/portrait/big/105470-1692877790.jpg' },
          { id: 5, name: 'Jude Bellingham', position: 'Orta Saha', rating: 4.7, matches: 26, goals: 10, image: 'https://img.a.transfermarkt.technology/portrait/big/581678-1694590326.jpg' },
          { id: 6, name: 'Kylian Mbappé', position: 'Forvet', rating: 4.9, matches: 32, goals: 28, image: 'https://img.a.transfermarkt.technology/portrait/big/342229-1694590409.jpg' },
          { id: 7, name: 'Rodri', position: 'Orta Saha', rating: 4.6, matches: 29, goals: 5, image: 'https://img.a.transfermarkt.technology/portrait/big/357565-1695021243.jpg' },
          { id: 8, name: 'Vinicius Jr.', position: 'Forvet', rating: 4.8, matches: 30, goals: 16, image: 'https://img.a.transfermarkt.technology/portrait/big/371998-1694590349.jpg' },
        ]);
        
        setVenues([
          { id: 1, name: 'FutbolX Merkez', location: 'İstanbul, Kadıköy', rating: 4.5, price: '250 TL/saat', image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', facilities: ['Duş', 'Soyunma Odası', 'Otopark'] },
          { id: 2, name: 'FutbolX Arena', location: 'İstanbul, Beşiktaş', rating: 4.3, price: '300 TL/saat', image: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', facilities: ['Duş', 'Kafeterya', 'Otopark', 'Soyunma Odası'] },
          { id: 3, name: 'Gol Stadyumu', location: 'İstanbul, Şişli', rating: 4.8, price: '280 TL/saat', image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', facilities: ['Duş', 'Soyunma Odası', 'Wi-Fi'] },
          { id: 4, name: 'Yıldız Sahası', location: 'İstanbul, Ümraniye', rating: 4.4, price: '220 TL/saat', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', facilities: ['Duş', 'Otopark'] },
          { id: 5, name: 'Futbol Akademi', location: 'İstanbul, Maltepe', rating: 4.6, price: '260 TL/saat', image: 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80', facilities: ['Duş', 'Soyunma Odası', 'Kafeterya', 'Otopark'] },
          { id: 6, name: 'Spor Vadisi', location: 'İstanbul, Kartal', rating: 4.2, price: '230 TL/saat', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80', facilities: ['Duş', 'Soyunma Odası'] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Sol Sütun - Futbolcu Keşfet */}
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              backgroundColor: '#f8f9fa', 
              p: 2, 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 2
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  borderBottom: '2px solid #4CAF50',
                  pb: 1,
                  color: '#2E7D32'
                }}
              >
                <SportsSoccer sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('feed.players')}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress color="success" />
                </Box>
              ) : error ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : players.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Henüz futbolcu kaydı bulunmuyor.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {players.map(player => (
                    <Card 
                      key={player._id || player.id} 
                      sx={{ 
                        display: 'flex',
                        height: '80px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.12)'
                        },
                        overflow: 'hidden',
                        borderRadius: 1.5
                      }}
                    >
                      <Box sx={{ position: 'relative', width: '80px', flexShrink: 0 }}>
                        <Avatar 
                          src={player.image.startsWith('http') ? player.image : `http://localhost:5000${player.image}`} 
                          alt={player.name} 
                          sx={{ 
                            width: '100%',
                            height: '100%',
                            borderRadius: 0
                          }} 
                        />
                        <Chip 
                          label={player.position} 
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 3, 
                            right: 3,
                            height: '18px',
                            fontSize: '0.6rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, justifyContent: 'space-between', width: '100%' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                            {player.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.3 }}>
                            <Rating 
                              value={player.rating / 5 * 5} 
                              readOnly 
                              precision={0.1}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem' }}>
                              ({player.rating})
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SportsSoccer sx={{ fontSize: 14, mr: 0.3, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {player.matches} Maç
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmojiEvents sx={{ fontSize: 14, mr: 0.3, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {player.goals} Gol
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Orta Sütun - Video Feed */}
          <Grid item xs={12} md={6}>
            <VideoFeed />
          </Grid>

          {/* Sağ Sütun - Halı Saha Keşfet */}
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              backgroundColor: '#f8f9fa', 
              p: 2, 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 2
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  borderBottom: '2px solid #2196F3',
                  pb: 1,
                  color: '#0D47A1'
                }}
              >
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('feed.venues')}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : error ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : venues.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Henüz halı saha kaydı bulunmuyor.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {venues.map(venue => (
                    <Card 
                      key={venue._id || venue.id} 
                      sx={{ 
                        display: 'flex',
                        height: '80px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.12)'
                        },
                        overflow: 'hidden',
                        borderRadius: 1.5
                      }}
                    >
                      <CardMedia 
                        component="img" 
                        sx={{ 
                          width: '80px',
                          flexShrink: 0,
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        image={venue.image.startsWith('http') ? venue.image : `http://localhost:5000${venue.image}`} 
                        alt={venue.name}
                      />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, justifyContent: 'space-between', width: '100%' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                            {venue.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.3 }}>
                            <LocationOn sx={{ fontSize: 14, color: '#2196F3', mr: 0.3 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {venue.location}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating 
                              value={venue.rating / 5 * 5} 
                              readOnly 
                              precision={0.1}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem' }}>
                              ({venue.rating})
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="primary" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                            {venue.price}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Feed;
