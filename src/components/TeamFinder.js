import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, Card, CardContent, Avatar, Chip, Grid, IconButton } from '@mui/material';
import { Group, WhatsApp, PersonAdd, Star, SportsScore, AccessTime } from '@mui/icons-material';

function TeamFinder() {
  const [open, setOpen] = useState(false);
  const [teams] = useState([
    {
      id: 1,
      name: 'Yıldızlar FC',
      level: 'Orta',
      players: 4,
      neededPlayers: 2,
      time: '20:00',
      venue: 'Yıldız Halı Saha',
      rating: 4.5,
      contact: '0532xxxxxxx',
      matchHistory: '7G 2B 1M'
    },
    {
      id: 2,
      name: 'Kartallar Spor',
      level: 'İyi',
      players: 5,
      neededPlayers: 1,
      time: '21:00',
      venue: 'Yeşil Vadi Halı Saha',
      rating: 4.8,
      contact: '0535xxxxxxx',
      matchHistory: '8G 1B 1M'
    }
  ]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'Başlangıç': return '#4CAF50';
      case 'Orta': return '#2196F3';
      case 'İyi': return '#FFC107';
      case 'Pro': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Group />}
        onClick={() => setOpen(true)}
        fullWidth
      >
        Takım Bul
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group />
            <Typography>Aktif Takımlar</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {teams.map(team => (
              <Grid item xs={12} key={team.id}>
                <Card sx={{ 
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  },
                  transition: 'all 0.2s ease'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getLevelColor(team.level), width: 56, height: 56 }}>
                          {team.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{team.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {team.time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • {team.venue}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Chip 
                          label={`${team.neededPlayers} Oyuncu Aranıyor`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip
                        icon={<Star sx={{ color: getLevelColor(team.level) }} />}
                        label={`Seviye: ${team.level}`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<SportsScore />}
                        label={team.matchHistory}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Mevcut: {team.players} Oyuncu
                      </Typography>
                      <Box>
                        <IconButton color="success" href={`https://wa.me/${team.contact}`} target="_blank">
                          <WhatsApp />
                        </IconButton>
                        <Button
                          variant="contained"
                          startIcon={<PersonAdd />}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          Katıl
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TeamFinder;
