import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Paper, Tabs, Tab, Card, CardMedia, CardContent, Avatar, Button, CircularProgress, Alert, Divider, Chip, Rating } from '@mui/material';
import { SportsSoccer, LocationOn, Star, EmojiEvents, Person, AccessTime, EventAvailable, MonetizationOn, Bolt, Speed, CheckCircle, LocalParking, Shower, Restaurant, Wifi, Groups } from '@mui/icons-material';
import VideoFeed from './Feed/VideoFeed';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format, addDays } from 'date-fns';

// Sporyum 23 halı saha bilgileri
const SPORYUM_23 = {
  id: 'sporyum23',
  name: 'Sporyum 23',
  location: 'Ümraniye, İstanbul',
  address: 'Saray Mah. Ahmet Tevfik İleri Cad. No:23, 34768 Ümraniye/İstanbul',
  description: 'Sporyum 23, İstanbul\'un en modern halı saha tesislerinden biridir. 3 adet profesyonel halı saha, duş ve soyunma odaları, kafeterya ve ücretsiz otopark imkanı sunmaktadır.',
  rating: 4.8,
  price: 450,
  openingHours: '09:00 - 23:00',
  contactPhone: '0555 123 4567',
  contactEmail: 'info@sporyum23.com',
  website: 'www.sporyum23.com',
  fields: [
    { id: 1, name: 'Saha 1', size: '30x50m', indoor: false, surface: 'Suni Çim', light: true },
    { id: 2, name: 'Saha 2', size: '25x45m', indoor: false, surface: 'Suni Çim', light: true },
    { id: 3, name: 'Saha 3', size: '25x45m', indoor: true, surface: 'Suni Çim', light: true }
  ],
  amenities: ['Duş', 'Soyunma Odası', 'Ücretsiz Otopark', 'Kafeterya', 'WiFi', 'Aydınlatma'],
  images: [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1624880357913-a8539238245b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  ],
  testimonials: [
    { id: 1, name: 'Ahmet Y.', comment: 'Harika bir tesis, sahalar çok bakımlı ve personel çok ilgili.', rating: 5 },
    { id: 2, name: 'Mehmet K.', comment: 'Düzenli olarak haftada 2 kez maç yapıyoruz. Saha kalitesi mükemmel.', rating: 5 },
    { id: 3, name: 'Ali D.', comment: 'Rezervasyon sistemi çok pratik, online ödeme imkanı harika.', rating: 4 }
  ]
};

// Son maç sonuçları
const RECENT_MATCHES = [
  { id: 1, date: '20.05.2025', time: '10:00', team1: 'Boğalar', team2: 'Kartallar', score: '5-0', field: 1 },
  { id: 2, date: '14.05.2025', time: '12:00', team1: 'Aslanlar', team2: 'Şimşekler', score: '1-3', field: 2 },
  { id: 3, date: '14.05.2025', time: '21:00', team1: 'Boğalar', team2: 'Kartallar', score: '1-0', field: 3 },
  { id: 4, date: '15.05.2025', time: '16:00', team1: 'Kartallar', team2: 'Şimşekler', score: '3-2', field: 1 }
];

// Saha doluluk oranı (Saat - Hafta bazında)
const OCCUPANCY_DATA = {
  weeklyRate: 85, // %85 doluluk
  topHours: ['18:00-19:00', '19:00-20:00', '20:00-21:00'],
  topDays: ['Salı', 'Perşembe', 'Cumartesi']
};

// Halı saha işletmecilerine sağladığımız avantajlar
const OWNER_BENEFITS = [
  { 
    title: 'Kolay Rezervasyon Yönetimi', 
    description: 'Web ve mobil uygulama üzerinden anlık rezervasyon takibi ve yönetimi', 
    icon: <EventAvailable sx={{ fontSize: 40, color: '#4CAF50' }} /> 
  },
  { 
    title: 'Gelir Artışı', 
    description: 'Boş saatlerin doldurulması ve müşteri sadakati ile %30\'a varan gelir artışı', 
    icon: <MonetizationOn sx={{ fontSize: 40, color: '#4CAF50' }} /> 
  },
  { 
    title: 'Verimli Takım Yönetimi', 
    description: 'Personel ve bakım görevlerinin takibi ve yönetimi', 
    icon: <Groups sx={{ fontSize: 40, color: '#4CAF50' }} /> 
  }
];

