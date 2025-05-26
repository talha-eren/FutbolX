import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Grid, Paper, CircularProgress, Alert,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Snackbar
} from '@mui/material';
import axios from 'axios';
import { Edit } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Stats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({
    matches: 0,
    goals: 0,
    assists: 0,
    position: '',
    preferredFoot: '',
    height: 0,
    weight: 0,
    teams: [],
    achievements: [],
    footballExperience: 'Başlangıç',
    favoriteTeam: '',
    hoursPlayed: 0
  });
  
  // Düzenleme için state'ler
  const [openDialog, setOpenDialog] = useState(false);
  const [editedStats, setEditedStats] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
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
  
  // İstatistik verilerini çek
  const fetchStats = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/auth/profile`, config);
      console.log('Kullanıcı verileri alındı:', response.data);
      
      // İstatistikleri ayarla
      setUserStats({
        matches: response.data.matches?.length || response.data.matchesPlayed || 0,
        goals: response.data.goalsScored || 0,
        assists: response.data.assists || 0,
        position: response.data.position || '',
        preferredFoot: response.data.preferredFoot || '',
        height: response.data.height || 0,
        weight: response.data.weight || 0,
        teams: response.data.teams || [],
        achievements: response.data.achievements || [],
        footballExperience: response.data.footballExperience || 'Başlangıç',
        favoriteTeam: response.data.favoriteTeam || '',
        hoursPlayed: response.data.hoursPlayed || 0
      });
      
      setLoading(false);
    } catch (error) {
      console.error('İstatistik verileri çekilirken hata oluştu:', error);
      
      if (error.response && error.response.status === 401) {
        setError('Oturumunuz sonlanmış görünüyor. Lütfen tekrar giriş yapın.');
        // Token'ı temizle ve kullanıcıyı login sayfasına yönlendir
        localStorage.removeItem('userToken');
        localStorage.removeItem('isLoggedIn');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login?redirect=/stats';
        }, 2000);
      } else {
        setError('İstatistik verileri yüklenirken bir hata oluştu.');
      }
      
      setLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde kullanıcı istatistiklerini çek
  useEffect(() => {
    fetchStats();
  }, []);
  
  // Grafik verilerini hazırla
  const prepareChartData = () => {
    return [
      {
        name: 'Maç',
        değer: userStats.matches,
        dolgu: '#8884d8',
      },
      {
        name: 'Gol',
        değer: userStats.goals,
        dolgu: '#4CAF50',
      },
      {
        name: 'Asist',
        değer: userStats.assists,
        dolgu: '#ffc658',
      }
    ];
  };
  
  // İstatistikleri düzenleme dialogunu aç
  const handleOpenEditDialog = () => {
    setEditedStats({
      matches: userStats.matches,
      goals: userStats.goals,
      assists: userStats.assists,
      position: userStats.position,
      preferredFoot: userStats.preferredFoot,
      footballExperience: userStats.footballExperience,
      height: userStats.height,
      weight: userStats.weight,
      favoriteTeam: userStats.favoriteTeam
    });
    setOpenDialog(true);
  };
  
  // Dialogu kapat
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // İstatistikleri güncelle
  const handleUpdateStats = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      // Profil verilerini hazırla
      const profileData = {
        matchesPlayed: Number(editedStats.matches),
        goalsScored: Number(editedStats.goals),
        assists: Number(editedStats.assists),
        position: editedStats.position,
        preferredFoot: editedStats.preferredFoot,
        footballExperience: editedStats.footballExperience,
        height: Number(editedStats.height),
        weight: Number(editedStats.weight),
        favoriteTeam: editedStats.favoriteTeam
      };
      
      console.log('Gönderilecek istatistik verileri:', profileData);
      
      // API'ye gönder
      const response = await axios.put(`${API_URL}/auth/profile`, profileData, config);
      
      if (response.data) {
        console.log('İstatistik güncellemesi başarılı:', response.data);
        
        // State'i güncelle
        setUserStats({
          ...userStats,
          matches: Number(editedStats.matches),
          goals: Number(editedStats.goals),
          assists: Number(editedStats.assists),
          position: editedStats.position,
          preferredFoot: editedStats.preferredFoot,
          footballExperience: editedStats.footballExperience,
          height: Number(editedStats.height),
          weight: Number(editedStats.weight),
          favoriteTeam: editedStats.favoriteTeam
        });
        
        // localStorage'daki kullanıcı bilgilerini güncelle
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            const updatedUserInfo = {
              ...parsedUserInfo,
              position: editedStats.position,
              preferredFoot: editedStats.preferredFoot,
              footballExperience: editedStats.footballExperience,
              height: Number(editedStats.height),
              weight: Number(editedStats.weight),
              favoriteTeam: editedStats.favoriteTeam
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          } catch (error) {
            console.error('localStorage kullanıcı bilgileri güncellenemedi:', error);
          }
        }
        
        setNotification({
          open: true,
          message: 'İstatistikleriniz başarıyla güncellendi!',
          severity: 'success'
        });
        
        // Dialogu kapat
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('İstatistik güncelleme hatası:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'İstatistikler güncellenemedi. Bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Bildirim kapatma
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom sx={{ 
          fontWeight: 'bold',
          borderBottom: '2px solid #4CAF50',
          pb: 1
        }}>
          İstatistiklerim
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Edit />}
          onClick={handleOpenEditDialog}
          sx={{ borderRadius: 2 }}
        >
          İstatistiklerimi Düzenle
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* İstatistik Grafiği */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Performans Özetim
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={prepareChartData()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="değer" fill="#4CAF50" name="Değer" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
          
          {/* İstatistik Kartları */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#4CAF50' }}>
                  Maç İstatistikleri
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Oynadığım Maçlar:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.matches}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Attığım Goller:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.goals}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Asistlerim:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.assists}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Gol/Maç Oranı:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.matches > 0 ? (userStats.goals / userStats.matches).toFixed(2) : '0'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#4CAF50' }}>
                  Futbolcu Bilgilerim
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Pozisyon:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.position || 'Belirtilmemiş'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Tercih Ettiğim Ayak:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.preferredFoot || 'Belirtilmemiş'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Boy:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.height || 0} cm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Kilo:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.weight || 0} kg</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#4CAF50' }}>
                  Gelişim Analizi
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Güçlü Yönlerim:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.goals > userStats.assists ? 'Gol Atmak' : 'Asist Yapmak'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Geliştirilmesi Gereken:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.goals < userStats.assists ? 'Gol Atmak' : 'Asist Yapmak'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Futbol Deneyimi:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.footballExperience || 'Belirtilmemiş'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Favori Takım:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.favoriteTeam || 'Belirtilmemiş'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Verimlilik:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.matches > 0 ? ((userStats.goals + userStats.assists) / userStats.matches).toFixed(2) : '0'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* İstatistik Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4CAF50', color: 'white' }}>
          İstatistiklerimi Düzenle
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>Maç İstatistikleri</Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Oynadığım Maç Sayısı"
                type="number"
                value={editedStats.matches || 0}
                onChange={(e) => setEditedStats({ ...editedStats, matches: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Attığım Gol Sayısı"
                type="number"
                value={editedStats.goals || 0}
                onChange={(e) => setEditedStats({ ...editedStats, goals: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Asist Sayısı"
                type="number"
                value={editedStats.assists || 0}
                onChange={(e) => setEditedStats({ ...editedStats, assists: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Futbolcu Bilgilerim</Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Pozisyon</InputLabel>
                <Select
                  value={editedStats.position || ''}
                  onChange={(e) => setEditedStats({ ...editedStats, position: e.target.value })}
                  label="Pozisyon"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="Kaleci">Kaleci</MenuItem>
                  <MenuItem value="Defans">Defans</MenuItem>
                  <MenuItem value="Orta Saha">Orta Saha</MenuItem>
                  <MenuItem value="Forvet">Forvet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tercih Ettiğim Ayak</InputLabel>
                <Select
                  value={editedStats.preferredFoot || ''}
                  onChange={(e) => setEditedStats({ ...editedStats, preferredFoot: e.target.value })}
                  label="Tercih Ettiğim Ayak"
                >
                  <MenuItem value="Sağ">Sağ</MenuItem>
                  <MenuItem value="Sol">Sol</MenuItem>
                  <MenuItem value="Her İkisi">Her İkisi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Futbol Deneyimi</InputLabel>
                <Select
                  value={editedStats.footballExperience || 'Başlangıç'}
                  onChange={(e) => setEditedStats({ ...editedStats, footballExperience: e.target.value })}
                  label="Futbol Deneyimi"
                >
                  <MenuItem value="Başlangıç">Başlangıç</MenuItem>
                  <MenuItem value="Orta">Orta</MenuItem>
                  <MenuItem value="İleri">İleri</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Boy (cm)"
                type="number"
                value={editedStats.height || 0}
                onChange={(e) => setEditedStats({ ...editedStats, height: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Kilo (kg)"
                type="number"
                value={editedStats.weight || 0}
                onChange={(e) => setEditedStats({ ...editedStats, weight: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Favori Takım"
                value={editedStats.favoriteTeam || ''}
                onChange={(e) => setEditedStats({ ...editedStats, favoriteTeam: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleUpdateStats} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirim */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%', bgcolor: notification.severity === 'success' ? '#4CAF50' : undefined }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Stats; 