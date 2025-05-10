import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Language } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    handleClose();
  };
  
  // Şu anki dili bul
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<Language sx={{ fontSize: 20, color: '#4CAF50' }} />}
        sx={{
          color: '#555',
          textTransform: 'none',
          bgcolor: 'rgba(76,175,80,0.08)',
          borderRadius: '24px',
          padding: '6px 16px',
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          '&:hover': {
            bgcolor: 'rgba(76,175,80,0.12)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: '1.2rem' }}>{currentLanguage.flag}</span> 
          <span style={{ fontWeight: 500 }}>{currentLanguage.name}</span>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiMenu-paper': {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: '150px',
            overflow: 'hidden'
          },
          '& .MuiMenuItem-root': {
            padding: '10px 16px',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.08)'
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(76, 175, 80, 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.2)'
              }
            }
          }
        }}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
          >
            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
              {lang.flag}
            </ListItemIcon>
            <ListItemText primary={lang.name} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default LanguageSwitcher;
