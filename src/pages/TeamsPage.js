import React from 'react';
import { Container, Box } from '@mui/material';
import TeamFinder from '../components/TeamFinder';

function TeamsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 10, mb: 4 }}>
        <TeamFinder />
      </Box>
    </Container>
  );
}

export default TeamsPage;
