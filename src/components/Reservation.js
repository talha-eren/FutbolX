import React, { useState } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Grid, Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel, Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  SportsSoccer, Place, AccessTime, Group,
  EventNote, Check, Close, ArrowForward
} from '@mui/icons-material';
import { tr } from 'date-fns/locale';

const venues = [
  {
    id: 1,
    name: 'Yıldız Halı Saha',
    location: 'Kadıköy, İstanbul',
    rating: 4.5,
    price: 400,
    image: 'Y',
    features: ['Duş', 'Otopark', 'Kafeterya']
  },
  {
    id: 2,
    name: 'Gol Park',
    location: 'Ataşehir, İstanbul',
    rating: 4.8,
    price: 450,
    image: 'G',
    features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya']
  },
  {
    id: 3,
    name: 'Futbol Arena',
    location: 'Üsküdar, İstanbul',
    rating: 4.3,
    price: 380,
    image: 'F',
    features: ['Duş', 'Soyunma Odası']
  }
];

const timeSlots = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 9; // 09:00'dan başla
  return `${hour.toString().padStart(2, '0')}:00`;
});

function Reservation() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [playerCount, setPlayerCount] = useState(10);
  const [note, setNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const steps = ['Saha Seçimi', 'Tarih ve Saat', 'Detaylar', 'Onay'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setShowConfirmDialog(true);
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    setShowSuccessDialog(true);
    // Burada rezervasyon API çağrısı yapılabilir
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selectedVenue !== null;
      case 1:
        return selectedDate !== null && selectedTime !== null;
      case 2:
        return playerCount >= 10 && playerCount <= 14;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            {venues.map(venue => (
              <Grid item xs={12} md={6} key={venue.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedVenue?.id === venue.id ? 2 : 0,
                    borderColor: '#4CAF50',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      transition: 'all 0.2s'
                    }
                  }}
                  onClick={() => setSelectedVenue(venue)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#4CAF50',
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                        {venue.image}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {venue.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {venue.location}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        {venue.price} ₺
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        / saat
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        {'\u2605'} {venue.rating}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {venue.features.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: '#2E7D32'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Tarih Seçin"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date()}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Saat Seçin</InputLabel>
                  <Select
                    value={selectedTime || ''}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    label="Saat Seçin"
                  >
                    {timeSlots.map(time => (
                      <MenuItem key={time} value={time}>{time}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Oyuncu Sayısı"
                type="number"
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                InputProps={{ inputProps: { min: 10, max: 14 } }}
                helperText="Minimum 10, maksimum 14 oyuncu"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Not"
                multiline
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Eklemek istediğiniz notlar..."
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Rezervasyon Özeti
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Place sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      {selectedVenue?.name} - {selectedVenue?.location}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventNote sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      {selectedDate?.toLocaleDateString('tr-TR')} - {selectedTime}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      {playerCount} Oyuncu
                    </Typography>
                  </Box>
                </Grid>
                
                {note && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Not: {note}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Toplam Ücret: {selectedVenue?.price} ₺
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* Başlık */}
      <Typography variant="h5" sx={{ 
        mb: 4, 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <SportsSoccer sx={{ color: '#4CAF50' }} />
        Saha Rezervasyonu
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* İçerik */}
      <Box sx={{ mb: 4 }}>
        {renderStepContent()}
      </Box>

      {/* Navigasyon Butonları */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {activeStep > 0 && (
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ borderRadius: '20px', textTransform: 'none' }}
          >
            Geri
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isStepValid()}
          sx={{ 
            borderRadius: '20px',
            textTransform: 'none',
            bgcolor: '#4CAF50',
            '&:hover': { bgcolor: '#388E3C' }
          }}
        >
          {activeStep === steps.length - 1 ? 'Rezervasyon Yap' : 'Devam Et'}
        </Button>
      </Box>

      {/* Onay Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Rezervasyonu Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            Rezervasyonu onaylamak istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowConfirmDialog(false)}
            startIcon={<Close />}
          >
            İptal
          </Button>
          <Button 
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            startIcon={<Check />}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      {/* Başarılı Dialog */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Check sx={{ color: '#4CAF50', fontSize: 60, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Rezervasyon Başarılı!
            </Typography>
            <Typography color="text.secondary">
              Rezervasyonunuz başarıyla oluşturuldu. Detayları e-posta adresinize gönderdik.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowSuccessDialog(false)}
            variant="contained"
            color="primary"
            fullWidth
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Reservation;
