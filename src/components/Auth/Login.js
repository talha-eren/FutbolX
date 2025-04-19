import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Link, 
  Alert
} from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL'den yönlendirme parametresini al
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  // Eğer kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      // Eğer bir yönlendirme yolu varsa oraya git, yoksa ana sayfaya git
      navigate(redirectPath || '/');
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
    
    // Basit doğrulama
    if (!formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    // Burada normalde bir API çağrısı yapılacak
    // Başarılı giriş sonrası yönlendirme
    try {
      // API çağrısı simülasyonu
      console.log('Giriş yapılıyor:', formData);
      
      // Gerçek bir API entegrasyonunda burada axios ile backend'e istek atılacak
      // Örnek: const response = await axios.post('/api/auth/login', formData);
      
      // Başarılı giriş için basit simülasyon
      // Gerçek uygulamada burada API'den token alınıp saklanmalı
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', formData.email);
      
      // Giriş başarılı ise, yönlendirme yoluna veya ana sayfaya git
      navigate(redirectPath || '/');
    } catch (err) {
      setError('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      console.error('Giriş hatası:', err);
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Giriş Yap
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
