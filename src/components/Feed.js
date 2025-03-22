import React, { useState } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia,
  Typography, Box, Button, IconButton, Avatar,
  TextField, InputAdornment, List, ListItem,
  ListItemAvatar, ListItemText, ListItemSecondary,
  Rating, Chip, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, CardHeader
} from '@mui/material';
import {
  Favorite, FavoriteBorder, Comment, Share,
  Add, Search, Place, Star, SportsSoccer,
  AccessTime, Group, Phone, DirectionsCar,
  Grade
} from '@mui/icons-material';

const venues = [
  {
    id: 1,
    name: 'Yıldız Halı Saha',
    image: '🏟️',
    rating: 4.5,
    totalRatings: 128,
    location: 'Kadıköy, İstanbul',
    price: '400₺/saat',
    distance: '2.5 km',
    features: ['Duş', 'Otopark', 'Kafeterya']
  },
  {
    id: 2,
    name: 'Gol Park',
    image: '🏟️',
    rating: 4.2,
    totalRatings: 95,
    location: 'Ataşehir, İstanbul',
    price: '350₺/saat',
    distance: '3.8 km',
    features: ['Duş', 'Kafeterya']
  },
  {
    id: 3,
    name: 'Futbol Arena',
    image: '🏟️',
    rating: 4.7,
    totalRatings: 156,
    location: 'Üsküdar, İstanbul',
    price: '450₺/saat',
    distance: '4.2 km',
    features: ['Duş', 'Otopark', 'Kafeterya', 'Soyunma Odası']
  }
];

const posts = [
  {
    id: 1,
    username: 'ahmet',
    userAvatar: 'A',
    venue: {
      name: 'Yıldız Halı Saha',
      rating: 4.5,
      totalRatings: 128,
      address: 'Kadıköy, İstanbul',
      phone: '+90 555 123 4567'
    },
    videoUrl: 'video1.mp4',
    thumbnail: '🎥',
    title: 'Harika bir gol',
    description: 'Dün akşam attığım en güzel gol! #futbol #halısaha',
    likes: 156,
    isLiked: false,
    comments: [
      { username: 'mehmet', text: 'Süper gol!' },
      { username: 'ayse', text: 'Tebrikler 👏' }
    ],
    timestamp: '2 saat önce',
    tags: ['#gol', '#futbol', '#halısaha']
  },
  {
    id: 2,
    username: 'mehmet',
    userAvatar: 'M',
    venue: {
      name: 'Gol Park',
      rating: 4.2,
      totalRatings: 95,
      address: 'Ataşehir, İstanbul',
      phone: '+90 555 987 6543'
    },
    videoUrl: 'video2.mp4',
    thumbnail: '🎥',
    title: 'Müthiş kurtarış',
    description: 'Kalede harika bir kurtarış yaptım! #kaleci #futbol',
    likes: 98,
    isLiked: true,
    comments: [
      { username: 'ali', text: 'Harika kurtarış!' }
    ],
    timestamp: '5 saat önce',
    tags: ['#kaleci', '#futbol', '#kurtarış']
  }
];

const randomSkills = [
  'Şut', 'Pas', 'Dribling', 'Hız', 'Kondisyon',
  'Teknik', 'Taktik', 'Kafa', 'Defans', 'Atak'
];

const generateRandomPlayer = () => ({
  id: Math.random().toString(36).substr(2, 9),
  username: ['Ahmet', 'Mehmet', 'Can', 'Ali', 'Burak'][Math.floor(Math.random() * 5)] + Math.floor(Math.random() * 100),
  userAvatar: ['A', 'M', 'C', 'B'][Math.floor(Math.random() * 4)],
  rating: (3 + Math.random() * 2).toFixed(1),
  position: ['Forvet', 'Orta Saha', 'Defans', 'Kaleci'][Math.floor(Math.random() * 4)],
  matchesPlayed: Math.floor(Math.random() * 50) + 10,
  skills: Array.from({ length: 3 }, () => ({
    name: randomSkills[Math.floor(Math.random() * randomSkills.length)],
    level: Math.floor(Math.random() * 3) + 1
  }))
});

