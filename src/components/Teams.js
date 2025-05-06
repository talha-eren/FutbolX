import React, { useState } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Avatar, Chip, Grid, Button, Rating, Divider,
  IconButton, LinearProgress, Tooltip
} from '@mui/material';
import {
  SportsSoccer, EmojiEvents, Star, Group,
  Timeline, Speed, FitnessCenter, Psychology,
  Bolt, Shield, Public, LocalFireDepartment
} from '@mui/icons-material';

// Takım isimleri ve özellikleri için rastgele veri üreten fonksiyon
const generateRandomTeams = () => {
  const teamNames = [
    'Yıldızlar FC', 'Kartallar Spor', 'Aslanlar SK', 'Şimşekler',
    'Boğalar United', 'Atmacalar City', 'Kaplanlar', 'Kartallar',
    'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor'
  ];

  const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2'];
  const styles = ['Hücum', 'Defans', 'Possession', 'Counter-Attack', 'Total Football'];
  const achievements = ['Halı Saha Ligi Şampiyonu', 'Kupa Finalisti', 'Gol Kralı', 'En İyi Takım'];

  return Array.from({ length: 8 }, (_, index) => {
    const wins = Math.floor(Math.random() * 15);
    const draws = Math.floor(Math.random() * 8);
    const losses = Math.floor(Math.random() * 10);
    const totalMatches = wins + draws + losses;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: teamNames[index],
      logo: teamNames[index].charAt(0),
      color: ['#1976d2', '#d32f2f', '#ff9800', '#9c27b0', '#2e7d32', '#795548'][Math.floor(Math.random() * 6)],
      rating: (Math.random() * 2 + 3).toFixed(1),
      formation: formations[Math.floor(Math.random() * formations.length)],
      style: styles[Math.floor(Math.random() * styles.length)],
      captain: ['Ahmet', 'Mehmet', 'Ali', 'Can', 'Burak'][Math.floor(Math.random() * 5)],
      founded: 2020 + Math.floor(Math.random() * 4),
      matches: totalMatches,
      wins,
      draws,
      losses,
      goalsScored: Math.floor(Math.random() * 40) + 20,
      goalsConceded: Math.floor(Math.random() * 30) + 10,
      achievements: Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => achievements[Math.floor(Math.random() * achievements.length)]
      ),
      stats: {
        attack: Math.floor(Math.random() * 30) + 70,
        defense: Math.floor(Math.random() * 30) + 70,
        teamwork: Math.floor(Math.random() * 30) + 70,
        technique: Math.floor(Math.random() * 30) + 70,
        speed: Math.floor(Math.random() * 30) + 70,
      }
    };
  });
};

function Teams() {
  const [teams, setTeams] = useState(generateRandomTeams());
  const [sortBy, setSortBy] = useState('rating');

  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'matches') return b.matches - a.matches;
    if (sortBy === 'goals') return (b.goalsScored - b.goalsConceded) - (a.goalsScored - a.goalsConceded);
    return 0;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* Başlık ve Sıralama */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Group sx={{ color: '#4CAF50' }} />
          Takımlar
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={sortBy === 'rating' ? 'contained' : 'outlined'}
            onClick={() => setSortBy('rating')}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              bgcolor: sortBy === 'rating' ? '#4CAF50' : 'transparent',
              '&:hover': { bgcolor: sortBy === 'rating' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
            }}
          >
            Rating'e Göre
          </Button>
          <Button
            variant={sortBy === 'matches' ? 'contained' : 'outlined'}
            onClick={() => setSortBy('matches')}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              bgcolor: sortBy === 'matches' ? '#4CAF50' : 'transparent',
              '&:hover': { bgcolor: sortBy === 'matches' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
            }}
          >
            Maç Sayısına Göre
          </Button>
          <Button
            variant={sortBy === 'goals' ? 'contained' : 'outlined'}
            onClick={() => setSortBy('goals')}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              bgcolor: sortBy === 'goals' ? '#4CAF50' : 'transparent',
              '&:hover': { bgcolor: sortBy === 'goals' ? '#388E3C' : 'rgba(76, 175, 80, 0.08)' }
            }}
          >
            Gol Averajına Göre
          </Button>
        </Box>
      </Box>

      {/* Takım Kartları */}
      <Grid container spacing={3}>
        {sortedTeams.map(team => (
          <Grid item xs={12} md={6} key={team.id}>
            <Card sx={{ 
              borderRadius: 3,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}>
              <CardContent>
                {/* Takım Başlığı */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: team.color,
                      mr: 2
                    }}
                  >
                    {team.logo}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {team.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={parseFloat(team.rating)} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({team.rating})
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Takım Bilgileri */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Kaptan: {team.captain}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Kuruluş: {team.founded}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Formasyon: {team.formation}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Oyun Stili: {team.style}
                    </Typography>
                  </Grid>
                </Grid>

                {/* İstatistikler */}
                <Box sx={{ bgcolor: 'rgba(76, 175, 80, 0.05)', p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Sezon İstatistikleri
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">{team.wins}</Typography>
                        <Typography variant="caption" color="text.secondary">Galibiyet</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main">{team.draws}</Typography>
                        <Typography variant="caption" color="text.secondary">Beraberlik</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="error.main">{team.losses}</Typography>
                        <Typography variant="caption" color="text.secondary">Mağlubiyet</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Takım Güç İstatistikleri */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Takım Gücü
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Tooltip title="Hücum">
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Bolt sx={{ color: '#F57C00', mr: 1, fontSize: 20 }} />
                          <LinearProgress 
                            variant="determinate" 
                            value={team.stats.attack} 
                            sx={{ 
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(245, 124, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#F57C00'
                              }
                            }} 
                          />
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Defans">
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Shield sx={{ color: '#1976D2', mr: 1, fontSize: 20 }} />
                          <LinearProgress 
                            variant="determinate" 
                            value={team.stats.defense}
                            sx={{ 
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(25, 118, 210, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#1976D2'
                              }
                            }}
                          />
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Takım Oyunu">
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Psychology sx={{ color: '#7B1FA2', mr: 1, fontSize: 20 }} />
                          <LinearProgress 
                            variant="determinate" 
                            value={team.stats.teamwork}
                            sx={{ 
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(123, 31, 162, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#7B1FA2'
                              }
                            }}
                          />
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Teknik">
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FitnessCenter sx={{ color: '#388E3C', mr: 1, fontSize: 20 }} />
                          <LinearProgress 
                            variant="determinate" 
                            value={team.stats.technique}
                            sx={{ 
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(56, 142, 60, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#388E3C'
                              }
                            }}
                          />
                        </Box>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>

                {/* Başarılar */}
                {team.achievements.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Başarılar
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {team.achievements.map((achievement, index) => (
                          <Chip
                            key={index}
                            icon={<EmojiEvents sx={{ color: '#FFD700' }} />}
                            label={achievement}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(255, 215, 0, 0.1)',
                              '& .MuiChip-label': { color: '#B7950B' }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Yenile Butonu */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setTeams(generateRandomTeams())}
          sx={{ 
            borderRadius: '20px',
            textTransform: 'none',
            px: 4
          }}
        >
          Takımları Yenile
        </Button>
      </Box>
    </Container>
  );
}

export default Teams;
