import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Paper, Tabs, Tab, Card, CardMedia, CardContent, Avatar, Button } from '@mui/material';
import { SportsSoccer, LocationOn, Star, EmojiEvents, Person } from '@mui/icons-material';
import VideoFeed from './Feed/VideoFeed';
import { useTranslation } from 'react-i18next';

function Feed() {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Örnek futbolcu verileri
  const players = [
    { id: 1, name: 'Mehmet Yılmaz', position: 'Forvet', rating: 4.8, matches: 24, goals: 18, image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Ali Kaya', position: 'Orta Saha', rating: 4.5, matches: 30, goals: 12, image: 'https://randomuser.me/api/portraits/men/55.jpg' },
    { id: 3, name: 'Ahmet Demir', position: 'Defans', rating: 4.7, matches: 28, goals: 3, image: 'https://randomuser.me/api/portraits/men/68.jpg' },
    { id: 4, name: 'Burak Şahin', position: 'Kaleci', rating: 4.9, matches: 22, goals: 0, image: 'https://randomuser.me/api/portraits/men/41.jpg' },
  ];
  
  // Örnek halı saha verileri
  const venues = [
    { id: 1, name: 'Yeşil Vadi Halı Saha', location: 'Kadıköy', rating: 4.6, price: '250 TL/saat', image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { id: 2, name: 'Gol Stadyumu', location: 'Beşiktaş', rating: 4.8, price: '300 TL/saat', image: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { id: 3, name: 'Futbol Arena', location: 'Şişli', rating: 4.5, price: '280 TL/saat', image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { id: 4, name: 'Yıldız Sahası', location: 'Ümraniye', rating: 4.4, price: '220 TL/saat', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Sol Sütun - Futbolcu Keşfet */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>{t('feed.players')}</Typography>
            {players.map(player => (
              <Card key={player.id} sx={{ mb: 2, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
                <Avatar src={player.image} alt={player.name} sx={{ width: 70, height: 70, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{player.name}</Typography>
                <Typography variant="body2" color="text.secondary">{player.position}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Star sx={{ fontSize: 18, color: '#FFD700', mr: 0.5 }} />
                  <Typography variant="body2">{player.rating}</Typography>
                </Box>
                <Button variant="contained" size="small" sx={{ mt: 1, fontWeight: 'bold', fontSize: 15, px: 2 }}>
                  {t('feed.viewProfile')}
                </Button>
              </Card>
            ))}
          </Grid>

          {/* Orta Sütun - Video Feed */}
          <Grid item xs={12} md={6}>
            <VideoFeed />
          </Grid>

          {/* Sağ Sütun - Halı Saha Keşfet */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>{t('feed.venues')}</Typography>
            {venues.map(venue => (
              <Card key={venue.id} sx={{ mb: 2, boxShadow: 2 }}>
                <CardMedia component="img" height="90" image={venue.image} alt={venue.name} />
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{venue.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{venue.location}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Star sx={{ fontSize: 18, color: '#FFD700', mr: 0.5 }} />
                    <Typography variant="body2">{venue.rating}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{venue.price}</Typography>
                  <Button variant="contained" size="small" sx={{ mt: 1, fontWeight: 'bold', fontSize: 15, px: 2 }}>
                    {t('feed.bookNow')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Feed;
