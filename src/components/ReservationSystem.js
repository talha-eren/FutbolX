import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { CalendarMonth, AccessTime, SportsSoccer } from '@mui/icons-material';

function ReservationSystem({ venue }) {
  const [open, setOpen] = useState(false);
  const [reservation, setReservation] = useState({
    date: '',
    time: '',
    duration: 1,
    teamSize: '6v6'
  });

  const availableTimes = [
    '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', 
    '20:00', '21:00', '22:00', '23:00'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Backend entegrasyonu burada yapılacak
    console.log('Rezervasyon:', reservation);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CalendarMonth />}
        onClick={() => setOpen(true)}
        fullWidth
      >
        Saha Rezervasyonu Yap
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsSoccer />
            <Typography>{venue.name} - Rezervasyon</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tarih"
                  value={reservation.date}
                  onChange={(e) => setReservation({ ...reservation, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Saat</InputLabel>
                  <Select
                    value={reservation.time}
                    label="Saat"
                    onChange={(e) => setReservation({ ...reservation, time: e.target.value })}
                  >
                    {availableTimes.map(time => (
                      <MenuItem key={time} value={time}>{time}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Süre (Saat)</InputLabel>
                  <Select
                    value={reservation.duration}
                    label="Süre (Saat)"
                    onChange={(e) => setReservation({ ...reservation, duration: e.target.value })}
                  >
                    <MenuItem value={1}>1 Saat</MenuItem>
                    <MenuItem value={1.5}>1.5 Saat</MenuItem>
                    <MenuItem value={2}>2 Saat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Saha Boyutu</InputLabel>
                  <Select
                    value={reservation.teamSize}
                    label="Saha Boyutu"
                    onChange={(e) => setReservation({ ...reservation, teamSize: e.target.value })}
                  >
                    <MenuItem value="6v6">6v6 (Küçük Saha)</MenuItem>
                    <MenuItem value="7v7">7v7 (Orta Saha)</MenuItem>
                    <MenuItem value="8v8">8v8 (Büyük Saha)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fiyat: {reservation.duration * 300} TL
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Rezervasyon Yap
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ReservationSystem;
