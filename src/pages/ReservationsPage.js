import React from 'react';
import { Container, Box, Grid, Card, CardContent, Typography } from '@mui/material';
import ReservationSystem from '../components/ReservationSystem';

function ReservationsPage() {
  const venues = [
    {
      id: 1,
      name: 'Yıldız Halı Saha',
      address: 'Yıldız Mah. Spor Cad. No:1',
      phone: '0532 xxx xx xx'
    },
    {
      id: 2,
      name: 'Yeşil Vadi Halı Saha',
      address: 'Yeşil Vadi Mah. Park Sok. No:5',
      phone: '0535 xxx xx xx'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 10, mb: 4 }}>
        <Grid container spacing={3}>
          {venues.map(venue => (
            <Grid item xs={12} md={6} key={venue.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {venue.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {venue.address}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <ReservationSystem venue={venue} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default ReservationsPage;
