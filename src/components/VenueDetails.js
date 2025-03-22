import React, { useState } from 'react';
import { Box, Typography, Rating, Button, Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab } from '@mui/material';
import { Place, Star, Close, Share, CalendarMonth, Group, SportsScore } from '@mui/icons-material';
import ReservationSystem from './ReservationSystem';
import TeamFinder from './TeamFinder';
import MatchResults from './MatchResults';

function VenueDetails({ venue, onRate, onShare }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(venue.rating || 0);
  const [activeTab, setActiveTab] = useState(0);

  const handleRating = (event, newValue) => {
    setRating(newValue);
    onRate(newValue);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${venue.name} - FutbolX`,
        text: `${venue.name} halı sahasını FutbolX'te keşfet!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Bağlantı kopyalandı!');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Place color="primary" />
        <Typography 
          variant="body2" 
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => setOpen(true)}
        >
          {venue.name}
        </Typography>
        <IconButton size="small" onClick={handleShare}>
          <Share fontSize="small" />
        </IconButton>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{venue.name}</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
              <Tab icon={<Place />} label="Bilgiler" />
              <Tab icon={<CalendarMonth />} label="Rezervasyon" />
              <Tab icon={<Group />} label="Takım Bul" />
              <Tab icon={<SportsScore />} label="Maçlar" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Puan
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={rating}
                    onChange={handleRating}
                    precision={0.5}
                    icon={<Star fontSize="inherit" />}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({venue.totalRatings} değerlendirme)
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Adres
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {venue.address}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                İletişim
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {venue.phone}
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Place />}
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`, '_blank')}
                sx={{ mt: 2 }}
              >
                Haritada Göster
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ py: 2 }}>
              <ReservationSystem venue={venue} />
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ py: 2 }}>
              <TeamFinder />
            </Box>
          )}

          {activeTab === 3 && (
            <Box sx={{ py: 2 }}>
              <MatchResults />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default VenueDetails;
