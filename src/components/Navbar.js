import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Badge, Menu, MenuItem, Avatar, Tooltip,
  Container
} from '@mui/material';
import {
  SportsSoccer, People, EventNote, Home,
  Notifications, Add, Search, AccountCircle
} from '@mui/icons-material';

function Navbar() {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const location = useLocation();

  return (
    <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', height: '70px' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsSoccer sx={{ color: '#4CAF50', fontSize: 32 }} />
              <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold', letterSpacing: 1 }}>
                FutbolX
              </Typography>
            </Link>
          </Box>

          {/* Ana Menü */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={Link}
              to="/"
              startIcon={<Home />}
              sx={{
                color: location.pathname === '/' ? '#4CAF50' : '#1B5E20',
                bgcolor: location.pathname === '/' ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.08)' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Ana Sayfa
            </Button>
            <Button
              component={Link}
              to="/matches"
              startIcon={<EventNote />}
              sx={{
                color: location.pathname === '/matches' ? '#4CAF50' : '#1B5E20',
                bgcolor: location.pathname === '/matches' ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.08)' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Maçlar
            </Button>
            <Button
              component={Link}
              to="/teams"
              startIcon={<People />}
              sx={{
                color: location.pathname === '/teams' ? '#4CAF50' : '#1B5E20',
                bgcolor: location.pathname === '/teams' ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.08)' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Takımlar
            </Button>
            <Button
              component={Link}
              to="/reservations"
              variant="contained"
              startIcon={<Add />}
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#388E3C' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '20px',
                px: 3
              }}
            >
              Rezervasyon
            </Button>
          </Box>

          {/* Sağ Menü */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: '#1B5E20' }}>
              <Search />
            </IconButton>
            
            <IconButton 
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
              sx={{ color: '#1B5E20' }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <Tooltip title="Profil">
              <IconButton 
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ bgcolor: '#4CAF50', width: 35, height: 35 }}>S</Avatar>
              </IconButton>
            </Tooltip>
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
            <MenuItem sx={{ color: 'error.main' }}>Çıkış Yap</MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
