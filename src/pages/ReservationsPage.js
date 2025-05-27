import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import Reservation from '../components/Reservation';

function ReservationsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" color="primary">
          Saha Rezervasyonu
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Sporyum 23 Halı Saha tesislerimizde rezervasyon yapın
        </Typography>
        <Reservation />
      </Box>
    </Container>
  );
}

export default ReservationsPage;
