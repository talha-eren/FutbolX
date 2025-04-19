import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { SportsSoccer } from '@mui/icons-material';

function Footer() {
  return (
    <Box component="footer" sx={{ 
      py: 4, 
      mt: 'auto',
      backgroundColor: '#f8f8f8',
      borderTop: '1px solid #e0e0e0'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <SportsSoccer sx={{ color: '#4CAF50', fontSize: 24, mr: 1 }} />
            <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
              FutbolX
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link component={RouterLink} to="/" sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#4CAF50' } }}>
              Ana Sayfa
            </Link>
            <Link component={RouterLink} to="/matches" sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#4CAF50' } }}>
              Maçlar
            </Link>
            <Link component={RouterLink} to="/teams" sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#4CAF50' } }}>
              Takımlar
            </Link>
            <Link component={RouterLink} to="/reservations" sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#4CAF50' } }}>
              Rezervasyonlar
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 0 } }}>
            © {new Date().getFullYear()} FutbolX. Tüm hakları saklıdır.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#4CAF50' } }}>
              <Typography variant="body2">Gizlilik Politikası</Typography>
            </Link>
            <Link href="#" sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#4CAF50' } }}>
              <Typography variant="body2">Kullanım Şartları</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
