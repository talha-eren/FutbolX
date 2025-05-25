import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Avatar,
  Slider,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import axios from 'axios';

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

function AdminTeamsManagement() {
  // State
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
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
    isApproved: true,
    stats: {
      attack: 50,
      defense: 50,
      speed: 50,
      teamwork: 50
    },
    matches: []
  });

  // Verilerı yükle
  useEffect(() => {
    // Kullanıcı bilgilerini al
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error('Kullanıcı bilgileri çözümlenemedi:', error);
      }
    }
    
    loadData();
  }, []);
  
  // Veri yükleme fonksiyonu
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      console.log('Admin takımlar sayfası - Veri yükleniyor...');
      
      // Takımları yükle
      console.log('Takımlar isteği gönderiliyor...');
      const teamsResponse = await axios.get(`${API_URL}/teams`, config);
      
      console.log(`${teamsResponse.data ? teamsResponse.data.length : 0} takım yüklendi`);
      if (teamsResponse.data && teamsResponse.data.length > 0) {
        console.log('Takım isimleri:', teamsResponse.data.map(t => t.name));
      }
      
      // Halı sahaları yükle
      const venuesResponse = await axios.get(`${API_URL}/venues`, config);
      console.log(`${venuesResponse.data ? venuesResponse.data.length : 0} halı saha yüklendi`);
      
      // Verileri state'e kaydet
      setTeams(teamsResponse.data || []);
      setVenues(venuesResponse.data || []);
      
      console.log('Veriler başarıyla yüklendi');
      setLoading(false);
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
      
      // Hata detaylarını logla
      if (error.response) {
        console.error('Sunucu yanıtı:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('İstek yapıldı ancak yanıt alınamadı:', error.request);
      } else {
        console.error('İstek yapılırken hata:', error.message);
      }
      
      if (error.response && error.response.status === 401) {
        setError('Oturumunuz sonlanmış görünüyor. Lütfen tekrar giriş yapın.');
        // Token'ı temizle ve kullanıcıyı login sayfasına yönlendir
        localStorage.removeItem('userToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login?redirect=/admin/teams';
        }, 2000);
      } else {
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.');
      }
      
      setLoading(false);
    }
  };
  
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
    try {
      setLoading(true);
      
      const config = getConfig();
      if (!config) {
        setSnackbar({
          open: true,
          message: 'Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Takım verilerini hazırla - geçerli bir venue değeri olduğundan emin ol
      const teamData = {
        ...formData,
        // Boş venue değerini null olarak gönder
        venue: formData.venue === '' ? null : formData.venue,
        // isApproved değerini ekle
        isApproved: formData.isApproved === undefined ? true : formData.isApproved
      };
      
      console.log('Gönderilecek takım verileri:', teamData);
      
      // Yeni takım oluştur veya güncelle
      let response;
      
      if (currentTeam) {
        // Takımı güncelle
        response = await axios.put(
          `${API_URL}/teams/${currentTeam._id}`,
          teamData,
          config
        );
        
        setSnackbar({
          open: true,
          message: 'Takım başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        // Yeni takım oluştur
        response = await axios.post(
          `${API_URL}/teams`,
          teamData,
          config
        );
        
        setSnackbar({
          open: true,
          message: 'Takım başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      console.log('API yanıtı:', response.data);
      
      // Formu sıfırla ve takımları yeniden yükle
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
          district: 'Sporyum 23'
        },
        isApproved: true,
        stats: {
          attack: 50,
          defense: 50,
          speed: 50,
          teamwork: 50
        },
        matches: []
      });
      
      setCurrentTeam(null);
      setOpenDialog(false);
      
      // Takımları yeniden yükle
      loadData();
      
    } catch (error) {
      console.error('Takım kaydedilirken hata:', error);
      
      // Detaylı hata mesajını görüntüle
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Takım kaydedilirken bir hata oluştu';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Takım düzenleme
  const handleEditTeam = (team) => {
    setCurrentTeam(team);
    setFormData({
      name: team.name,
      level: team.level,
      neededPlayers: team.neededPlayers,
      preferredTime: team.preferredTime,
      contactNumber: team.contactNumber || '',
      description: team.description || '',
      venue: team.venue?._id || '',
      regularPlayDays: team.regularPlayDays || [],
      location: {
        city: team.location?.city || 'İstanbul',
        district: team.location?.district || ''
      },
      isApproved: team.isApproved,
      stats: team.stats || {
        attack: 50,
        defense: 50,
        speed: 50,
        teamwork: 50
      },
      matches: team.matches || []
    });
    setOpenDialog(true);
  };
  
  // Takım silme
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Bu takımı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const config = getConfig();
      if (!config) {
        setSnackbar({
          open: true,
          message: 'Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Takımı sil
      await axios.delete(`${API_URL}/teams/${teamId}`, config);
      
      setSnackbar({
        open: true,
        message: 'Takım başarıyla silindi',
        severity: 'success'
      });
      
      // Takımları yeniden yükle
      loadData();
    } catch (error) {
      console.error('Takım silinirken hata:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Takım silinirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Takım seviyesine göre renk belirle
  const getLevelColor = (level) => {
    switch (level) {
      case 'Başlangıç':
        return '#4caf50'; // Yeşil
      case 'Orta':
        return '#2196f3'; // Mavi
      case 'İyi':
        return '#ff9800'; // Turuncu
      case 'Pro':
        return '#f44336'; // Kırmızı
      default:
        return '#9e9e9e'; // Gri
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Takım Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Halı sahanızda oynayan takımları ekleyin, düzenleyin veya silin.
          </Typography>
        </div>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentTeam(null);
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
              isApproved: true,
              stats: {
                attack: 50,
                defense: 50,
                speed: 50,
                teamwork: 50
              },
              matches: []
            });
            setOpenDialog(true);
          }}
        >
          Yeni Takım Ekle
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}
      
      {!loading && !error && (
        <>
          {teams.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              Henüz takım bulunmuyor. "Yeni Takım Ekle" butonuna tıklayarak takım oluşturabilirsiniz.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Takım Adı</TableCell>
                    <TableCell>Seviye</TableCell>
                    <TableCell>Oyuncu Sayısı</TableCell>
                    <TableCell>Oyuncu İhtiyacı</TableCell>
                    <TableCell>Halı Saha</TableCell>
                    <TableCell>Maç Günleri</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            bgcolor: getLevelColor(team.level), 
                            width: 30, 
                            height: 30,
                            mr: 1,
                            fontSize: '0.875rem'
                          }}>
                            {team.name.charAt(0).toUpperCase()}
                          </Avatar>
                          {team.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={team.level} 
                          size="small" 
                          sx={{ 
                            bgcolor: getLevelColor(team.level),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>{team.players?.length || 0}</TableCell>
                      <TableCell>
                        {team.neededPlayers > 0 ? (
                          <Chip 
                            label={`${team.neededPlayers} oyuncu`} 
                            size="small" 
                            color="warning"
                          />
                        ) : (
                          <Chip 
                            label="Tamamlandı" 
                            size="small" 
                            color="success"
                          />
                        )}
                      </TableCell>
                      <TableCell>{team.venue?.name || 'Belirtilmemiş'}</TableCell>
                      <TableCell>
                        {team.regularPlayDays && team.regularPlayDays.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {team.regularPlayDays.map((day) => (
                              <Chip 
                                key={day} 
                                label={day} 
                                size="small" 
                                variant="outlined" 
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          'Belirtilmemiş'
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditTeam(team)}
                          title="Düzenle"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteTeam(team._id)}
                          title="Sil"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      {/* Takım Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTeam ? 'Takım Düzenle' : 'Yeni Takım Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
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
                    {venues.map((venue, index) => (
                      <MenuItem key={venue._id} value={venue._id}>
                        {index === 0 ? "Halı Saha 1" : 
                         index === 1 ? "Halı Saha 2" : 
                         index === 2 ? "Halı Saha 3" : venue.name}
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
                  Takım Özellikleri ve İstatistikleri
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
              
              {userInfo && userInfo.role === 'admin' && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isApproved}
                        onChange={(e) => setFormData({
                          ...formData,
                          isApproved: e.target.checked
                        })}
                        name="isApproved"
                      />
                    }
                    label="Takımı Onayla (Takımlar sayfasında görünür)"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (
              currentTeam ? 'Güncelle' : 'Ekle'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirim */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminTeamsManagement; 