function Feed() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      {/* Son Maç Sonuçları Kartı */}
      <Card sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        mb: 3,
        mt: 2
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 2 }}>
            <SportsSoccer sx={{ mr: 1, verticalAlign: 'middle' }} />
            Son Maç Sonuçları
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {RECENT_MATCHES.map((match, index) => (
              <Box 
                key={match.id}
                sx={{ 
                  flexBasis: { xs: '100%', sm: '48%', md: '23%' },
                  py: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 2,
                  p: 1
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {match.date} • {match.time} • Saha {match.field}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '40%' }}>
                    <Avatar sx={{ 
                      bgcolor: '#1976d2', 
                      width: 36, 
                      height: 36,
                      mr: 1
                    }}>
                      {match.team1.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {match.team1}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    px: 2,
                    py: 0.5,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: 1
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {match.score}
              </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '40%',
                    justifyContent: 'flex-end'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                      {match.team2}
                    </Typography>
                    <Avatar sx={{ 
                      bgcolor: '#d32f2f',
                      width: 36, 
                      height: 36
                    }}>
                      {match.team2.charAt(0)}
                    </Avatar>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              color="primary"
              href="/matches"
              sx={{ borderRadius: 20 }}
            >
              Tüm Maçları Gör
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Sporyum 23 Ana Banner */}
      <Box 
                      sx={{ 
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          height: 300,
          mb: 4,
                        display: 'flex',
          alignItems: 'flex-end',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(${SPORYUM_23.images[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box sx={{ p: 4, width: '100%' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
            {SPORYUM_23.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ color: 'white', mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              {SPORYUM_23.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              href="/reservations"
                          sx={{ 
                bgcolor: '#4CAF50', 
                '&:hover': { bgcolor: '#388E3C' },
                borderRadius: '24px',
                px: 3
              }}
            >
              Saha Rezervasyonu Yap
            </Button>
            <Button 
              variant="outlined" 
                          sx={{ 
                            color: 'white',
                borderColor: 'white',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)' 
                },
                borderRadius: '24px',
                px: 3
              }}
              href="/teams"
            >
              Takımları Görüntüle
            </Button>
          </Box>
        </Box>
                      </Box>
                      
      <Grid container spacing={4}>
        {/* Sol Sütun - Halı Saha Bilgileri ve İstatistikler */}
        <Grid item xs={12} md={4}>
          {/* Halı Saha Kartı */}
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 2 }}>
                Tesis Bilgileri
                          </Typography>
                          
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {SPORYUM_23.description}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* İletişim ve Temel Bilgiler */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ color: '#4CAF50', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    <strong>Çalışma Saatleri:</strong> {SPORYUM_23.openingHours}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOn sx={{ color: '#4CAF50', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    <strong>Fiyat:</strong> {SPORYUM_23.price} TL/saat
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ color: '#4CAF50', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    <strong>İletişim:</strong> {SPORYUM_23.contactPhone}
                            </Typography>
                          </Box>
                        </Box>
                        
              <Divider sx={{ my: 2 }} />
              
              {/* Sahalar */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Sahalarımız
              </Typography>
              
              {SPORYUM_23.fields.map(field => (
                <Box key={field.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(76, 175, 80, 0.08)',
                  mb: 1
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {field.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {field.size} • {field.surface} • {field.indoor ? 'Kapalı' : 'Açık'}
                    </Typography>
                  </Box>
                  <Chip 
                    label={field.light ? 'Aydınlatmalı' : 'Gündüz'} 
                    size="small"
                    color={field.light ? 'success' : 'default'}
                  />
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Olanaklar */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Olanaklar
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SPORYUM_23.amenities.map((amenity, index) => {
                  let icon;
                  switch(amenity) {
                    case 'Duş': icon = <Shower fontSize="small" />; break;
                    case 'Soyunma Odası': icon = <Person fontSize="small" />; break;
                    case 'Ücretsiz Otopark': icon = <LocalParking fontSize="small" />; break;
                    case 'Kafeterya': icon = <Restaurant fontSize="small" />; break;
                    case 'WiFi': icon = <Wifi fontSize="small" />; break;
                    case 'Aydınlatma': icon = <Bolt fontSize="small" />; break;
                    default: icon = <CheckCircle fontSize="small" />;
                  }
                  
                  return (
                    <Chip 
                      key={index}
                      icon={icon}
                      label={amenity}
                      variant="outlined"
                      size="small"
                      sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
          
          {/* Doluluk İstatistikleri */}
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                Doluluk İstatistikleri
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={OCCUPANCY_DATA.weeklyRate} 
                    size={80}
                    thickness={4}
                    sx={{ color: '#4CAF50' }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" component="div" color="text.secondary">
                      {OCCUPANCY_DATA.weeklyRate}%
                            </Typography>
                          </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Haftalık Doluluk Oranı
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Son 7 günün ortalaması
                            </Typography>
                          </Box>
                        </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  En Yoğun Saatler
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {OCCUPANCY_DATA.topHours.map((hour, index) => (
                    <Chip key={index} label={hour} size="small" />
                  ))}
                      </Box>
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  En Yoğun Günler
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {OCCUPANCY_DATA.topDays.map((day, index) => (
                    <Chip key={index} label={day} size="small" />
            ))}
                </Box>
            </Box>
            </CardContent>
          </Card>
          </Grid>

          {/* Orta Sütun - Video Feed */}
        <Grid item xs={12} md={5}>
          {/* Video İçerikleri */}
            <VideoFeed />
          </Grid>

        {/* Sağ Sütun - Saha Sahiplerine Özel ve Müşteri Yorumları */}
          <Grid item xs={12} md={3}>
          {/* Saha Sahiplerine Özel */}
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            mb: 3,
            backgroundImage: 'linear-gradient(to bottom right, #4CAF50, #2E7D32)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Halı Saha Sahiplerine Özel
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                FutbolX ile işletmenizi büyütün! Rezervasyon sistemimize kaydolun ve işinizi dijitalleştirin.
              </Typography>
              
              {OWNER_BENEFITS.map((benefit, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  mb: 2,
                  p: 1.5,
              borderRadius: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}>
                  <Box sx={{ mr: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="caption">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              <Button 
                variant="contained" 
                fullWidth
                sx={{ 
                  mt: 1, 
                  bgcolor: 'white', 
                  color: '#4CAF50',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                Ücretsiz Kaydolun
              </Button>
            </CardContent>
          </Card>
          
          {/* Müşteri Yorumları */}
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 2 }}>
                Müşteri Yorumları
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating 
                  value={SPORYUM_23.rating}
                              readOnly 
                              precision={0.1}
                  sx={{ mr: 1 }}
                            />
                <Typography variant="body2" color="text.secondary">
                  ({SPORYUM_23.rating}/5)
                            </Typography>
                          </Box>
              
              {SPORYUM_23.testimonials.map((testimonial, index) => (
                <React.Fragment key={testimonial.id}>
                  <Box sx={{ 
                    py: 1.5,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {testimonial.name}
                          </Typography>
                      <Rating value={testimonial.rating} readOnly size="small" />
                        </Box>
                    <Typography variant="body2" color="text.secondary">
                      "{testimonial.comment}"
                    </Typography>
                  </Box>
                  {index < SPORYUM_23.testimonials.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="text" 
                  color="primary"
                >
                  Yorum Ekle
                </Button>
                </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Feed;
