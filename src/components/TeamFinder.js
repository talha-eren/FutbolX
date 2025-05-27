import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, Card, CardContent, Avatar, Chip, Grid, IconButton, CircularProgress, Alert } from '@mui/material';
import { Group, WhatsApp, PersonAdd, Star, SportsScore, AccessTime } from '@mui/icons-material';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:5000/api';

// Token'ı localStorage'dan al
const getToken = () => {
  return localStorage.getItem('userToken');
};

// API isteği için config oluştur
const getConfig = () => {
  const token = getToken();
  if (!token) {
    console.error('Token bulunamadı');
    return null;
  }
  
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
};

function TeamFinder() {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Takımları getir
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/teams`);
      console.log('Takımlar yüklendi:', response.data);
      
      setTeams(response.data);
    } catch (error) {
      console.error('Takımlar yüklenirken hata:', error);
      setError('Takımlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Dialog açıldığında takımları getir
  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  // Takıma katıl
  const joinTeam = async (teamId) => {
    try {
      const config = getConfig();
      
      if (!config) {
        alert('Bu işlemi gerçekleştirmek için giriş yapmalısınız.');
        return;
      }
      
      // API'ye katılma isteği gönder
      await axios.post(
        `${API_URL}/teams/${teamId}/players`, 
        { playerId: JSON.parse(localStorage.getItem('userInfo'))._id },
        config
      );
      
      // Takım listesini güncelle
      fetchTeams();
      
      alert('Takıma katılma isteğiniz gönderildi!');
    } catch (error) {
      console.error('Takıma katılırken hata:', error);
      alert('Takıma katılırken bir hata oluştu.');
    }
  };

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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : teams.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>Şu an aktif takım bulunmuyor.</Alert>
          ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {teams.map(team => (
                <Grid item xs={12} key={team._id}>
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
                                {team.preferredTime}
                            </Typography>
                              {team.venue && (
                            <Typography variant="body2" color="text.secondary">
                                  • {team.venue.name}
                            </Typography>
                              )}
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
                          Mevcut: {team.currentPlayerCount} Oyuncu
                      </Typography>
                      <Box>
                          {team.contactNumber && (
                            <IconButton 
                              color="success" 
                              href={`https://wa.me/90${team.contactNumber.replace(/\D/g, '').replace(/^0/, '')}`} 
                              target="_blank"
                            >
                          <WhatsApp />
                        </IconButton>
                          )}
                        <Button
                          variant="contained"
                          startIcon={<PersonAdd />}
                          size="small"
                          sx={{ ml: 1 }}
                            onClick={() => joinTeam(team._id)}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TeamFinder;
