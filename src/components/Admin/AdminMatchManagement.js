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
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  SportsSoccer as MatchIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import trLocale from 'date-fns/locale/tr';
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

function AdminMatchManagement() {
  // State
  const [matches, setMatches] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form verileri
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    date: new Date(),
    startTime: '19:00',
    endTime: '20:00',
    maxPlayers: 14,
    price: 450,
    status: 'açık',
    description: '',
    isPublic: true,
    teamAName: 'Formalı Takım',
    teamAGoals: 0,
    teamBName: 'Formasız Takım',
    teamBGoals: 0
  });

  // Verilerı yükle
  useEffect(() => {
    loadData();
  }, []);
  
  // Veri yükleme fonksiyonu
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Maçları yükle
      const matchesResponse = await axios.get(`${API_URL}/matches?limit=50`, getConfig() || {});
      
      // Halı sahaları yükle
      const venuesResponse = await axios.get(`${API_URL}/venues`, getConfig() || {});
      
      setMatches(matchesResponse.data.matches || []);
      setVenues(venuesResponse.data || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };
  
  // Form alanlarını değiştirme
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Skor alanları için özel işlem
    if (name === 'teamAGoals' || name === 'teamBGoals') {
      // Sadece sayısal değerlere izin ver
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
      return;
    }
    
    // Takım adı alanları için özel işlem
    if (name === 'teamAName' || name === 'teamBName') {
      // Eğer girilen değer sadece rakamlardan oluşuyorsa, ilgili gol alanını güncelle
      if (/^\d+$/.test(value)) {
        const goalField = name === 'teamAName' ? 'teamAGoals' : 'teamBGoals';
        setFormData({
          ...formData,
          [name]: value,
          [goalField]: value // Aynı değeri gol alanına da ata
        });
        return;
      }
    }
    
    // Diğer tüm alanlar için normal işlem
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Tarih değiştirme
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });
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
      
      // API'ye gönderilecek veriyi oluştur
      const scoreData = {
        teamA: {
          name: 'Formalı Takım',
          goals: Number(formData.teamAGoals) || 0
        },
        teamB: {
          name: 'Formasız Takım',
          goals: Number(formData.teamBGoals) || 0
        }
      };
      
      // Kullanıcı takım adlarını düzgün girdiyse ekle
      if (formData.teamAName && isNaN(Number(formData.teamAName)) && formData.teamAName !== '0') {
        scoreData.teamA.name = formData.teamAName.trim();
      }
      
      if (formData.teamBName && isNaN(Number(formData.teamBName)) && formData.teamBName !== '0') {
        scoreData.teamB.name = formData.teamBName.trim();
      }
      
      // Takım adları olarak sayı girilmişse, bunları skor olarak değerlendir
      if (!isNaN(Number(formData.teamAName)) && formData.teamAName.trim() !== '') {
        scoreData.teamA.goals = Number(formData.teamAName) || 0;
      }
      
      if (!isNaN(Number(formData.teamBName)) && formData.teamBName.trim() !== '') {
        scoreData.teamB.goals = Number(formData.teamBName) || 0;
      }
      
      // Skorların sayı olarak kaydedildiğinden emin ol
      if (isNaN(scoreData.teamA.goals)) scoreData.teamA.goals = 0;
      if (isNaN(scoreData.teamB.goals)) scoreData.teamB.goals = 0;
      
      // Ana veri nesnesini oluştur
      const requestData = {
        title: formData.title,
        venue: formData.venue,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        price: formData.price,
        maxPlayers: formData.maxPlayers,
        status: formData.status,
        isPublic: true,
        score: scoreData
      };
      
      console.log('API\'ye gönderilecek veri:', JSON.stringify(requestData, null, 2));
      
      // Yeni maç oluştur veya güncelle
      let response;
      
      if (currentMatch) {
        // Maçı güncelle
        response = await axios.put(
          `${API_URL}/matches/${currentMatch._id}`,
          requestData,
          config
        );
        
        console.log('Sunucudan gelen yanıt:', JSON.stringify(response.data, null, 2));
        
        setSnackbar({
          open: true,
          message: 'Maç başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        // Yeni maç oluştur
        response = await axios.post(
          `${API_URL}/matches`,
          requestData,
          config
        );
        
        console.log('Sunucudan gelen yanıt:', JSON.stringify(response.data, null, 2));
        
        setSnackbar({
          open: true,
          message: 'Maç başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      // Formu sıfırla ve maçları yeniden yükle
      setFormData({
        title: '',
        venue: '',
        date: new Date(),
        startTime: '19:00',
        endTime: '20:00',
        maxPlayers: 14,
        price: 450,
        status: 'açık',
        isPublic: true,
        teamAName: 'Formalı Takım',
        teamAGoals: 0,
        teamBName: 'Formasız Takım',
        teamBGoals: 0
      });
      
      setCurrentMatch(null);
      setOpenDialog(false);
      
      loadData();
    } catch (error) {
      console.error('Maç kaydedilirken hata:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Maç kaydedilirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Maç düzenleme
  const handleEditMatch = (match) => {
    setCurrentMatch(match);
    setFormData({
      title: match.title,
      venue: match.venue._id,
      date: new Date(match.date),
      startTime: match.startTime,
      endTime: match.endTime,
      maxPlayers: match.maxPlayers,
      price: match.price,
      status: match.status,
      isPublic: match.isPublic,
      teamAName: match.score?.teamA?.name || 'Formalı Takım',
      teamAGoals: Number(match.score?.teamA?.goals) || 0,
      teamBName: match.score?.teamB?.name || 'Formasız Takım',
      teamBGoals: Number(match.score?.teamB?.goals) || 0
    });
    setOpenDialog(true);
  };
  
  // Maç silme
  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Bu maçı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
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
      
      // Maçı sil
      await axios.delete(`${API_URL}/matches/${matchId}`, config);
      
      setSnackbar({
        open: true,
        message: 'Maç başarıyla silindi',
        severity: 'success'
      });
      
      // Maçları yeniden yükle
      loadData();
    } catch (error) {
      console.error('Maç silinirken hata:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Maç silinirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Maç tamamla
  const handleCompleteMatch = async (matchId) => {
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
      
      // Maçı tamamla
      await axios.patch(`${API_URL}/matches/${matchId}/complete`, {}, config);
      
      setSnackbar({
        open: true,
        message: 'Maç başarıyla tamamlandı',
        severity: 'success'
      });
      
      // Maçları yeniden yükle
      loadData();
    } catch (error) {
      console.error('Maç tamamlanırken hata:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Maç tamamlanırken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Maç iptal et
  const handleCancelMatch = async (matchId) => {
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
      
      // Maçı iptal et
      await axios.patch(`${API_URL}/matches/${matchId}/cancel`, {}, config);
      
      setSnackbar({
        open: true,
        message: 'Maç başarıyla iptal edildi',
        severity: 'success'
      });
      
      // Maçları yeniden yükle
      loadData();
    } catch (error) {
      console.error('Maç iptal edilirken hata:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Maç iptal edilirken bir hata oluştu',
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
  
  // Maç tarihini formatlama
  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Halı Saha Maç Skorları Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Halı sahanızda oynanan maçların skorlarını ekleyin, düzenleyin veya silin.
          </Typography>
        </div>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentMatch(null);
            setFormData({
              title: '',
              venue: '',
              date: new Date(),
              startTime: '19:00',
              endTime: '20:00',
              maxPlayers: 14,
              price: 450,
              status: 'açık',
              description: '',
              isPublic: true,
              teamAName: 'Formalı Takım',
              teamAGoals: 0,
              teamBName: 'Formasız Takım',
              teamBGoals: 0
            });
            setOpenDialog(true);
          }}
        >
          Yeni Maç Ekle
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
          {matches.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              Henüz maç bulunmuyor. "Yeni Maç Ekle" butonuna tıklayarak maç oluşturabilirsiniz.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Maç Adı</TableCell>
                    <TableCell>Halı Saha</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Saat</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Skor</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match._id}>
                      <TableCell>{match.title}</TableCell>
                      <TableCell>{match.venue?.name || 'Bilinmiyor'}</TableCell>
                      <TableCell>{formatMatchDate(match.date)}</TableCell>
                      <TableCell>{match.startTime} - {match.endTime}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 
                              match.status === 'açık' ? 'success.light' :
                              match.status === 'dolu' ? 'warning.light' :
                              match.status === 'iptal' ? 'error.light' :
                              match.status === 'tamamlandı' ? 'info.light' : 'grey.light',
                            color: 'white',
                            fontWeight: 'medium',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {match.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {match.status === 'tamamlandı' && match.score ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                            <Typography variant="body2">
                              {match.score.teamA?.name || 'Formalı Takım'}: {match.score.teamA?.goals || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ mx: 0.5 }}>-</Typography>
                            <Typography variant="body2">
                              {match.score.teamB?.name || 'Formasız Takım'}: {match.score.teamB?.goals || 0}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Henüz oynanmadı
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditMatch(match)}
                          title="Düzenle"
                        >
                          <EditIcon />
                        </IconButton>
                        {match.status !== 'tamamlandı' && match.status !== 'iptal' && (
                          <IconButton 
                            color="success" 
                            size="small"
                            onClick={() => handleCompleteMatch(match._id)}
                            title="Tamamla"
                          >
                            <CheckIcon />
                          </IconButton>
                        )}
                        {match.status !== 'iptal' && match.status !== 'tamamlandı' && (
                          <IconButton 
                            color="warning" 
                            size="small"
                            onClick={() => handleCancelMatch(match._id)}
                            title="İptal Et"
                          >
                            <CancelIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteMatch(match._id)}
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
      
      {/* Maç Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentMatch ? (
            currentMatch.status === 'tamamlandı' ? 'Maç Skorunu Düzenle' : 'Maç Bilgilerini Düzenle'
          ) : 'Yeni Maç Ekle'}
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
                  label="Maç Adı"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Örn: Salı Akşamı Maçı"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="venue-label">Halı Saha</InputLabel>
                  <Select
                    labelId="venue-label"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    label="Halı Saha"
                  >
                    {venues.length > 0 ? (
                      venues.map((venue, index) => (
                        <MenuItem key={venue._id} value={venue._id}>
                          {index === 0 ? "Halı Saha 1" : 
                           index === 1 ? "Halı Saha 2" : 
                           index === 2 ? "Halı Saha 3" : venue.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        Halı saha bulunamadı
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                  <DatePicker
                    label="Tarih"
                    value={formData.date}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  label="Başlangıç Saati"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="19:00"
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  label="Bitiş Saati"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="20:00"
                />
              </Grid>
              
              <Grid item xs={6} md={4}>
                <TextField
                  label="Maksimum Oyuncu"
                  name="maxPlayers"
                  type="number"
                  value={formData.maxPlayers}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 2, max: 30 }}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  label="Fiyat (TL)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel id="status-label">Durum</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Durum"
                  >
                    <MenuItem value="açık">Açık</MenuItem>
                    <MenuItem value="dolu">Dolu</MenuItem>
                    <MenuItem value="iptal">İptal</MenuItem>
                    <MenuItem value="tamamlandı">Tamamlandı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Takım isimleri ve skorlar */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                  Takımlar ve Skor
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Formalı Takım
                  </Typography>
                  <TextField
                    label="Takım Adı"
                    name="teamAName"
                    value={formData.teamAName}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Formalı takım adı"
                    variant="filled"
                    sx={{ mb: 2, bgcolor: 'white', borderRadius: 1 }}
                    required
                    defaultValue="Formalı Takım"
                  />
                  <TextField
                    label="Gol Sayısı"
                    name="teamAGoals"
                    type="number"
                    value={formData.teamAGoals}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    variant="filled"
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                    required
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Formasız Takım
                  </Typography>
                  <TextField
                    label="Takım Adı"
                    name="teamBName"
                    value={formData.teamBName}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Formasız takım adı"
                    variant="filled"
                    sx={{ mb: 2, bgcolor: 'white', borderRadius: 1 }}
                    required
                    defaultValue="Formasız Takım"
                  />
                  <TextField
                    label="Gol Sayısı"
                    name="teamBGoals"
                    type="number"
                    value={formData.teamBGoals}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    variant="filled"
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                    required
                  />
                </Paper>
              </Grid>
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
              currentMatch ? (
                currentMatch.status === 'tamamlandı' ? 'Skoru Güncelle' : 'Güncelle'
              ) : 'Ekle'
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

export default AdminMatchManagement; 