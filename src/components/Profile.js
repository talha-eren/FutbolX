import React, { useState } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Grid, Avatar, Button, Tab, Tabs, Divider,
  List, ListItem, ListItemAvatar, ListItemText,
  ListItemSecondary, IconButton, Chip, Rating,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField
} from '@mui/material';
import {
  SportsSoccer, Edit, EmojiEvents, Timeline,
  Group, Star, Place, CalendarToday, Save,
  PhotoCamera, Close
} from '@mui/icons-material';

const userStats = {
  matches: 52,
  goals: 34,
  assists: 18,
  rating: 4.5,
  position: 'Orta Saha',
  foot: 'Sağ',
  height: 180,
  weight: 75,
  teams: ['Galatasaray Alt Yapı', 'FutbolX FC'],
  achievements: [
    'En İyi Orta Saha 2024',
    'Ayın Oyuncusu (Nisan 2025)',
    'Asist Kralı 2024',
    'FutbolX Turnuvası Şampiyonu'
  ]
};

const recentMatches = [
  {
    id: 1,
    date: '14 Mart 2024',
    venue: 'Yıldız Halı Saha',
    team: 'Yıldızlar FC',
    opponent: 'Kartallar Spor',
    score: '3-2',
    performance: {
      goals: 2,
      assists: 1,
      rating: 4.8
    }
  },
  {
    id: 2,
    date: '10 Mart 2024',
    venue: 'Gol Park',
    team: 'Yıldızlar FC',
    opponent: 'Aslanlar SK',
    score: '2-2',
    performance: {
      goals: 1,
      assists: 0,
      rating: 4.2
    }
  },
  {
    id: 3,
    date: '5 Mart 2024',
    venue: 'Futbol Arena',
    team: 'Yıldızlar FC',
    opponent: 'Şimşekler',
    score: '4-1',
    performance: {
      goals: 2,
      assists: 1,
      rating: 4.5
    }
  }
];

const highlights = [
  {
    id: 1,
    title: 'Harika Gol',
    date: '14 Mart 2024',
    likes: 156,
    comments: 23,
    thumbnail: '🎥'
  },
  {
    id: 2,
    title: 'Müthiş Asist',
    date: '10 Mart 2024',
    likes: 98,
    comments: 12,
    thumbnail: '🎥'
  },
  {
    id: 3,
    title: 'Hat-trick',
    date: '5 Mart 2024',
    likes: 245,
    comments: 45,
    thumbnail: '🎥'
  }
];

function Profile() {
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editedData, setEditedData] = useState({});
  const [userInfo, setUserInfo] = useState({
    username: 'talhaeren',
    firstName: 'Talha',
    lastName: 'Eren',
    email: 'bilikcitalha@gmail.com',
    bio: 'Futbol tutkunu, orta saha oyuncusu. Galatasaray alt yapısından yetişme. FutbolX platformunun kurucusu.',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    setEditMode(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // İstatistikler
        return (
          <Grid container spacing={3}>
            {/* Genel İstatistikler */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Genel İstatistikler
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                          {userInfo.firstName} {userInfo.lastName}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userStats.matches}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Maç
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userStats.goals}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Gol
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userStats.assists}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Asist
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Oyuncu Bilgileri */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Oyuncu Bilgileri
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Pozisyon
                      </Typography>
                      <Typography variant="body1">
                        {userStats.position}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ayak
                      </Typography>
                      <Typography variant="body1">
                        {userStats.foot}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Boy
                      </Typography>
                      <Typography variant="body1">
                        {userStats.height} cm
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Kilo
                      </Typography>
                      <Typography variant="body1">
                        {userStats.weight} kg
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Başarılar */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Başarılar
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {userStats.achievements.map((achievement, index) => (
                      <Chip
                        key={index}
                        icon={<EmojiEvents sx={{ color: '#FFD700' }} />}
                        label={achievement}
                        sx={{ 
                          bgcolor: 'rgba(255, 215, 0, 0.1)',
                          '& .MuiChip-label': { color: '#B7950B' }
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1: // Son Maçlar
        return (
          <List>
            {recentMatches.map(match => (
              <React.Fragment key={match.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <SportsSoccer />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {match.team} vs {match.opponent}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                          {match.score}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {match.date}
                          </Typography>
                          <Place sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {match.venue}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {match.performance.goals} Gol
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {match.performance.assists} Asist
                          </Typography>
                          <Rating value={match.performance.rating} precision={0.1} size="small" readOnly />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        );

      case 2: // Öne Çıkanlar
        return (
          <Grid container spacing={2}>
            {highlights.map(highlight => (
              <Grid item xs={12} sm={6} md={4} key={highlight.id}>
                <Card>
                  <CardContent>
                    <Box 
                      sx={{ 
                        height: 200, 
                        bgcolor: 'rgba(0,0,0,0.05)', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        mb: 2,
                        borderRadius: 1
                      }}
                    >
                      {highlight.thumbnail}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {highlight.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <CalendarToday sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {highlight.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.likes} beğeni
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.comments} yorum
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* Profil Başlığı */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={userInfo.profilePicture}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  bgcolor: 'primary.main',
                  fontSize: 56
                }}
              >
                {userInfo.firstName ? userInfo.firstName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <PhotoCamera />
              </IconButton>
            </Box>
            <Box sx={{ ml: 3, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {userInfo.firstName} {userInfo.lastName}
                </Typography>
                <Button
                  startIcon={editMode ? <Save /> : <Edit />}
                  variant="outlined"
                  size="small"
                  onClick={editMode ? handleSaveProfile : handleEditProfile}
                >
                  {editMode ? 'Kaydet' : 'Düzenle'}
                </Button>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                @{userInfo.username}
              </Typography>
              <Typography variant="body1">
                {userInfo.bio}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* İletişim Bilgileri */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                E-posta
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  size="small"
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography variant="body1">
                  {userInfo.email}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Telefon
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  size="small"
                  value={editedData.phone}
                  onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography variant="body1">
                  {userInfo.phone || '+90 555 123 4567'}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sekmeler */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<Timeline sx={{ mr: 1 }} />}
            label="İstatistikler"
            iconPosition="start"
          />
          <Tab 
            icon={<SportsSoccer sx={{ mr: 1 }} />}
            label="Son Maçlar"
            iconPosition="start"
          />
          <Tab 
            icon={<Star sx={{ mr: 1 }} />}
            label="Öne Çıkanlar"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Sekme İçeriği */}
      {renderTabContent()}
    </Container>
  );
}

export default Profile;
