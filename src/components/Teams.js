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

// Sporyum 23 halı sahasındaki takım verileri
const generateSporyumTeams = () => {
  const teamData = [
    {
      id: 'sim1',
      name: 'Şimşekler',
      logo: 'Ş',
      color: '#9c27b0',
      rating: 4.9,
      formation: '4-3-3',
      style: 'Hücum',
      captain: 'Ahmet',
      founded: 2023,
      matches: 11,
      wins: 6,
      draws: 5,
      losses: 0,
      goalsScored: 28,
      goalsConceded: 12,
      achievements: ['Halı Saha Ligi Şampiyonu', 'Gol Kralı'],
      stats: {
        attack: 92,
        defense: 85,
        teamwork: 94,
        technique: 88,
        speed: 90,
      },
      description: 'Sporyum 23\'ün yıldız takımı, hızlı hücum oyunuyla rakiplerini açık ara geçiyor.',
      homeDay: 'Salı',
      homeTime: '20:00',
      playerCount: 14,
      fieldPreference: 'Saha 1'
    },
    {
      id: 'asl1',
      name: 'Aslanlar SK',
      logo: 'A',
      color: '#d32f2f',
      rating: 4.8,
      formation: '3-5-2',
      style: 'Possession',
      captain: 'Mehmet',
      founded: 2023,
      matches: 8,
      wins: 6,
      draws: 1,
      losses: 1,
      goalsScored: 22,
      goalsConceded: 8,
      achievements: ['Kupa Finalisti', 'En İyi Takım'],
      stats: {
        attack: 88,
        defense: 92,
        teamwork: 90,
        technique: 85,
        speed: 82,
      },
      description: 'Disiplinli defans anlayışı ve kontra atak oyunuyla tanınan tecrübeli ekip.',
      homeDay: 'Perşembe',
      homeTime: '19:00',
      playerCount: 12,
      fieldPreference: 'Saha 3'
    },
    {
      id: 'bog1',
      name: 'Boğalar United',
      logo: 'B',
      color: '#1976d2',
      rating: 4.8,
      formation: '4-2-3-1',
      style: 'Counter-Attack',
      captain: 'Burak',
      founded: 2023,
      matches: 10,
      wins: 7,
      draws: 2,
      losses: 1,
      goalsScored: 25,
      goalsConceded: 10,
      achievements: ['Gol Kralı', 'En İyi Takım'],
      stats: {
        attack: 90,
        defense: 86,
        teamwork: 88,
        technique: 90,
        speed: 87,
      },
      description: 'Teknik oyunculardan kurulu, pas organizasyonlarıyla rakiplerini bunaltan bir takım.',
      homeDay: 'Pazartesi',
      homeTime: '21:00',
      playerCount: 13,
      fieldPreference: 'Saha 2'
    },
    {
      id: 'kar1',
      name: 'Kartallar',
      logo: 'K',
      color: '#2e7d32',
      rating: 4.6,
      formation: '4-4-2',
      style: 'Defans',
      captain: 'Ali',
      founded: 2023,
      matches: 9,
      wins: 5,
      draws: 1,
      losses: 3,
      goalsScored: 18,
      goalsConceded: 12,
      achievements: ['En İyi Savunma'],
      stats: {
        attack: 80,
        defense: 95,
        teamwork: 92,
        technique: 78,
        speed: 75,
      },
      description: 'Sağlam savunma anlayışı ve sert mücadelesiyle tanınan, rakiplerin korkulu rüyası olan ekip.',
      homeDay: 'Cumartesi',
      homeTime: '16:00',
      playerCount: 15,
      fieldPreference: 'Saha 1'
    },
    {
      id: 'yil1',
      name: 'Yıldızlar FC',
      logo: 'Y',
      color: '#ff9800',
      rating: 4.6,
      formation: '3-4-3',
      style: 'Total Football',
      captain: 'Can',
      founded: 2023,
      matches: 7,
      wins: 4,
      draws: 2,
      losses: 1,
      goalsScored: 16,
      goalsConceded: 8,
      achievements: ['Fair Play Ödülü'],
      stats: {
        attack: 85,
        defense: 83,
        teamwork: 95,
        technique: 87,
        speed: 84,
      },
      description: 'Her maçta farklı bir taktik ve oyun anlayışıyla sürpriz yapabilen, yaratıcı bir takım.',
      homeDay: 'Çarşamba',
      homeTime: '18:00',
      playerCount: 11,
      fieldPreference: 'Saha 2'
    }
  ];

  return teamData;
};

