import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Grid, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, Divider, 
  OutlinedInput, Checkbox, ListItemText, Slider, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

// Hafta günleri
const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

function CreateTeamPage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form verileri
  const [formData, setFormData] = useState({
    name: '',
    level: 'Orta',
    neededPlayers: 2,
    preferredTime: '20:00',
    contactNumber: '',
    description: '',
    venue: '',
    regularPlayDays: [],
    location: {
      city: 'İstanbul',
      district: ''
    },
    stats: {
      attack: 50,
      defense: 50,
      speed: 50,
      teamwork: 50
    }
  });

  // Halı sahaları yükle
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${API_URL}/venues`);
        setVenues(response.data || []);
      } catch (error) {
        console.error('Halı sahalar yüklenirken hata:', error);
      }
    };
    
    fetchVenues();
  }, []);

  // Form alanlarını değiştirme
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (name === 'regularPlayDays') {
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kullanıcı giriş yapmış mı kontrol et
    const token = getToken();
    if (!token) {
      setError('Bu işlemi gerçekleştirmek için giriş yapmalısınız.');
      setTimeout(() => {
        navigate('/login?redirect=/teams/create');
      }, 2000);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      console.log('API isteği için config:', config);
      
      // Kullanıcı bilgisini al
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        setError('Kullanıcı bilgileriniz bulunamadı.');
        setLoading(false);
        return;
      }
      
      const userInfo = JSON.parse(userInfoStr);
      console.log('Kullanıcı bilgileri:', userInfo);
      
      // Takım oluştur
      console.log('Gönderilecek takım verileri:', formData);
      const response = await axios.post(`${API_URL}/teams`, formData, config);
      console.log('Sunucu yanıtı:', response.data);
      
      setSuccess(true);
      setFormData({
        name: '',
        level: 'Orta',
        neededPlayers: 2,
        preferredTime: '20:00',
        contactNumber: '',
        description: '',
        venue: '',
        regularPlayDays: [],
        location: {
          city: 'İstanbul',
          district: ''
        },
        stats: {
          attack: 50,
          defense: 50,
          speed: 50,
          teamwork: 50
        }
      });
      
      // 3 saniye sonra takımlar sayfasına yönlendir
      setTimeout(() => {
        navigate('/teams');
      }, 3000);
      
    } catch (error) {
      console.error('Takım oluşturulurken hata:', error);
      
      const errorMessage = error.response?.data?.message || 'Takım oluşturulurken bir hata oluştu.';
      const errorDetails = error.response?.data?.error || '';
      const errorStack = error.response?.data?.stack || '';
      
      console.error('Hata detayları:', {
        message: errorMessage,
        details: errorDetails,
        stack: errorStack
      });
      
      setError(`${errorMessage} ${errorDetails ? `(${errorDetails})` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          Yeni Takım Oluştur
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Kendi takımınızı oluşturun ve diğer oyuncularla maç yapın. Oluşturduğunuz takım admin onayından sonra takımlar sayfasında görünecektir.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ my: 2 }}>
            Takımınız başarıyla oluşturuldu! Admin onayından sonra takımlar sayfasında görünecektir. Yönlendiriliyorsunuz...
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Temel Bilgiler
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Takım Adı"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Örn: Şimşekler"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="level-label">Seviye</InputLabel>
                <Select
                  labelId="level-label"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  label="Seviye"
                >
                  <MenuItem value="Başlangıç">Başlangıç</MenuItem>
                  <MenuItem value="Orta">Orta</MenuItem>
                  <MenuItem value="İyi">İyi</MenuItem>
                  <MenuItem value="Pro">Pro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="İhtiyaç Duyulan Oyuncu Sayısı"
                name="neededPlayers"
                type="number"
                value={formData.neededPlayers}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, max: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tercih Edilen Saat"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                fullWidth
                placeholder="20:00"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="venue-label">Halı Saha</InputLabel>
                <Select
                  labelId="venue-label"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  label="Halı Saha"
                >
                  <MenuItem value="">
                    <em>Seçilmedi</em>
                  </MenuItem>
                  {venues.map((venue) => (
                    <MenuItem key={venue._id} value={venue._id}>
                      {venue.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="play-days-label">Düzenli Maç Günleri</InputLabel>
                <Select
                  labelId="play-days-label"
                  name="regularPlayDays"
                  multiple
                  value={formData.regularPlayDays}
                  onChange={handleChange}
                  input={<OutlinedInput label="Düzenli Maç Günleri" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <MenuItem key={day} value={day}>
                      <Checkbox checked={formData.regularPlayDays.indexOf(day) > -1} />
                      <ListItemText primary={day} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                İletişim ve Konum
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="İletişim Numarası"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                fullWidth
                placeholder="05XX XXX XX XX"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="İlçe"
                name="location.district"
                value={formData.location.district}
                onChange={handleChange}
                fullWidth
                placeholder="Örn: Kadıköy"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Takım Açıklaması"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Takımınız hakkında kısa bir açıklama yazın..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Takım Özellikleri
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Hücum Gücü: {formData.stats.attack}
              </Typography>
              <Slider
                name="stats.attack"
                value={formData.stats.attack}
                onChange={(e, value) => {
                  setFormData({
                    ...formData,
                    stats: {
                      ...formData.stats,
                      attack: value
                    }
                  });
                }}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ color: '#ff9800' }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Defans Gücü: {formData.stats.defense}
              </Typography>
              <Slider
                name="stats.defense"
                value={formData.stats.defense}
                onChange={(e, value) => {
                  setFormData({
                    ...formData,
                    stats: {
                      ...formData.stats,
                      defense: value
                    }
                  });
                }}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ color: '#2196f3' }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Hız: {formData.stats.speed}
              </Typography>
              <Slider
                name="stats.speed"
                value={formData.stats.speed}
                onChange={(e, value) => {
                  setFormData({
                    ...formData,
                    stats: {
                      ...formData.stats,
                      speed: value
                    }
                  });
                }}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ color: '#f44336' }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Takım Oyunu: {formData.stats.teamwork}
              </Typography>
              <Slider
                name="stats.teamwork"
                value={formData.stats.teamwork}
                onChange={(e, value) => {
                  setFormData({
                    ...formData,
                    stats: {
                      ...formData.stats,
                      teamwork: value
                    }
                  });
                }}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ color: '#9c27b0' }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Takım Oluştur'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateTeamPage; 