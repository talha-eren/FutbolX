import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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
  PhotoCamera, Close, Info, Person, Add,
  Delete, Videocam, Image, TextSnippet, PersonSearch
} from '@mui/icons-material';
import PlayerMatcher from './PlayerMatcher';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  const [userVideos, setUserVideos] = useState([]); // Kullanıcının videoları
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, videoId: null });
  const [playerMatcherOpen, setPlayerMatcherOpen] = useState(false); // Oyuncu eşleştirme dialog'u
  
  // Kullanıcı verileri
  const [userInfo, setUserInfo] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    profilePicture: '',
    phone: '',
    location: '',
    createdAt: ''
  });
  
  const [userStats, setUserStats] = useState({
    matches: 0,
    goals: 0,
    assists: 0,
    rating: 0,
    position: '',
    preferredFoot: 'Sağ',
    footballExperience: 'Başlangıç',
    height: 175,
    weight: 70,
    teams: [],
    achievements: [],
    location: '',
    hoursPlayed: 0,
    favoriteTeam: ''
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
        matches: response.data.matches?.length || response.data.matchesPlayed || 0,
        goals: response.data.goalsScored || 0,
        assists: response.data.assists || 0,
        rating: response.data.rating || 3.5,
        position: response.data.position || '',
        preferredFoot: response.data.preferredFoot || 'Sağ',
        footballExperience: response.data.footballExperience || 'Başlangıç',
        height: response.data.height || 0,
        weight: response.data.weight || 0,
        teams: response.data.teams || [],
        achievements: response.data.achievements || [],
        favoriteTeam: response.data.favoriteTeam || '',
        hoursPlayed: response.data.hoursPlayed || 0
      });
      
      console.log('Yüklenen kullanıcı verileri:', {
        location: response.data.location,
        phone: response.data.phone,
        bio: response.data.bio,
        height: response.data.height,
        weight: response.data.weight,
        favoriteTeam: response.data.favoriteTeam
      });
      
      // localStorage'daki kullanıcı bilgilerini güncelle
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          const updatedUserInfo = {
            ...parsedUserInfo,
            username: response.data.username || parsedUserInfo.username,
            firstName: response.data.firstName || parsedUserInfo.firstName,
            lastName: response.data.lastName || parsedUserInfo.lastName,
            email: response.data.email || parsedUserInfo.email,
            bio: response.data.bio || parsedUserInfo.bio,
            profilePicture: response.data.profilePicture || parsedUserInfo.profilePicture,
            phone: response.data.phone || parsedUserInfo.phone,
            location: response.data.location || parsedUserInfo.location,
            position: response.data.position || parsedUserInfo.position,
            preferredFoot: response.data.preferredFoot || parsedUserInfo.preferredFoot,
            footballExperience: response.data.footballExperience || parsedUserInfo.footballExperience,
            height: response.data.height || parsedUserInfo.height,
            weight: response.data.weight || parsedUserInfo.weight,
            favoriteTeam: response.data.favoriteTeam || parsedUserInfo.favoriteTeam
          };
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        } catch (error) {
          console.error('localStorage kullanıcı bilgileri güncellenemedi:', error);
        }
      }
      
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
  
  // Kullanıcının videolarını çek
  const fetchUserVideos = async () => {
    try {
      const config = getConfig();
      
      if (!config) {
        console.error('Token bulunamadı');
        return;
      }
      
      const response = await axios.get(`${API_URL}/videos/user/my-videos`, config);
      setUserVideos(response.data);
    } catch (error) {
      console.error('Videolar yüklenirken hata oluştu:', error);
      setNotification({
        open: true,
        message: 'Videolarınız yüklenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };
  
  // Sayfa yüklendiğinde kullanıcı verilerini çek
  useEffect(() => {
    fetchUserData();
    fetchUserVideos(); // Kullanıcının videolarını da çek
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Ana sekme değişikliğini yönet
  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  // Profil düzenleme modunu aç
  const handleEditUserInfo = () => {
    // Mevcut kullanıcı bilgilerini editedData'ya kopyala
    setEditedData({
      username: userInfo.username || '',
      email: userInfo.email || '',
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      bio: userInfo.bio || '',
      phone: userInfo.phone || '',
      location: userInfo.location || ''
    });
    
    setDialogType('profile');
    setOpenDialog(true);
  };
  
  // Futbol özelliklerini düzenle
  const handleEditFootballInfo = () => {
    // Mevcut futbol bilgilerini editedData'ya kopyala
    setEditedData({
      position: userStats.position || '',
      preferredFoot: userStats.preferredFoot || 'Sağ',
      footballExperience: userStats.footballExperience || 'Başlangıç',
      height: userStats.height || 0,
      weight: userStats.weight || 0,
      favoriteTeam: userStats.favoriteTeam || ''
    });
    
    setDialogType('football');
    setOpenDialog(true);
  };
  
  // İstatistikleri düzenle
  const handleEditStats = () => {
    console.log("İstatistikleri düzenle");
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
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
      const profileData = {};
      
      // Diyalog tipine göre farklı verileri ekle
      if (dialogType === 'profile') {
        // Temel kullanıcı bilgileri
        profileData.username = editedData.username;
        profileData.email = editedData.email;
        profileData.firstName = editedData.firstName;
        profileData.lastName = editedData.lastName;
        profileData.bio = editedData.bio;
        profileData.phone = editedData.phone;
        profileData.location = editedData.location;
      } else if (dialogType === 'football') {
        // Futbol özellikleri
        profileData.position = editedData.position;
        profileData.preferredFoot = editedData.preferredFoot;
        profileData.footballExperience = editedData.footballExperience;
        profileData.height = Number(editedData.height);
        profileData.weight = Number(editedData.weight);
        profileData.favoriteTeam = editedData.favoriteTeam;
      } else if (dialogType === 'stats') {
        // İstatistik verileri
        profileData.matchesPlayed = Number(editedData.matches);
        profileData.goalsScored = Number(editedData.goals);
        profileData.assists = Number(editedData.assists);
      }
      
      console.log('Gönderilecek profil verileri:', profileData);
      
      // API'ye gönder
      const response = await axios.put(`${API_URL}/auth/profile`, profileData, config);
      
      if (response.data) {
        console.log('Profil güncellemesi başarılı:', response.data);
      
        // State'i güncelle
        if (dialogType === 'profile') {
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
        } else if (dialogType === 'football') {
          setUserStats({
            ...userStats,
            position: editedData.position,
            preferredFoot: editedData.preferredFoot,
            footballExperience: editedData.footballExperience,
            height: Number(editedData.height),
            weight: Number(editedData.weight),
            favoriteTeam: editedData.favoriteTeam
          });
        } else if (dialogType === 'stats') {
          setUserStats({
            ...userStats,
            matches: Number(editedData.matches),
            goals: Number(editedData.goals),
            assists: Number(editedData.assists)
          });
        }
        
        // localStorage'daki kullanıcı bilgilerini güncelle
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            const updatedUserInfo = {
              ...parsedUserInfo,
              username: response.data.username || parsedUserInfo.username,
              firstName: response.data.firstName || parsedUserInfo.firstName,
              lastName: response.data.lastName || parsedUserInfo.lastName,
              email: response.data.email || parsedUserInfo.email,
              bio: response.data.bio || parsedUserInfo.bio,
              profilePicture: response.data.profilePicture || parsedUserInfo.profilePicture,
              phone: response.data.phone || parsedUserInfo.phone,
              location: response.data.location || parsedUserInfo.location,
              position: response.data.position || parsedUserInfo.position,
              preferredFoot: response.data.preferredFoot || parsedUserInfo.preferredFoot,
              footballExperience: response.data.footballExperience || parsedUserInfo.footballExperience,
              height: response.data.height || parsedUserInfo.height,
              weight: response.data.weight || parsedUserInfo.weight,
              favoriteTeam: response.data.favoriteTeam || parsedUserInfo.favoriteTeam
            };
            
            if (response.data.profilePicture) {
              updatedUserInfo.profilePicture = response.data.profilePicture;
            }
            
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
      setOpenDialog(false); // Dialog'u kapat
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
      case 'football':
        return (
          <>
            <DialogTitle>Futbol Özelliklerini Düzenle</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Futbol Deneyimi</InputLabel>
                    <Select
                      value={editedData.footballExperience || 'Başlangıç'}
                      onChange={(e) => setEditedData({ ...editedData, footballExperience: e.target.value })}
                      label="Futbol Deneyimi"
                    >
                      <MenuItem value="Başlangıç">Başlangıç</MenuItem>
                      <MenuItem value="Orta">Orta</MenuItem>
                      <MenuItem value="İleri">İleri</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
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
                    label="Boy (cm)"
                    type="number"
                    value={editedData.height || ''}
                    onChange={(e) => setEditedData({ ...editedData, height: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kilo (kg)"
                    type="number"
                    value={editedData.weight || ''}
                    onChange={(e) => setEditedData({ ...editedData, weight: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12}>
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
      case 0: // Profil Bilgileri
        return (
          <Grid container spacing={3}>
            {/* Kullanıcı Bilgileri */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Kullanıcı Bilgileri
                    </Typography>
                    <Button
                      startIcon={<Edit />}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={handleEditUserInfo}
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
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Ad</Typography>
                          <Typography variant="body1" fontWeight="bold">{userInfo.firstName}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Soyad</Typography>
                          <Typography variant="body1" fontWeight="bold">{userInfo.lastName}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Kullanıcı Adı</Typography>
                          <Typography variant="body1" fontWeight="bold">@{userInfo.username}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">E-posta</Typography>
                          <Typography variant="body1">{userInfo.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Telefon</Typography>
                          <Typography variant="body1">{userInfo.phone || 'Belirtilmemiş'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Konum</Typography>
                          <Typography variant="body1">{userInfo.location || 'Belirtilmemiş'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Üyelik Tarihi</Typography>
                          <Typography variant="body1">
                            {new Date(userInfo.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Hakkımda</Typography>
                          <Typography variant="body1">{userInfo.bio || 'Henüz bir bio eklenmemiş.'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Futbol Özellikleri */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Futbol Özellikleri
                    </Typography>
                    <Button
                      startIcon={<Edit />}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={handleEditFootballInfo}
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
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Pozisyon</Typography>
                        <Typography variant="body1" fontWeight="bold">{userStats.position || 'Belirtilmemiş'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tercih Edilen Ayak</Typography>
                        <Typography variant="body1" fontWeight="bold">{userStats.preferredFoot}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Futbol Deneyimi</Typography>
                        <Typography variant="body1" fontWeight="bold">{userStats.footballExperience}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Boy</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {userStats.height && userStats.height > 0 ? `${userStats.height} cm` : 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Kilo</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {userStats.weight && userStats.weight > 0 ? `${userStats.weight} kg` : 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Favori Takım</Typography>
                        <Typography variant="body1" fontWeight="bold">{userStats.favoriteTeam || 'Belirtilmemiş'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Oyuncu Eşleştirme */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <PersonSearch sx={{ fontSize: 60, mb: 2, color: 'white' }} />
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    🤝 Takım Arkadaşı Bul
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Pozisyonunuza uygun ideal takım arkadaşlarını bulun ve iletişime geçin
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setPlayerMatcherOpen(true)}
                    sx={{
                      bgcolor: 'white',
                      color: '#4CAF50',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={<PersonSearch />}
                  >
                    Oyuncu Eşleştir
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  to="/stats"
                  startIcon={<Timeline />}
                  sx={{ borderRadius: 2 }}
                >
                  Tüm İstatistiklerimi Görüntüle
                </Button>
              </Box>
            </Grid>
          </Grid>
        );

      case 1: // Yaklaşan
        // Mevcut yaklaşan maçlar kodu kalacak
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Henüz yaklaşan maçınız bulunmuyor.
            </Typography>
          </Box>
        );

      case 2: // Geçmiş
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
                {index < recentMatches.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Henüz maç geçmişi bulunmuyor.
                </Typography>
              </Box>
            )}
          </List>
        );

      case 3: // Paylaşımlarım
        return (
          // Paylaşımlarım sekmesi kodu kalacak
          <Box>
            {userVideos.length > 0 ? (
              <Grid container spacing={2}>
                {userVideos.map((video) => (
                  <Grid item xs={12} sm={6} md={4} key={video._id}>
                    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '56.25%', // 16:9 aspect ratio
                          backgroundColor: '#000',
                          '&:hover .overlay': {
                            opacity: 1
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                          alt={video.title}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <Box
                          className="overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s',
                            zIndex: 1
                          }}
                        >
                          <IconButton
                            component={Link}
                            to={`/videos/${video._id}`}
                            color="primary"
                            sx={{
                              bgcolor: 'white',
                              '&:hover': {
                                bgcolor: 'white',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Videocam />
                          </IconButton>
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {video.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {new Date(video.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" color="primary">
                              <Star />
                            </IconButton>
                            <Typography variant="body2">
                              {video.likes?.length || 0}
                            </Typography>
                          </Box>
                          
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(video._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Henüz bir video paylaşımı yapmadınız.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/upload-post"
                  startIcon={<Add />}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Yeni Video Ekle
                </Button>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // Video silme onay dialogunu aç
  const handleOpenDeleteDialog = (videoId) => {
    setConfirmDeleteDialog({
      open: true,
      videoId
    });
  };
  
  // Video silme onay dialogunu kapat
  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog({
      open: false,
      videoId: null
    });
  };
  
  // Video sil
  const handleDeleteVideo = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      await axios.delete(`${API_URL}/videos/${confirmDeleteDialog.videoId}`, config);
      
      // Videoları yeniden çek
      fetchUserVideos();
      
      setNotification({
        open: true,
        message: 'Video başarıyla silindi!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Video silme hatası:', error);
      setNotification({
        open: true,
        message: 'Video silinirken bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  return (
    <Container maxWidth="md">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 5 }}>{error}</Alert>
      ) : (
        <Box sx={{ pb: 6 }}>
          {/* Üst Bilgi Kartı */}
          <Card 
            sx={{ 
              mt: 3, 
              mb: 3, 
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: 2
            }}
          >
            <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={userInfo.profilePicture}
                  alt={`${userInfo.firstName} ${userInfo.lastName}`}
                  sx={{ width: 80, height: 80, mb: 1, border: '2px solid white' }}
                    />
                <Typography variant="h5">
                      {userInfo.firstName} {userInfo.lastName}
                    </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                      @{userInfo.username}
                    </Typography>
                
                {/* İstatistikler */}
                <Box sx={{ 
                  display: 'flex', 
                  width: '100%', 
                  justifyContent: 'space-around',
                  mb: 2 
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{userStats.matches}</Typography>
                    <Typography variant="body2">Maçlar</Typography>
                          </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{userStats.goals}</Typography>
                    <Typography variant="body2">Goller</Typography>
                        </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{userStats.assists}</Typography>
                    <Typography variant="body2">Asistler</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{userStats.hoursPlayed}</Typography>
                    <Typography variant="body2">Saat</Typography>
                      </Box>
                    </Box>
                    
                {/* Butonlar */}
                <Box sx={{ display: 'flex', width: '100%', gap: 1, flexDirection: 'column' }}>
                  {/* İlk satır - 2 buton */}
                  <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="success"
                      component={Link}
                      to="/stats"
                      fullWidth
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.15)', 
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.25)' } 
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timeline />
                        <span>İstatistiklerim</span>
                      </Box>
                    </Button>
                    <Button 
                      variant="outlined"
                      color="inherit" 
                      fullWidth
                      onClick={handleLogout}
                      sx={{
                        borderColor: 'white', 
                        color: 'white',
                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>Çıkış Yap</span>
                      </Box>
                    </Button>
                  </Box>
                  
                  {/* İkinci satır - Oyuncu Eşleştir butonu */}
                  <Button 
                    variant="contained"
                    fullWidth
                    onClick={() => setPlayerMatcherOpen(true)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      mt: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonSearch />
                      <span>Oyuncu Eşleştir</span>
                    </Box>
                  </Button>
                </Box>
                  </Box>
            </CardContent>
          </Card>

          {/* Sekmeler */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
              variant="fullWidth"
                >
              <Tab icon={<Person />} label="Profil" />
              <Tab label="Yaklaşan" />
              <Tab label="Geçmiş" />
              <Tab icon={<Videocam />} label="Paylaşımlarım" />
                </Tabs>
              </Box>
              
          {/* Sekme İçerikleri */}
              {renderTabContent()}
        </Box>
      )}
      
      {/* Dialog penceresi */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4CAF50', color: 'white' }}>
          {dialogType === 'match' ? 'Yeni Maç Ekle' : 
           dialogType === 'highlight' ? 'Yeni Öne Çıkan Ekle' : 
           dialogType === 'stats' ? 'İstatistikleri Düzenle' : 
           dialogType === 'football' ? 'Futbol Özelliklerini Düzenle' : 
           'Profili Düzenle'}
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
      
      {/* Video silme onay dialog'u */}
      <Dialog
        open={confirmDeleteDialog.open}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Paylaşımı Sil
          <IconButton
            aria-label="close"
            onClick={handleCloseDeleteDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, mt: 2 }}>
          <Typography>
            Bu paylaşımı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleDeleteVideo} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sil'}
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

      {/* Oyuncu Eşleştirme Dialog'u */}
      <PlayerMatcher 
        open={playerMatcherOpen}
        onClose={() => setPlayerMatcherOpen(false)}
        userPosition={userStats.position}
        userLocation={userInfo.location}
      />
    </Container>
  );
}

export default Profile;
