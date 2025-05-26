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
    footballExperience: 'Başlangıç',
    preferredFoot: 'Sağ',
    location: '',
    phone: '',
    bio: '',
    height: '',
    weight: '',
    favoriteTeam: '',
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
      // Sayısal değerleri Number türüne çevir
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        footballExperience: formData.footballExperience,
        preferredFoot: formData.preferredFoot,
        location: formData.location,
        phone: formData.phone,
        bio: formData.bio,
        height: formData.height && formData.height !== '' ? Number(formData.height) : 0,
        weight: formData.weight && formData.weight !== '' ? Number(formData.weight) : 0,
        favoriteTeam: formData.favoriteTeam
      };
      
      console.log('Kayıt için hazırlanan veri:', userData);
      console.log('Form verisi:', formData);
      console.log('Gönderilecek veriler detayı:', {
        location: formData.location,
        phone: formData.phone,
        bio: formData.bio,
        height: formData.height,
        weight: formData.weight,
        favoriteTeam: formData.favoriteTeam
      });
      
      // Backend API'ye kayıt isteği gönder
      const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API yanıtı:', response.data);
      
      // Başarılı kayıt - token'ı ve kullanıcı bilgilerini sakla
      localStorage.setItem('userToken', response.data.token);
      
      // Tüm kullanıcı bilgilerini localStorage'a kaydet
      const userInfoToStore = {
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        profilePicture: response.data.profilePicture || '',
        position: response.data.position || '',
        footballExperience: response.data.footballExperience || 'Başlangıç',
        preferredFoot: response.data.preferredFoot || 'Sağ',
        location: response.data.location || '',
        phone: response.data.phone || '',
        bio: response.data.bio || '',
        height: response.data.height ? Number(response.data.height) : 0,
        weight: response.data.weight ? Number(response.data.weight) : 0,
        favoriteTeam: response.data.favoriteTeam || ''
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfoToStore));
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
            {/* Temel Bilgiler */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Temel Bilgiler
              </Typography>
              <Divider />
            </Grid>
            
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
            
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Şifreyi Onayla"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Futbol Profil Bilgileri */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Futbol Profil Bilgileri
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={4}>
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
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="footballExperience-label">Futbol Deneyimi</InputLabel>
                <Select
                  labelId="footballExperience-label"
                  id="footballExperience"
                  name="footballExperience"
                  value={formData.footballExperience}
                  label="Futbol Deneyimi"
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value="Başlangıç">Başlangıç</MenuItem>
                  <MenuItem value="Orta">Orta</MenuItem>
                  <MenuItem value="İleri">İleri</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="preferredFoot-label">Ayak Tercihi</InputLabel>
                <Select
                  labelId="preferredFoot-label"
                  id="preferredFoot"
                  name="preferredFoot"
                  value={formData.preferredFoot}
                  label="Ayak Tercihi"
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value="Sağ">Sağ</MenuItem>
                  <MenuItem value="Sol">Sol</MenuItem>
                  <MenuItem value="Her İkisi">Her İkisi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* İletişim ve Kişisel Bilgiler */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                İletişim ve Kişisel Bilgiler
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="location"
                label="Konum (Şehir/İlçe)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                label="Telefon Numarası"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="bio"
                label="Kısa Biyografi"
                name="bio"
                multiline
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                disabled={loading}
              />
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
                InputProps={{ inputProps: { min: 0 } }}
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
                InputProps={{ inputProps: { min: 0 } }}
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
                label="Kullanım koşullarını ve gizlilik politikasını kabul ediyorum"
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
            {loading ? <CircularProgress size={24} /> : 'Kayıt Ol'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
                Zaten bir hesabınız var mı? Giriş yap
            </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
