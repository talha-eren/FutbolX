import React from 'react';
import { Container, Box } from '@mui/material';
import MatchResults from '../components/MatchResults';

function MatchesPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 10, mb: 4 }}>
        <MatchResults />
      </Box>
    </Container>
  );
}

export default MatchesPage;
