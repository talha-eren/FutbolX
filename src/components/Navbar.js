import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Badge, Menu, MenuItem, Avatar, Tooltip,
  Container
} from '@mui/material';
import {
  SportsSoccer, People, EventNote, Home,
  Notifications, Add, Search, AccountCircle,
  Person
} from '@mui/icons-material';

function Navbar() {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeButton, setActiveButton] = useState('/');
  const location = useLocation();
  const navigate = useNavigate();

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
      borderRadius: '4px',
      padding: '6px 16px',
      '&:hover': { 
        backgroundColor: isActive ? '#4CAF50' : 'rgba(76, 175, 80, 0.08)',
        color: isActive ? '#fff' : '#4CAF50' 
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

          {/* Orta Menü */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/"
              startIcon={<Home />}
              onClick={() => handleButtonClick('/')}
              sx={getButtonStyle('/')}
            >
              Ana Sayfa
            </Button>
            <Button
              component={Link}
              to={isLoggedIn ? "/matches" : "/login?redirect=/matches"}
              startIcon={<EventNote />}
              onClick={() => handleButtonClick('/matches', true)}
              sx={getButtonStyle('/matches')}
            >
              Maçlar
            </Button>
            <Button
              component={Link}
              to={isLoggedIn ? "/teams" : "/login?redirect=/teams"}
              startIcon={<People />}
              onClick={() => handleButtonClick('/teams', true)}
              sx={getButtonStyle('/teams')}
            >
              Takımlar
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
              Rezervasyon
            </Button>
          </Box>

          {/* Sağ Bölüm */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="large">
              <Search sx={{ color: '#555' }} />
            </IconButton>
            
            {isLoggedIn ? (
              <>
                <IconButton 
                  onClick={(e) => setNotificationAnchor(e.currentTarget)}
                >
                  <Badge badgeContent={3} color="error">
                    <Notifications sx={{ color: '#555' }} />
                  </Badge>
                </IconButton>
                
                <IconButton 
                  onClick={(e) => setProfileAnchor(e.currentTarget)}
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ bgcolor: '#4CAF50', width: 32, height: 32 }}>S</Avatar>
                </IconButton>
              </>
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
                Giriş Yap
              </Button>
            )}
          </Box>

          {/* Bildirim Menüsü */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
            sx={{ mt: 2 }}
          >
            <MenuItem sx={{ minWidth: 250 }}>
              <Box>
                <Typography variant="subtitle2">Yeni Rezervasyon Talebi</Typography>
                <Typography variant="caption" color="text.secondary">
                  Ali seni maça davet etti
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem sx={{ minWidth: 250 }}>
              <Box>
                <Typography variant="subtitle2">Maç Hatırlatması</Typography>
                <Typography variant="caption" color="text.secondary">
                  Yarın 18:00'de maçın var
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem sx={{ minWidth: 250 }}>
              <Box>
                <Typography variant="subtitle2">Yeni Yorum</Typography>
                <Typography variant="caption" color="text.secondary">
                  Mehmet golünü beğendi
                </Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* Profil Menüsü */}
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            sx={{ mt: 2 }}
          >
            <MenuItem component={Link} to="/profile">
              <AccountCircle sx={{ mr: 1 }} /> Profilim
            </MenuItem>
            <MenuItem>Ayarlar</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Çıkış Yap</MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
