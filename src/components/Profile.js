import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Card, CardContent,
  Grid, Avatar, Button, Tab, Tabs, Divider,
  List, ListItem, ListItemAvatar, ListItemText,
  ListItemSecondary, IconButton, Chip, Rating,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  SportsSoccer, Edit, EmojiEvents, Timeline,
  Group, Star, Place, CalendarToday, Save,
  PhotoCamera, Close, Info, Person, Add
} from '@mui/icons-material';

// API URL
const API_URL = 'http://localhost:5000/api';

function Profile() {
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [mainTabValue, setMainTabValue] = useState(0); // Ana sekmeler için değer (0: İstatistikler, 1: Hesap Ayarları)
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [dialogType, setDialogType] = useState(''); // 'match', 'highlight', 'profile'
  
  // Kullanıcı verileri
  const [userInfo, setUserInfo] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    profilePicture: '',
    phone: '',
    createdAt: ''
  });
  
  const [userStats, setUserStats] = useState({
    matches: 0,
    goals: 0,
    assists: 0,
    rating: 0,
    position: '',
    preferredFoot: 'Sağ',
    height: 175,
    weight: 70,
    teams: [],
    achievements: [],
    location: ''
  });
  
  const [recentMatches, setRecentMatches] = useState([]);
  const [highlights, setHighlights] = useState([]);
  
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
  
  // Kullanıcı verilerini çek
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      console.log('Profil isteği gönderiliyor, config:', config);
      const response = await axios.get(`${API_URL}/auth/profile`, config);
      console.log('Profil yanıtı:', response.data);
      
      // Kullanıcı bilgilerini ayarla
      setUserInfo({
        username: response.data.username || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        profilePicture: response.data.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
        phone: response.data.phone || '',
        location: response.data.location || '',
        createdAt: response.data.createdAt || new Date().toISOString()
      });
      
      // İstatistikleri ayarla
      setUserStats({
        matches: response.data.matchesPlayed || 0,
        goals: response.data.goalsScored || 0,
        assists: response.data.assists || 0,
        rating: response.data.rating || 0,
        position: response.data.position || '',
        preferredFoot: response.data.preferredFoot || 'Sağ',
        height: response.data.height || 0,
        weight: response.data.weight || 0,
        teams: response.data.teams || [],
        achievements: response.data.achievements || [],
        favoriteTeam: response.data.favoriteTeam || ''
      });
      
      // Maçları ayarla
      setRecentMatches(response.data.matches || []);
      
      // Öne çıkanları ayarla
      setHighlights(response.data.highlights || []);
      
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
          window.location.href = '/login?redirect=/profile';
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Ana sekme değişikliğini yönet
  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  // Profil düzenleme modunu aç
  const handleEditProfile = () => {
    setEditedData({
      ...userInfo,
      position: userStats.position,
      height: userStats.height,
      weight: userStats.weight,
      preferredFoot: userStats.preferredFoot,
      favoriteTeam: userStats.favoriteTeam
    });
    setEditMode(true);
  };

  // Profil değişikliklerini kaydet
  const handleSaveProfile = async () => {
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
        username: editedData.username,
        email: editedData.email,
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        bio: editedData.bio,
        phone: editedData.phone,
        location: editedData.location,
        // İstatistik verileri
        position: editedData.position,
        preferredFoot: editedData.preferredFoot,
        height: editedData.height,
        weight: editedData.weight,
        matchesPlayed: editedData.matches,
        goalsScored: editedData.goals,
        assists: editedData.assists,
        favoriteTeam: editedData.favoriteTeam
      };
      
      console.log('Gönderilecek profil verileri:', profileData);
      
      // API'ye gönder
      const response = await axios.put(`${API_URL}/auth/profile`, profileData, config);
      
      if (response.data) {
        console.log('Profil güncellemesi başarılı:', response.data);
      
      // State'i güncelle
      setUserInfo({
          ...userInfo,
          username: editedData.username,
          firstName: editedData.firstName,
          lastName: editedData.lastName,
          email: editedData.email,
          bio: editedData.bio,
          phone: editedData.phone,
          location: editedData.location
      });
      
      setUserStats({
        ...userStats,
          position: editedData.position,
          preferredFoot: editedData.preferredFoot,
          height: editedData.height,
          weight: editedData.weight,
          matches: editedData.matches,
          goals: editedData.goals,
          assists: editedData.assists,
          favoriteTeam: editedData.favoriteTeam
        });
        
        // localStorage'daki kullanıcı bilgilerini güncelle
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            const updatedUserInfo = {
              ...parsedUserInfo,
              username: editedData.username,
              firstName: editedData.firstName,
              lastName: editedData.lastName
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          } catch (error) {
            console.error('localStorage kullanıcı bilgileri güncellenemedi:', error);
          }
        }
        
      setNotification({
        open: true,
          message: 'Profiliniz başarıyla güncellendi!',
        severity: 'success'
      });
      } else {
        setNotification({
          open: true,
          message: 'Profil güncellenemedi. Lütfen tekrar deneyin.',
          severity: 'error'
        });
      }
      
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Profil güncellenemedi. Bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  };
  
  // Bildirim kapatma
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Dialog açma
  const handleOpenDialog = (type) => {
    // Dialog açılırken editedData'yı sıfırla
    setEditedData({
      date: '',
      venue: '',
      team: '',
      opponent: '',
      score: '',
      goals: 0,
      assists: 0,
      rating: 0
    });
    
    setDialogType(type);
    setOpenDialog(true);
  };
  
  // Dialog kapatma
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
  };

  // Yeni maç ekleme
  const handleAddMatch = async (matchData) => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      console.log('Gönderilen maç verileri:', matchData);
      
      // API'ye gönder
      const response = await axios.post(
        `${API_URL}/auth/profile/matches`,
        matchData,
        config
      );
      
      console.log('Maç ekleme yanıtı:', response.data);
      
      // Maçları güncelle
      if (response.data) {
        // Eğer response.data.matches varsa, bunu kullan, yoksa tek bir maç dönmüş olabilir
        if (response.data.matches) {
          setRecentMatches(response.data.matches);
        } else {
      setRecentMatches([...recentMatches, response.data]);
        }
      }
      
      // İstatistikleri güncelle - API zaten güncellemiş olacak, bu yüzden yeniden çekelim
      fetchUserData();
      
      setNotification({
        open: true,
        message: 'Maç başarıyla eklendi!',
        severity: 'success'
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Maç eklenirken hata oluştu:', error);
      setNotification({
        open: true,
        message: 'Maç eklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Yeni öne çıkan ekleme
  const handleAddHighlight = async (highlightData) => {
    try {
      setLoading(true);
      const config = getConfig();
      
      // API'ye gönder
      const response = await axios.post(
        `${API_URL}/auth/profile/highlights`,
        highlightData,
        config
      );
      
      // Öne çıkanları güncelle
      setHighlights([...highlights, response.data]);
      
      setNotification({
        open: true,
        message: 'Öne çıkan başarıyla eklendi!',
        severity: 'success'
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Öne çıkan eklenirken hata oluştu:', error);
      setNotification({
        open: true,
        message: 'Öne çıkan eklenirken bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // İstatistikleri düzenleme modunu etkinleştir
  const handleEditStats = () => {
    setEditedData({
      ...editedData,
      matches: userStats.matches,
      goals: userStats.goals,
      assists: userStats.assists,
      position: userStats.position,
      preferredFoot: userStats.preferredFoot,
      height: userStats.height,
      weight: userStats.weight,
      favoriteTeam: userStats.favoriteTeam
    });
    setDialogType('stats');
    setOpenDialog(true);
  };
  
  // Dialog içeriğini render et
  const renderDialogContent = () => {
    switch (dialogType) {
      case 'match':
        return (
          <>
            <DialogTitle>Yeni Maç Ekle</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                label="Tarih"
                placeholder="ör. 14 Mart 2024"
                value={editedData.date || ''}
                onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Mekan"
                placeholder="ör. Yıldız Halı Saha"
                value={editedData.venue || ''}
                onChange={(e) => setEditedData({ ...editedData, venue: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Takım"
                placeholder="ör. Yıldızlar FC"
                value={editedData.team || ''}
                onChange={(e) => setEditedData({ ...editedData, team: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Rakip"
                placeholder="ör. Kartallar Spor"
                value={editedData.opponent || ''}
                onChange={(e) => setEditedData({ ...editedData, opponent: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Skor"
                placeholder="ör. 3-2"
                value={editedData.score || ''}
                onChange={(e) => setEditedData({ ...editedData, score: e.target.value })}
              />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Performans</Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Goller"
                type="number"
                value={editedData.goals || 0}
                onChange={(e) => setEditedData({ 
                  ...editedData, 
                    goals: parseInt(e.target.value) || 0 
                })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Asistler"
                type="number"
                value={editedData.assists || 0}
                onChange={(e) => setEditedData({ 
                  ...editedData, 
                    assists: parseInt(e.target.value) || 0 
                })}
              />
              <Box sx={{ mt: 2 }}>
                <Typography component="legend">Performans Puanı</Typography>
                <Rating
                  name="rating"
                  value={editedData.rating || 0}
                  precision={0.1}
                  max={5}
                  onChange={(e, newValue) => setEditedData({ 
                    ...editedData, 
                      rating: newValue 
                  })}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>İptal</Button>
              <Button 
                onClick={() => {
                  const matchData = {
                    date: editedData.date,
                    venue: editedData.venue,
                    team: editedData.team,
                    opponent: editedData.opponent,
                    score: editedData.score,
                    performance: {
                      goals: editedData.goals || 0,
                      assists: editedData.assists || 0,
                      rating: editedData.rating || 0
                    }
                  };
                  handleAddMatch(matchData);
                }}
                variant="contained"
                color="success"
              >
                Ekle
              </Button>
            </DialogActions>
          </>
        );
      case 'highlight':
        return (
          <>
            <DialogTitle>Yeni Öne Çıkan Ekle</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                label="Başlık"
                placeholder="ör. Harika Gol"
                value={editedData.title || ''}
                onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Tarih"
                placeholder="ör. 14 Mart 2024"
                value={editedData.date || ''}
                onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Beğeni Sayısı"
                type="number"
                value={editedData.likes || 0}
                onChange={(e) => setEditedData({ ...editedData, likes: parseInt(e.target.value) || 0 })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Yorum Sayısı"
                type="number"
                value={editedData.comments || 0}
                onChange={(e) => setEditedData({ ...editedData, comments: parseInt(e.target.value) || 0 })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>İptal</Button>
              <Button 
                onClick={() => {
                  const highlightData = {
                    title: editedData.title,
                    date: editedData.date,
                    likes: editedData.likes || 0,
                    comments: editedData.comments || 0,
                    thumbnail: '🎥'
                  };
                  handleAddHighlight(highlightData);
                }}
                variant="contained"
              >
                Ekle
              </Button>
            </DialogActions>
          </>
        );
      case 'stats':
        return (
          <>
            <DialogTitle>İstatistikleri Düzenle</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Oynadığım Maç Sayısı"
                    type="number"
                    value={editedData.matches || 0}
                    onChange={(e) => setEditedData({ ...editedData, matches: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gol Sayısı"
                    type="number"
                    value={editedData.goals || 0}
                    onChange={(e) => setEditedData({ ...editedData, goals: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Asist Sayısı"
                    type="number"
                    value={editedData.assists || 0}
                    onChange={(e) => setEditedData({ ...editedData, assists: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Pozisyon</InputLabel>
                    <Select
                      value={editedData.position || ''}
                      onChange={(e) => setEditedData({ ...editedData, position: e.target.value })}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Boy (cm)"
                    type="number"
                    value={editedData.height || 0}
                    onChange={(e) => setEditedData({ ...editedData, height: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kilo (kg)"
                    type="number"
                    value={editedData.weight || 0}
                    onChange={(e) => setEditedData({ ...editedData, weight: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Tercih Ettiğin Ayak</InputLabel>
                    <Select
                      value={editedData.preferredFoot || 'Sağ'}
                      onChange={(e) => setEditedData({ ...editedData, preferredFoot: e.target.value })}
                      label="Tercih Ettiğin Ayak"
                    >
                      <MenuItem value="Sağ">Sağ</MenuItem>
                      <MenuItem value="Sol">Sol</MenuItem>
                      <MenuItem value="Her İkisi">Her İkisi</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Favori Takım"
                    value={editedData.favoriteTeam || ''}
                    onChange={(e) => setEditedData({ ...editedData, favoriteTeam: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                İptal
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogActions>
          </>
        );
      case 'profile':
        return (
          <>
            <DialogTitle>Profili Düzenle</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                value={editedData.username}
                onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="E-posta"
                value={editedData.email}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Ad"
                value={editedData.firstName}
                onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Soyad"
                value={editedData.lastName}
                onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Telefon"
                value={editedData.phone}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Konum"
                value={editedData.location}
                onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Hakkımda"
                value={editedData.bio}
                onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                margin="normal"
                multiline
                rows={4}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                İptal
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogActions>
          </>
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // İstatistikler
        return (
          <Grid container spacing={3}>
            {/* Genel İstatistikler */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Genel İstatistikler
                  </Typography>
                    <Button
                      startIcon={<Edit />}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={handleEditStats}
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)'
                        }
                      }}
                    >
                      Düzenle
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                          {userInfo.firstName} {userInfo.lastName}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userStats.matches}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Maç
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userStats.goals}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Gol
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userStats.assists}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Asist
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Oyuncu Bilgileri */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Oyuncu Bilgileri
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Pozisyon
                      </Typography>
                      <Typography variant="body1">
                        {userStats.position || 'Belirtilmemiş'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ayak
                      </Typography>
                      <Typography variant="body1">
                        {userStats.preferredFoot}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Boy
                      </Typography>
                      <Typography variant="body1">
                        {userStats.height || 0} cm
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Kilo
                      </Typography>
                      <Typography variant="body1">
                        {userStats.weight || 0} kg
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Favori Takım
                      </Typography>
                      <Typography variant="body1">
                        {userStats.favoriteTeam || 'Belirtilmemiş'}
                      </Typography>
                  </Grid>
            </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1: // Son Maçlar
        return (
          <List>
            {recentMatches && recentMatches.length > 0 ? (
              <List>
                {recentMatches.map((match, index) => (
                  <React.Fragment key={match._id || index}>
                <ListItem>
                  <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#4CAF50' }}>
                      <SportsSoccer />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {match.team} vs {match.opponent}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                          {match.score}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {match.date}
                          </Typography>
                          <Place sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {match.venue}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                                {match.performance?.goals || match.goals || 0} Gol
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                                {match.performance?.assists || match.assists || 0} Asist
                          </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" mr={0.5}>
                                  Puan:
                                </Typography>
                                <Rating 
                                  value={(match.performance?.rating || match.rating || 0) / 2} 
                                  precision={0.5} 
                                  size="small" 
                                  readOnly 
                                />
                              </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                Henüz kaydedilmiş maç bulunmuyor.
              </Typography>
            )}
          </List>
        );

      case 2: // Öne Çıkanlar
        return (
          <Grid container spacing={2}>
            {highlights.map(highlight => (
              <Grid item xs={12} sm={6} md={4} key={highlight.id}>
                <Card>
                  <CardContent>
                    <Box 
                      sx={{ 
                        height: 200, 
                        bgcolor: 'rgba(0,0,0,0.05)', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        mb: 2,
                        borderRadius: 1
                      }}
                    >
                      {highlight.thumbnail}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {highlight.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <CalendarToday sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {highlight.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.likes} beğeni
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.comments} yorum
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4, mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Profil Kartı - Her iki sekmede de görünecek */}
          <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={userInfo.profilePicture}
                      alt={userInfo.username}
                      sx={{ width: 150, height: 150, mb: 2, boxShadow: 3 }}
                    />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {userInfo.firstName} {userInfo.lastName}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      @{userInfo.username}
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 1, gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip 
                        label={userStats.position || 'Pozisyon belirtilmemiş'} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 'medium' }} 
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={8} md={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mt: 0 }}>
                        Oyuncu Profili
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                        {userInfo.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Place fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {userInfo.location}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {userStats.rating ? (userStats.rating).toFixed(1) : '0'}/10
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'start' }}>
                      {!editMode ? (
                        <Button 
                          variant="contained" 
                          startIcon={<Edit />}
                          onClick={handleEditProfile}
                sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: '#388E3C',
                            fontWeight: 'bold',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                            '&:hover': {
                              backgroundColor: 'white',
                              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s'
                }}
              >
                          Profili Düzenle
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<Save />}
                          onClick={handleSaveProfile}
                sx={{
                            fontWeight: 'bold',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                            '&:hover': {
                              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s'
                }}
              >
                          Kaydet
                        </Button>
                      )}
            </Box>
                  </Box>

                  {/* Ana Sekmeler */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
                    <Tabs 
                      value={mainTabValue} 
                      onChange={handleMainTabChange} 
                      indicatorColor="primary"
                      textColor="primary"
                      sx={{ 
                        '& .MuiTab-root': { 
                          fontWeight: 'medium', 
                          fontSize: '1rem',
                          textTransform: 'none',
                          minWidth: 120,
                          transition: 'all 0.3s',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.05)',
                          }
                        },
                        '& .Mui-selected': {
                          fontWeight: 'bold',
                          color: '#388E3C'
                        }
                      }}
                    >
                      <Tab 
                        icon={<Timeline />} 
                        label="İstatistikler" 
                        iconPosition="start"
                      />
                      <Tab 
                        icon={<Person />} 
                        label="Hesap Ayarları" 
                        iconPosition="start"
                      />
                    </Tabs>
              </Box>
                  
                  {/* Kısaca önemli istatistikler (Ana sekmenin altında) */}
                  {mainTabValue === 0 && (
                    <Box sx={{ display: 'flex', gap: 3, my: 2, mx: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                          {userStats.matches}
              </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Maç
              </Typography>
            </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                          {userStats.goals}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Gol
                        </Typography>
          </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                          {userStats.assists}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Asist
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* İstatistikler Sekmesi İçeriği */}
          {mainTabValue === 0 && (
            <>
              {/* Alt Sekmeler (İstatistikler sekmesinde) */}
              <Box sx={{ mb: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': { 
                      fontSize: '0.9rem',
                      minWidth: 100
                    }
                  }}
                >
                  <Tab label="İstatistikler" />
                  <Tab label="Son Maçlar" />
                  <Tab label="Öne Çıkanlar" />
                </Tabs>
              </Box>
              
              {/* Sekme İçeriği */}
              {renderTabContent()}
            </>
          )}
          
          {/* Hesap Ayarları Sekmesi İçeriği */}
          {mainTabValue === 1 && (
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Hesap Bilgileri
              </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                      label="Kullanıcı Adı"
                      value={editMode ? editedData.username : userInfo.username}
                      onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      value={editMode ? editedData.email : userInfo.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                      label="Ad"
                      value={editMode ? editedData.firstName : userInfo.firstName}
                      onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Soyad"
                      value={editMode ? editedData.lastName : userInfo.lastName}
                      onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      value={editMode ? editedData.phone : userInfo.phone}
                  onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
                />
            </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Konum"
                      value={editMode ? editedData.location : userInfo.location}
                      onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
                    />
          </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Hakkımda"
                      value={editMode ? editedData.bio : userInfo.bio}
                      onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                      disabled={!editMode}
                      multiline
                      rows={4}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
                  Futbol Bilgileri
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" disabled={!editMode}>
                      <InputLabel>Pozisyon</InputLabel>
                      <Select
                        value={editMode ? editedData.position : userStats.position}
                        onChange={(e) => setEditedData({ ...editedData, position: e.target.value })}
                        label="Pozisyon"
                      >
                        <MenuItem value="Kaleci">Kaleci</MenuItem>
                        <MenuItem value="Defans">Defans</MenuItem>
                        <MenuItem value="Orta Saha">Orta Saha</MenuItem>
                        <MenuItem value="Forvet">Forvet</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" disabled={!editMode}>
                      <InputLabel>Tercih Ettiği Ayak</InputLabel>
                      <Select
                        value={editMode ? editedData.preferredFoot : userStats.preferredFoot}
                        onChange={(e) => setEditedData({ ...editedData, preferredFoot: e.target.value })}
                        label="Tercih Ettiği Ayak"
                      >
                        <MenuItem value="Sağ">Sağ</MenuItem>
                        <MenuItem value="Sol">Sol</MenuItem>
                        <MenuItem value="İki Ayak">İki Ayak</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Boy (cm)"
                      type="number"
                      value={editMode ? editedData.height : userStats.height}
                      onChange={(e) => setEditedData({ ...editedData, height: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
          />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Kilo (kg)"
                      type="number"
                      value={editMode ? editedData.weight : userStats.weight}
                      onChange={(e) => setEditedData({ ...editedData, weight: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Favori Takım"
                      value={editMode ? editedData.favoriteTeam : userStats.favoriteTeam}
                      onChange={(e) => setEditedData({ ...editedData, favoriteTeam: e.target.value })}
                      disabled={!editMode}
                      margin="normal"
          />
                  </Grid>
                </Grid>
                
                {editMode && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      sx={{
                        fontWeight: 'bold',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      Kaydet
                    </Button>
      </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      )}
      
      {/* Dialog penceresi */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4CAF50', color: 'white' }}>
          {dialogType === 'match' ? 'Yeni Maç Ekle' : 
           dialogType === 'highlight' ? 'Yeni Öne Çıkan Ekle' : 
           dialogType === 'stats' ? 'İstatistikleri Düzenle' : 'Profili Düzenle'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {renderDialogContent()}
        </DialogContent>
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

export default Profile;
