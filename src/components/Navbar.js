import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Badge, Menu, MenuItem, Avatar, Tooltip,
  Container, Divider, ListItemIcon
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
  const [userInfo, setUserInfo] = useState({ username: '', firstName: '', lastName: '' });
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
    
    // Kullanıcı bilgilerini localStorage'dan al
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Kullanıcı bilgileri ayrıştırılamadı:', error);
      }
    }
    
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
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
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
      mx: 0.7,
      borderRadius: '28px',
      padding: isActive ? '8px 18px' : '6px 16px',
      fontSize: '0.95rem',
      fontWeight: isActive ? 600 : 500,
      letterSpacing: 0.2,
      textTransform: 'capitalize',
      boxShadow: isActive ? '0 4px 12px rgba(76,175,80,0.2)' : 'none',
      transition: 'all 0.3s ease',
      minWidth: 90,
      border: isActive ? 'none' : 'none',
      '&:hover': {
        backgroundColor: isActive ? '#43a047' : 'rgba(76, 175, 80, 0.08)',
        color: isActive ? '#fff' : '#388e3c',
        boxShadow: isActive ? '0 6px 14px rgba(76,175,80,0.25)' : '0 2px 8px rgba(76,175,80,0.1)',
        transform: 'translateY(-2px)'
      }
    };
  };

  // Kullanıcının baş harfini al
  const getUserInitial = () => {
    if (userInfo && userInfo.firstName && userInfo.firstName.length > 0) {
      return userInfo.firstName.charAt(0).toUpperCase();
    } else if (userInfo && userInfo.username && userInfo.username.length > 0) {
      return userInfo.username.charAt(0).toUpperCase();
    }
    return 'K';
  };

  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: 'white', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      borderBottom: '1px solid rgba(0,0,0,0.06)' 
    }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 0.5 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} onClick={() => handleButtonClick('/')}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mr: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}>
              <SportsSoccer sx={{ 
                color: '#4CAF50', 
                fontSize: 28, 
                mr: 1,
                filter: 'drop-shadow(0 2px 4px rgba(76,175,80,0.2))'
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#4CAF50', 
                  fontWeight: 'bold', 
                  fontSize: '1.3rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                FutbolX
              </Typography>
            </Box>
          </Link>

          {/* Menü - Ana Sayfa ve diğerleri yan yana */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 0.5,
            ml: 2
          }}>
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
                border: activeButton === '/reservations' ? 'none' : '1px solid #4CAF50',
                backgroundColor: activeButton === '/reservations' ? '#4CAF50' : 'rgba(76, 175, 80, 0.08)',
                color: activeButton === '/reservations' ? '#fff' : '#388e3c',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: activeButton === '/reservations' ? '#43a047' : 'rgba(76, 175, 80, 0.15)',
                  color: activeButton === '/reservations' ? '#fff' : '#388e3c',
                  boxShadow: '0 4px 12px rgba(76,175,80,0.2)',
                  transform: 'translateY(-2px)'
                }
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
                to="/upload-post"
                startIcon={<CloudUpload />}
                onClick={() => handleButtonClick('/upload-post', true)}
                sx={{
                  ...getButtonStyle('/upload-post'),
                  border: activeButton === '/upload-post' ? 'none' : '1px solid #4CAF50',
                  backgroundColor: activeButton === '/upload-post' ? '#4CAF50' : 'rgba(76, 175, 80, 0.08)',
                  color: activeButton === '/upload-post' ? '#fff' : '#388e3c',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: activeButton === '/upload-post' ? '#43a047' : 'rgba(76, 175, 80, 0.15)',
                    color: activeButton === '/upload-post' ? '#fff' : '#388e3c',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 20px rgba(76,175,80,0.15)'
                  }
                }}
              >
                {t('navbar.postShare')}
              </Button>
            )}
          </Box>

          {/* Sağ Bölüm */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    backgroundColor: 'rgba(76, 175, 80, 0.12)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    '&:hover': { 
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 15px rgba(76, 175, 80, 0.25)'
                    },
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 10px rgba(76, 175, 80, 0.15)'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: '#4CAF50', 
                      width: 40, 
                      height: 40,
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      backgroundImage: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                      {getUserInitial()}
                    </Typography>
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
                  backgroundColor: activeButton === '/login' ? '#4CAF50' : 'rgba(76,175,80,0.1)',
                  ml: 1,
                  borderRadius: '28px',
                  padding: '8px 20px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  boxShadow: activeButton === '/login' ? '0 4px 12px rgba(76,175,80,0.2)' : 'none',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: activeButton === '/login' ? '#43a047' : 'rgba(76, 175, 80, 0.2)',
                    color: activeButton === '/login' ? '#fff' : '#388e3c',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.2)',
                    transform: 'translateY(-2px)'
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
              bgcolor: 'rgba(76, 175, 80, 0.85)', 
              color: 'white', 
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              backgroundImage: 'linear-gradient(to right, #4CAF50, #2E7D32)',
              position: 'relative'
            }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '100%',
                  background: 'url(https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=400&auto=format&fit=crop)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.15,
                  zIndex: 0
                }}
              />
              <Avatar 
                sx={{ 
                  bgcolor: 'white', 
                  color: '#4CAF50', 
                  mr: 1.5, 
                  width: 48, 
                  height: 48,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  zIndex: 1
                }}
              >
                {getUserInitial()}
              </Avatar>
              <Box sx={{ zIndex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {userInfo.username || 'Kullanıcı'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      px: 1.5, 
                      py: 0.3, 
                      borderRadius: 10, 
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <SportsSoccer sx={{ fontSize: 14, mr: 0.5 }} /> Futbolcu
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ py: 1 }}>
              <MenuItem component={Link} to="/profile" sx={{ mt: 0.5 }}>
                <ListItemIcon>
                  <AccountCircle sx={{ color: '#666' }} /> 
                </ListItemIcon>
                <Typography variant="body1">Profilim</Typography>
              </MenuItem>
              
              <MenuItem component={Link} to="/stats" sx={{ my: 0.5 }}>
                <ListItemIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#666">
                    <path d="M3 3v17a1 1 0 0 0 1 1h17v-2H5V3H3z"/>
                    <path d="M15.293 14.707a.999.999 0 0 0 1.414 0l5-5-1.414-1.414L16 12.586l-2.293-2.293a.999.999 0 0 0-1.414 0l-5 5 1.414 1.414L13 12.414l2.293 2.293z"/>
                  </svg>
                </ListItemIcon>
                <Typography variant="body1">İstatistiklerim</Typography>
              </MenuItem>

              <Divider sx={{ my: 1, opacity: 0.6 }} />
              
              <MenuItem component={Link} to="/settings" sx={{ my: 0.5 }}>
                <ListItemIcon>
                  <Person sx={{ color: '#666' }} /> 
                </ListItemIcon>
                <Typography variant="body1">Hesap Ayarları</Typography>
              </MenuItem>
              
              <MenuItem onClick={handleLogout} sx={{ color: '#E53935', my: 0.5, mb: 0.5 }}>
                <ListItemIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#E53935">
                    <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h7v2H5v14h7v2Zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5Z"/>
                  </svg>
                </ListItemIcon>
                <Typography variant="body1" fontWeight="medium">Çıkış Yap</Typography>
              </MenuItem>
            </Box>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
