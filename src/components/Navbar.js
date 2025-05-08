import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Badge, Menu, MenuItem, Avatar, Tooltip,
  Container, Divider
} from '@mui/material';
import {
  SportsSoccer, People, EventNote, Home,
  Notifications, Add, Search, AccountCircle,
  Person, VideoLibrary, CloudUpload
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function Navbar() {
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeButton, setActiveButton] = useState('/');
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
    
    // URL'den aktif butonu belirleme
    const path = location.pathname;
    console.log('Mevcut sayfa yolu:', path);
    
    if (path === '/') setActiveButton('/');
    else if (path.includes('matches')) setActiveButton('/matches');
    else if (path.includes('teams')) setActiveButton('/teams');
    else if (path.includes('reservations')) setActiveButton('/reservations');
    else if (path.includes('videos') && !path.includes('upload-video')) setActiveButton('/videos');
    else if (path.includes('upload-video')) setActiveButton('/upload-video');
    else if (path.includes('login')) {
      // Yönlendirme parametresi varsa, o sayfanın butonunu aktif et
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      console.log('Yönlendirme parametresi:', redirect);
      
      if (redirect && redirect.includes('/matches')) setActiveButton('/matches');
      else if (redirect && redirect.includes('/teams')) setActiveButton('/teams');
      else if (redirect && redirect.includes('/reservations')) setActiveButton('/reservations');
      else setActiveButton('/login');
    }
  }, [location]);

  // Çıkış işlemi
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setProfileAnchor(null);
    navigate('/login');
  };

  // Buton tıklama işleyicisi - doğrudan state güncelleme
  const handleButtonClick = (path, isProtected) => {
    setActiveButton(path);
    if (isProtected && !isLoggedIn) {
      // Giriş yapmamış kullanıcıları yönlendirirken bile butonu aktif et
      localStorage.setItem('lastActiveButton', path);
      console.log('Korumalı rota için son aktif buton kaydedildi:', path);
    }
  };

  // Buton stillerini oluşturan fonksiyon
  const getButtonStyle = (path) => {
    const isActive = activeButton === path;
    return {
      color: isActive ? '#fff' : '#555',
      backgroundColor: isActive ? '#4CAF50' : 'transparent',
      mx: 1,
      borderRadius: '6px',
      padding: '6px 18px',
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: 0.2,
      textTransform: 'capitalize',
      boxShadow: isActive ? '0 2px 8px rgba(76,175,80,0.08)' : 'none',
      transition: 'all 0.2s',
      minWidth: 90,
      '&:hover': {
        backgroundColor: isActive ? '#43a047' : 'rgba(76, 175, 80, 0.08)',
        color: isActive ? '#fff' : '#388e3c',
        boxShadow: '0 2px 8px rgba(76,175,80,0.14)'
      }
    };
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
      <Container maxWidth="lg">
        <Toolbar>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} onClick={() => handleButtonClick('/')}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SportsSoccer sx={{ color: '#4CAF50', fontSize: 24, mr: 1 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#4CAF50', 
                  fontWeight: 'bold', 
                  fontSize: '1.2rem' 
                }}
              >
                FutbolX
              </Typography>
            </Box>
          </Link>

          {/* Menü - Ana Sayfa ve diğerleri yan yana */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Button
              component={Link}
              to="/"
              startIcon={<Home />}
              onClick={() => handleButtonClick('/')}
              sx={getButtonStyle('/')}
            >
              {t('common.home')}
            </Button>
            <Button
              component={Link}
              to={isLoggedIn ? "/matches" : "/login?redirect=/matches"}
              startIcon={<EventNote />}
              onClick={() => handleButtonClick('/matches', true)}
              sx={getButtonStyle('/matches')}
            >
              {t('common.matches')}
            </Button>
            <Button
              component={Link}
              to={isLoggedIn ? "/teams" : "/login?redirect=/teams"}
              startIcon={<People />}
              onClick={() => handleButtonClick('/teams', true)}
              sx={getButtonStyle('/teams')}
            >
              {t('common.teams')}
            </Button>
            <Button
              component={Link}
              to={isLoggedIn ? "/reservations" : "/login?redirect=/reservations"}
              startIcon={<Add />}
              onClick={() => handleButtonClick('/reservations', true)}
              sx={{
                ...getButtonStyle('/reservations'),
                border: activeButton === '/reservations' ? 'none' : '1px solid #4CAF50'
              }}
            >
              {t('common.reservation')}
            </Button>
            <Button
              component={Link}
              to="/videos"
              startIcon={<VideoLibrary />}
              onClick={() => handleButtonClick('/videos')}
              sx={getButtonStyle('/videos')}
            >
              {t('common.videos')}
            </Button>
            {isLoggedIn && (
              <Button
                component={Link}
                to="/upload-video"
                startIcon={<CloudUpload />}
                onClick={() => handleButtonClick('/upload-video', true)}
                sx={{
                  ...getButtonStyle('/upload-video'),
                  border: activeButton === '/upload-video' ? 'none' : '1px solid #4CAF50'
                }}
              >
                {t('common.uploadVideo')}
              </Button>
            )}
          </Box>

          {/* Sağ Bölüm */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LanguageSwitcher />
            
            {isLoggedIn ? (
              <Box 
                sx={{ 
                  ml: 2,
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
              >
                <IconButton 
                  onClick={(e) => setProfileAnchor(e.currentTarget)}
                  sx={{ 
                    p: 0.5, 
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    '&:hover': { 
                      backgroundColor: 'rgba(76, 175, 80, 0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: '#4CAF50', 
                      width: 38, 
                      height: 38,
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    S
                  </Avatar>
                </IconButton>
              </Box>
            ) : (
              <Button
                component={Link}
                to="/login"
                startIcon={<Person />}
                onClick={() => handleButtonClick('/login')}
                sx={{
                  color: activeButton === '/login' ? '#fff' : '#4CAF50',
                  backgroundColor: activeButton === '/login' ? '#4CAF50' : 'transparent',
                  borderColor: '#4CAF50',
                  ml: 1,
                  borderRadius: '4px',
                  padding: '6px 16px',
                  '&:hover': { 
                    backgroundColor: activeButton === '/login' ? '#4CAF50' : 'rgba(76, 175, 80, 0.08)',
                    color: activeButton === '/login' ? '#fff' : '#4CAF50'
                  }
                }}
              >
                {t('common.login')}
              </Button>
            )}
          </Box>

          {/* Profil Menüsü */}
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            sx={{ 
              mt: 2,
              '& .MuiMenu-paper': {
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                minWidth: '200px',
                overflow: 'hidden'
              },
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.08)'
                }
              }
            }}
          >
            <Box sx={{ 
              bgcolor: '#4CAF50', 
              color: 'white', 
              p: 2,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Avatar sx={{ bgcolor: 'white', color: '#4CAF50', mr: 1.5 }}>S</Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Kullanıcı Adı
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Futbolcu
                </Typography>
              </Box>
            </Box>
            <MenuItem component={Link} to="/profile" sx={{ mt: 1 }}>
              <AccountCircle sx={{ mr: 1.5, color: '#555' }} /> 
              <Typography variant="body1">Profilim</Typography>
            </MenuItem>
            <Divider sx={{ my: 1, opacity: 0.6 }} />
            <MenuItem>
              <Person sx={{ mr: 1.5, color: '#555' }} /> 
              <Typography variant="body1">Hesap Ayarları</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', mb: 1 }}>
              <Box sx={{ mr: 1.5, width: 24, height: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="#f44336">
                  <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h7v2H5v14h7v2Zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5Z"/>
                </svg>
              </Box>
              <Typography variant="body1">Çıkış Yap</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