function Feed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [players, setPlayers] = useState(Array.from({ length: 6 }, generateRandomPlayer));

  const handleLike = (postId) => {
    // Like işlemi
  };

  const handleComment = (postId, comment) => {
    // Yorum işlemi
  };

  const handleShare = (postId) => {
    // Paylaşım işlemi
  };

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadClose = () => {
    setUploadDialogOpen(false);
    setUploadData({ title: '', description: '', file: null });
  };

  const handleUploadSubmit = () => {
    // Video yükleme işlemi
    handleUploadClose();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10 }}>
      <Grid container spacing={3}>
        {/* Sol Kenar - Halı Sahalar */}
        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Halı Sahaları Keşfet
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Halı saha ara..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <List>
                {venues.map(venue => (
                  <React.Fragment key={venue.id}>
                    <ListItem 
                      button
                      onClick={() => handleVenueClick(venue)}
                      sx={{ 
                        borderRadius: 2,
                        mb: 1,
                        p: 1,
                        transition: 'all 0.2s ease',
                        border: '1px solid',
                        borderColor: 'rgba(0,0,0,0.08)',
                        '&:hover': { 
                          bgcolor: 'rgba(76, 175, 80, 0.08)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h1" sx={{ fontSize: '2rem', mr: 1.5 }}>
                            {venue.image}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                {venue.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Rating value={venue.rating} precision={0.1} size="small" readOnly />
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  ({venue.totalRatings})
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Typography variant="body2" sx={{ 
                                color: '#546e7a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <Place sx={{ fontSize: 14 }} />
                                {venue.location}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#546e7a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <AccessTime sx={{ fontSize: 14 }} />
                                {venue.price}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#546e7a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <DirectionsCar sx={{ fontSize: 14 }} />
                                {venue.distance}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {venue.features.map((feature, index) => (
                            <Chip
                              key={index}
                              label={feature}
                              size="small"
                              sx={{ 
                                height: 24,
                                fontSize: '0.75rem',
                                bgcolor: 'rgba(76, 175, 80, 0.08)',
                                color: '#2e7d32',
                                '&:hover': {
                                  bgcolor: 'rgba(76, 175, 80, 0.15)',
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Ana İçerik - Video Akışı */}
        <Grid item xs={12} md={6}>
          {/* Video Yükleme Butonu */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={handleUploadClick}
            sx={{ 
              mb: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              height: 60,
              borderRadius: 3,
              color: '#4caf50',
              borderColor: '#4caf50',
              '&:hover': { 
                borderStyle: 'dashed', 
                borderWidth: 2,
                bgcolor: 'rgba(76, 175, 80, 0.08)',
                borderColor: '#2e7d32'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Video Yükle
            </Typography>
          </Button>

          {/* Video Akışı */}
          {posts.map(post => (
            <Card key={post.id} sx={{ 
              mb: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      mr: 2, 
                      width: 48, 
                      height: 48,
                      bgcolor: 'primary.main',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    {post.userAvatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: '#1a237e'
                    }}>
                      {post.username}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <Place sx={{ fontSize: 16 }} />
                      {post.venue.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    bgcolor: 'rgba(0,0,0,0.04)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 5
                  }}>
                    {post.timestamp}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  color: '#2e7d32'
                }}>
                  {post.title}
                </Typography>
              </CardContent>

              {/* Video */}
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  bgcolor: 'black',
                  overflow: 'hidden',
                  '& img': {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover img': {
                    transform: 'translate(-50%, -50%) scale(1.05)'
                  }
                }}
              >
                <Typography 
                  variant="h1" 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '4rem'
                  }}
                >
                  {post.thumbnail}
                </Typography>
              </Box>

              <CardContent>
                {/* Etkileşim Butonları */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 1
                }}>
                  <IconButton 
                    onClick={() => handleLike(post.id)}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(244, 67, 54, 0.1)' 
                      }
                    }}
                  >
                    {post.isLiked ? 
                      <Favorite sx={{ color: '#f44336' }} /> : 
                      <FavoriteBorder />
                    }
                  </IconButton>
                  <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
                    {post.likes}
                  </Typography>
                  
                  <IconButton sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(33, 150, 243, 0.1)' 
                    }
                  }}>
                    <Comment sx={{ color: '#2196f3' }} />
                  </IconButton>
                  <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
                    {post.comments.length}
                  </Typography>
                  
                  <IconButton 
                    onClick={() => handleShare(post.id)}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(76, 175, 80, 0.1)' 
                      }
                    }}
                  >
                    <Share sx={{ color: '#4caf50' }} />
                  </IconButton>
                </Box>

                {/* Açıklama */}
                <Typography variant="body1" sx={{ 
                  mb: 2,
                  color: '#37474f',
                  lineHeight: 1.6
                }}>
                  {post.description}
                </Typography>

                {/* Etiketler */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {post.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.08)',
                        color: '#2e7d32',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.15)',
                        }
                      }}
                    />
                  ))}
                </Box>

                {/* Yorumlar */}
                <List sx={{ mt: 2 }}>
                  {post.comments.map((comment, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        px: 0,
                        py: 1,
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.02)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: index % 2 === 0 ? '#1976d2' : '#e91e63',
                          width: 36,
                          height: 36
                        }}>
                          {comment.username[0].toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ color: '#1a237e', fontWeight: 600 }}>
                            {comment.username}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#546e7a' }}>
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Sağ Kenar - Oyuncular */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Oyuncuları Keşfet
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Oyuncu ara..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {players.map(player => (
                  <Card key={player.id} sx={{ 
                    borderRadius: 2,
                    mb: 1.5,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }
                  }}>
                    <Box sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ 
                          width: 40,
                          height: 40,
                          bgcolor: player.userAvatar === 'M' ? '#1976d2' : 
                                         player.userAvatar === 'A' ? '#388e3c' :
                                         player.userAvatar === 'C' ? '#d32f2f' :
                                         player.userAvatar === 'B' ? '#f57c00' : '#7b1fa2'
                        }}>
                          {player.userAvatar}
                        </Avatar>
                        <Box sx={{ ml: 1.5, flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600,
                            color: '#1a237e',
                            fontSize: '0.95rem'
                          }}>
                            {player.username}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Grade sx={{ fontSize: 16, color: '#ffc107' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {player.rating}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={player.position}
                          size="small"
                          sx={{ 
                            height: 24,
                            fontSize: '0.75rem',
                            bgcolor: player.position === 'Forvet' ? '#ef5350' :
                                    player.position === 'Orta Saha' ? '#66bb6a' :
                                    player.position === 'Defans' ? '#42a5f5' :
                                    '#ba68c8',
                            color: 'white'
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          color: '#546e7a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.8rem'
                        }}>
                          <SportsSoccer sx={{ fontSize: 14 }} />
                          {player.matchesPlayed} Maç
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {player.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={`${skill.name} ${Array(skill.level).fill('⭐').join('')}`}
                            size="small"
                            sx={{ 
                              height: 24,
                              fontSize: '0.75rem',
                              bgcolor: 'rgba(76, 175, 80, 0.08)',
                              color: '#2e7d32',
                              '&:hover': {
                                bgcolor: 'rgba(76, 175, 80, 0.12)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
              
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => setPlayers(Array.from({ length: 6 }, generateRandomPlayer))}
              >
                Daha Fazla Oyuncu
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Video Yükleme Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadClose}>
        <DialogTitle>Video Yükle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Başlık"
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Açıklama"
            value={uploadData.description}
            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<Add />}
            sx={{ mt: 2 }}
          >
            Video Seç
            <input
              type="file"
              hidden
              accept="video/*"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose}>İptal</Button>
          <Button onClick={handleUploadSubmit} variant="contained" color="primary">
            Yükle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Feed;
