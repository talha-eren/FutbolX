import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Link, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL'den yönlendirme parametresini al
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');
  
  console.log('Yönlendirme yolu:', redirectPath);

  // Eğer kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (token && isLoggedIn) {
      // Eğer bir yönlendirme yolu varsa oraya git, yoksa ana sayfaya git
      // Yönlendirme yolunun başında "/login" varsa kaldır
      let targetPath = redirectPath || '/';
      if (targetPath && targetPath.startsWith('/login/')) {
        targetPath = targetPath.replace('/login', '');
      }
      
      console.log('Kullanıcı giriş yapmış, yönlendiriliyor:', targetPath);
      navigate(targetPath);
    }
  }, [navigate, redirectPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basit doğrulama
    if (!formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurun');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Giriş denemesi:', formData);
      
      // Backend API'ye giriş isteği gönder
      const response = await axios.post('http://localhost:5000/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API yanıtı:', response.data);
      
      // Başarılı giriş - kullanıcı bilgilerini ve token'i sakla
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify({
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        profilePicture: response.data.profilePicture
      }));
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('Giriş başarılı:', response.data);
      
      // Giriş başarılı ise, yönlendirme yoluna veya ana sayfaya git
      // Yönlendirme yolunun başında "/login" varsa kaldır
      let targetPath = redirectPath || '/';
      if (targetPath && targetPath.startsWith('/login/')) {
        targetPath = targetPath.replace('/login', '');
      }
      
      console.log('Giriş başarılı, yönlendiriliyor:', targetPath);
      navigate(targetPath);
    } catch (err) {
      console.error('Giriş hatası:', err);
      
      // Hata mesajını göster
      if (err.response) {
        console.error('Hata yanıtı:', err.response.data);
        setError(err.response.data.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      } else if (err.request) {
        console.error('Yanıt alınamadı:', err.request);
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Hata:', err.message);
        setError('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
          FutbolX'e Giriş Yap
        </Typography>
        
        {redirectPath && (
          <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
            Bu özelliği kullanmak için giriş yapmanız gerekmektedir.
          </Alert>
        )}
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2">
              Hesabın yok mu? Kaydol
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
