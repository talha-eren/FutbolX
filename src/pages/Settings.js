import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Grid, Divider, TextField, Button, Alert, Snackbar,
  CircularProgress, Switch, FormControlLabel,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Person, Lock, Notifications, Security, 
  Language, Save, Delete
} from '@mui/icons-material';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:5000/api';

function Settings() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: ''
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: false,
    language: 'tr'
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
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
  
  // Kullanıcı bilgilerini çek
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        showNotification('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.', 'error');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/auth/profile`, config);
      
      setUserInfo({
        username: response.data.username || '',
        email: response.data.email || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        bio: response.data.bio || ''
      });
      
      // Tercihler için varsayılan değerler (backend'den gelmiyor varsayalım)
      setPreferences({
        emailNotifications: true,
        darkMode: false,
        language: 'tr'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Kullanıcı bilgileri çekilirken hata oluştu:', error);
      
      if (error.response && error.response.status === 401) {
        showNotification('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.', 'error');
        
        // Token'ı temizle ve kullanıcıyı login sayfasına yönlendir
        localStorage.removeItem('userToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login?redirect=/settings';
        }, 2000);
      } else {
        showNotification('Kullanıcı bilgileri yüklenirken bir hata oluştu.', 'error');
      }
      
      setLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde kullanıcı bilgilerini çek
  useEffect(() => {
    fetchUserInfo();
  }, []);
  
  // Bildirim göster
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Bildirim kapat
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Hesap bilgilerini güncelle
  const handleUpdateAccount = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        showNotification('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.', 'error');
        setLoading(false);
        return;
      }
      
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        userInfo,
        config
      );
      
      if (response.data) {
        showNotification('Hesap bilgileriniz başarıyla güncellendi!');
        
        // localStorage'daki kullanıcı bilgilerini güncelle
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            const updatedUserInfo = {
              ...parsedUserInfo,
              username: userInfo.username,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          } catch (error) {
            console.error('localStorage kullanıcı bilgileri güncellenemedi:', error);
          }
        }
      } else {
        showNotification('Hesap bilgileri güncellenemedi. Lütfen tekrar deneyin.', 'error');
      }
    } catch (error) {
      console.error('Hesap güncelleme hatası:', error);
      showNotification('Hesap güncellenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Şifre değiştir
  const handleChangePassword = async () => {
    try {
      // Şifre kontrolü
      if (passwords.newPassword !== passwords.confirmPassword) {
        showNotification('Yeni şifreler eşleşmiyor.', 'error');
        return;
      }
      
      if (!passwords.currentPassword || !passwords.newPassword) {
        showNotification('Mevcut şifre ve yeni şifre zorunludur.', 'error');
        return;
      }
      
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        showNotification('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.', 'error');
        setLoading(false);
        return;
      }
      
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        config
      );
      
      if (response.data) {
        showNotification('Şifreniz başarıyla değiştirildi!');
        // Şifre alanlarını temizle
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showNotification('Şifre değiştirilemedi. Lütfen tekrar deneyin.', 'error');
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        showNotification(error.response.data.message, 'error');
      } else {
        showNotification('Şifre değiştirilirken bir hata oluştu.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Tercihleri güncelle
  const handleUpdatePreferences = async () => {
    try {
      setLoading(true);
      // Gerçek API isteği burada olacak
      
      // Simülasyon için timeout kullanıyoruz
      setTimeout(() => {
        showNotification('Tercihleriniz başarıyla güncellendi!');
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Tercih güncelleme hatası:', error);
      showNotification('Tercihler güncellenirken bir hata oluştu.', 'error');
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Typography variant="h4" component="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Hesap Ayarları
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profil Bilgileri */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Profil Bilgileri
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Kullanıcı Adı"
                    value={userInfo.username}
                    onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    variant="outlined"
                    type="email"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ad"
                    value={userInfo.firstName}
                    onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Soyad"
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Konum"
                    value={userInfo.location}
                    onChange={(e) => setUserInfo({ ...userInfo, location: e.target.value })}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hakkımda"
                    value={userInfo.bio}
                    onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                    variant="outlined"
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleUpdateAccount}
                    disabled={loading}
                    fullWidth
                    sx={{ 
                      py: 1.2,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(76,175,80,0.2)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(76,175,80,0.3)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Değişiklikleri Kaydet'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Şifre Değiştir */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Lock color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Şifre Değiştir
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mevcut Şifre"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    variant="outlined"
                    type="password"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Yeni Şifre"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    variant="outlined"
                    type="password"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Yeni Şifre (Tekrar)"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    variant="outlined"
                    type="password"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleChangePassword}
                    disabled={loading}
                    fullWidth
                    sx={{ 
                      py: 1.2,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(76,175,80,0.2)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(76,175,80,0.3)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Şifreyi Değiştir'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Tercihler */}
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Tercihler
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText primary="E-posta Bildirimleri" />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        color="primary"
                      />
                    }
                    label=""
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Language />
                  </ListItemIcon>
                  <ListItemText primary="Dil" secondary="Türkçe" />
                </ListItem>
                <ListItem>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleUpdatePreferences}
                    disabled={loading}
                    fullWidth
                    sx={{ 
                      py: 1,
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(76,175,80,0.08)'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Tercihleri Güncelle'}
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Hesap Silme ve Diğer İşlemler */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                  Güvenlik ve Hesap
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Hesabı Sil
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  sx={{ 
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(244,67,54,0.08)'
                    }
                  }}
                >
                  Hesabı Sil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Bildirim */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Settings; 