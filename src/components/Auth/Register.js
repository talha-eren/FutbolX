import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Link, 
  Alert,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Divider
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '',
    height: '',
    weight: '',
    preferredFoot: 'Sağ',
    favoriteTeam: '',
    birthDate: '',
    location: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeTerms' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Doğrulama kontrolleri
    if (!formData.firstName || !formData.lastName || !formData.username || 
        !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError('Devam etmek için kullanım koşullarını kabul etmelisiniz');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Kayıt denemesi:', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        height: formData.height ? Number(formData.height) : 0,
        weight: formData.weight ? Number(formData.weight) : 0,
        preferredFoot: formData.preferredFoot,
        favoriteTeam: formData.favoriteTeam,
        birthDate: formData.birthDate,
        location: formData.location
      });
      
      // Backend API'ye kayıt isteği gönder
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        height: formData.height ? Number(formData.height) : 0,
        weight: formData.weight ? Number(formData.weight) : 0,
        preferredFoot: formData.preferredFoot,
        favoriteTeam: formData.favoriteTeam,
        birthDate: formData.birthDate,
        location: formData.location
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API yanıtı:', response.data);
      
      // Başarılı kayıt - token'ı ve kullanıcı bilgilerini sakla
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify({
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        profilePicture: response.data.profilePicture
      }));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Kayıt başarılı ise profil sayfasına yönlendir
      navigate('/profile');
    } catch (err) {
      console.error('Kayıt hatası:', err);
      
      // Hata mesajını göster
      if (err.response) {
        console.error('Hata yanıtı:', err.response.data);
        setError(err.response.data.message || 'Kayıt yapılamadı. Lütfen tekrar deneyin.');
      } else if (err.request) {
        console.error('Yanıt alınamadı:', err.request);
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Hata:', err.message);
        setError('Kayıt yapılamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          FutbolX'e Kaydol
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="Ad"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Soyad"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Kullanıcı Adı"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="E-posta Adresi"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Futbol bilgileri bölümü */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Futbol Bilgileri
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="position-label">Pozisyon</InputLabel>
                <Select
                  labelId="position-label"
                  id="position"
                  name="position"
                  value={formData.position}
                  label="Pozisyon"
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="Kaleci">Kaleci</MenuItem>
                  <MenuItem value="Defans">Defans</MenuItem>
                  <MenuItem value="Orta Saha">Orta Saha</MenuItem>
                  <MenuItem value="Forvet">Forvet</MenuItem>
                </Select>
                <FormHelperText>Oynadığınız pozisyon</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="preferred-foot-label">Tercih Edilen Ayak</InputLabel>
                <Select
                  labelId="preferred-foot-label"
                  id="preferredFoot"
                  name="preferredFoot"
                  value={formData.preferredFoot}
                  label="Tercih Edilen Ayak"
                  onChange={handleChange}
                  disabled={loading}
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
                id="height"
                label="Boy (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                disabled={loading}
                InputProps={{ inputProps: { min: 0, max: 250 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="weight"
                label="Kilo (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                disabled={loading}
                InputProps={{ inputProps: { min: 0, max: 150 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="favoriteTeam"
                label="Favori Takım"
                name="favoriteTeam"
                value={formData.favoriteTeam}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="birthDate"
                label="Doğum Tarihi"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="location"
                label="Konum"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Şifre bölümü */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Hesap Bilgileri
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Şifre"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Şifreyi Tekrarla"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox 
                    name="agreeTerms" 
                    color="primary" 
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    disabled={loading}
                  />
                }
                label="Kullanım koşullarını ve gizlilik politikasını kabul ediyorum."
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Kaydol'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Zaten hesabın var mı? Giriş yap
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