function Teams() {
  const [teams, setTeams] = useState(generateSporyumTeams());
  const [sortBy, setSortBy] = useState('rating');

  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'matches') return b.matches - a.matches;
    if (sortBy === 'goals') return (b.goalsScored - b.goalsConceded) - (a.goalsScored - a.goalsConceded);
    return 0;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Başlık ve Açıklama */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          mb: 1, 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Group sx={{ color: '#4CAF50' }} />
          Sporyum 23 Takımları
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Sporyum 23 Halı Saha tesisimizde düzenli olarak maç yapan takımlar ve performans istatistikleri. 
          Yeni rakipler arıyor veya takıma katılmak istiyorsanız iletişime geçebilirsiniz.
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}>
              <CardContent>
                {/* Takım Başlığı */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: team.color,
                      mr: 2,
                      fontWeight: 'bold'
                    }}
                  >
                    {team.logo}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
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
                  <Chip 
                    label={`Saha ${team.matches} Maç`} 
                    color="primary" 
                    size="small" 
                    sx={{ bgcolor: team.color }}
                  />
                </Box>

                {/* Takım Açıklaması */}
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                  "{team.description}"
                </Typography>

                {/* Takım Bilgileri */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <b>Kaptan:</b> {team.captain}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <b>Kuruluş:</b> {team.founded}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <b>Formasyon:</b> {team.formation}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <b>Oyun Stili:</b> {team.style}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <b>Oyuncu Sayısı:</b> {team.playerCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <b>Maç Günü:</b> {team.homeDay} {team.homeTime}
                    </Typography>
                  </Grid>
                </Grid>

                {/* İstatistikler */}
                <Box sx={{ 
                  bgcolor: 'rgba(76, 175, 80, 0.05)', 
                  p: 2, 
                  borderRadius: 2, 
                  mb: 2 
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
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

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Atılan Gol</Typography>
                    <Typography variant="body2" fontWeight="bold">{team.goalsScored}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Yenilen Gol</Typography>
                    <Typography variant="body2" fontWeight="bold">{team.goalsConceded}</Typography>
                  </Box>
                </Box>

                {/* Takım Güç İstatistikleri */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
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
                          <Group sx={{ color: '#4CAF50', mr: 1, fontSize: 20 }} />
                          <LinearProgress 
                            variant="determinate" 
                            value={team.stats.teamwork}
                            sx={{ 
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(76, 175, 80, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#4CAF50'
                              }
                            }} 
                          />
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Teknik">
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Psychology sx={{ color: '#9C27B0', mr: 1, fontSize: 20 }} />
                          <LinearProgress 
                            variant="determinate" 
                            value={team.stats.technique}
                            sx={{ 
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(156, 39, 176, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#9C27B0'
                              }
                            }} 
                          />
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Hız">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Speed sx={{ color: '#FF5722', mr: 1, fontSize: 20 }} />
                          <LinearProgress 
                            variant="determinate" 
                            value={team.stats.speed}
                            sx={{ 
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(255, 87, 34, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#FF5722'
                              }
                            }} 
                          />
                        </Box>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>

                {/* Başarılar */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Başarılar
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {team.achievements.map((achievement, index) => (
                      <Chip 
                        key={index} 
                        icon={<EmojiEvents sx={{ color: 'inherit' }} />} 
                        label={achievement} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255, 193, 7, 0.1)', 
                          borderColor: '#FFC107',
                          color: '#FF8F00',
                          '& .MuiChip-icon': {
                            color: '#FF8F00'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* İletişim Butonu */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ 
                      borderRadius: 20,
                      bgcolor: team.color,
                      '&:hover': {
                        bgcolor: team.color,
                        opacity: 0.9
                      }
                    }}
                  >
                    Takımla İletişime Geç
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Yeni Takım Oluştur */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Kendi takımınızı kurun ve Sporyum 23'te düzenli olarak oynayın!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          sx={{ 
            px: 4, 
            py: 1, 
            borderRadius: 4,
            bgcolor: '#4CAF50',
            '&:hover': {
              bgcolor: '#388E3C'
            }
          }}
        >
          Yeni Takım Oluştur
        </Button>
      </Box>
    </Container>
  );
}

export default Teams;
