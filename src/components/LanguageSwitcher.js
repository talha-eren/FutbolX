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
        startIcon={<Language />}
        sx={{
          color: 'inherit',
          textTransform: 'none'
        }}
      >
        {currentLanguage.flag} {currentLanguage.name}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
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
