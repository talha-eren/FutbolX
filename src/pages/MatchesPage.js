import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import MatchResults from '../components/MatchResults';

function MatchesPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
          Sporyum 23 Maç Skorları
        </Typography>
        <MatchResults />
      </Box>
    </Container>
  );
}

export default MatchesPage;
