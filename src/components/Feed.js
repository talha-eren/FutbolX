import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Paper, Tabs, Tab, Card, CardMedia, CardContent, Avatar, Button, CircularProgress, Alert, Divider, Chip, Rating } from '@mui/material';
import { SportsSoccer, LocationOn, Star, EmojiEvents, Person, AccessTime, EventAvailable, MonetizationOn, Bolt, Speed, CheckCircle, LocalParking, Shower, Restaurant, Wifi, Groups, Add, VideoCall } from '@mui/icons-material';
import VideoFeed from './Feed/VideoFeed';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { Link } from 'react-router-dom';

// Sporyum 23 halı saha bilgileri
const SPORYUM_23 = {
  id: 'sporyum23',
  name: 'Sporyum 23',
  location: 'Elazığ Merkez',
  address: 'Cumhuriyet Mah. F. Ahmet Baba Bulvarı No:110, Tedaş Kavşağı Türk Telekom Arkası, Elazığ',
  description: 'Sporyum 23, Elazığ\'ın en modern halı saha tesislerinden biridir. 3 adet profesyonel halı saha, duş ve soyunma odaları, kafeterya ve ücretsiz otopark imkanı sunmaktadır.',
  rating: 4.8,
  price: 450,
  openingHours: '09:00 - 23:00',
  contactPhone: '0424 247 7701',
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
    { id: 1, name: 'Ahmet Yılmaz', comment: 'Saha zemini çok iyi durumda, tesisler temiz ve bakımlı. Fiyat/performans açısından da oldukça uygun. Kesinlikle tavsiye ederim.', rating: 5 },
    { id: 2, name: 'Mehmet Kaya', comment: 'Harika bir deneyimdi! Personel çok ilgili, saha bakımlı ve ekipmanlar yeni.', rating: 5 },
    { id: 3, name: 'Ayşe Demir', comment: 'Gece aydınlatması mükemmel, hiç görüş sorunu yaşamadık.', rating: 4 },
    { id: 4, name: 'Fatma Şahin', comment: 'Rezervasyon sistemi çok pratik. Uygulama üzerinden kolayca yer ayırtabildik.', rating: 5 }
  ]
};

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
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the current user is talhaeren (admin)
  useEffect(() => {
    const checkAdminStatus = () => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return false;
      
      try {
        const user = JSON.parse(userInfo);
        return user.username === 'talhaeren';
      } catch (error) {
        console.error('Error parsing user info:', error);
        return false;
      }
    };
    
    setIsAdmin(checkAdminStatus());
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
    

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
                      
      {/* Gönderi Paylaş Kısmı */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 2 }}>
            📝 Gönderi Paylaş
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Düşüncelerinizi, fotoğraflarınızı, videolarınızı ve deneyimlerinizi toplulukla paylaşın!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/upload-post"
              startIcon={<Add />}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#388E3C' },
                borderRadius: '24px',
                px: 3,
                py: 1.5,
                fontWeight: 'bold'
              }}
            >
              Yeni Gönderi
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to="/videos"
              startIcon={<SportsSoccer />}
              sx={{
                borderColor: '#4CAF50',
                color: '#4CAF50',
                '&:hover': { 
                  borderColor: '#388E3C',
                  bgcolor: 'rgba(76, 175, 80, 0.08)' 
                },
                borderRadius: '24px',
                px: 3,
                py: 1.5,
                fontWeight: 'bold'
              }}
            >
              Tüm Gönderileri Gör
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#4CAF50' }}>
        Son Oynanan Maçlar
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button 
          variant="outlined" 
          color="success"
          href="/matches?venue=halisaha1"
          sx={{ 
            borderRadius: 4,
            borderColor: '#4CAF50',
            color: '#4CAF50',
            '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' }
          }}
          startIcon={<SportsSoccer />}
        >
          Halı Saha 1
        </Button>
        
        <Button 
          variant="outlined" 
          color="success"
          href="/matches?venue=halisaha2"
          sx={{ 
            borderRadius: 4,
            borderColor: '#4CAF50',
            color: '#4CAF50',
            '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' }
          }}
          startIcon={<SportsSoccer />}
        >
          Halı Saha 2
        </Button>
        
        <Button 
          variant="outlined" 
          color="success"
          href="/matches?venue=halisaha3"
          sx={{ 
            borderRadius: 4,
            borderColor: '#4CAF50',
            color: '#4CAF50',
            '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' }
          }}
          startIcon={<SportsSoccer />}
        >
          Halı Saha 3
        </Button>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={field.light ? 'Aydınlatmalı' : 'Gündüz'} 
                      size="small"
                      color={field.light ? 'success' : 'default'}
                    />
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary"
                      component={Link}
                      to={`/reviews/saha${field.id}`}
                      sx={{ ml: 1, fontSize: '0.75rem' }}
                    >
                      Yorumlar
                    </Button>
                  </Box>
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
          {/* Saha Sahiplerine Özel - sadece admin için göster */}
          {isAdmin && (
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
                  Halı Saha Yönetimi (Admin)
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Bu bölüm sadece size (talhaeren) özel olarak görüntülenmektedir. Burada halı saha işletmenizi yönetebilirsiniz.
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
                  component={Link}
                  to="/admin"
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'white', 
                    color: '#4CAF50',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  Yönetim Paneline Git
                </Button>
              </CardContent>
            </Card>
          )}
          
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
                  component={Link}
                  to="/reviews/sporium23"
                >
                  Yorumları Gör
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
