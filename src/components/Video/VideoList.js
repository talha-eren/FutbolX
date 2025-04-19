import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Container, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Avatar, 
  IconButton, 
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Favorite, Comment, Visibility, Person } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  
  // Video listesini çek
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        let url = 'http://localhost:5000/api/videos';
        if (category !== 'all') {
          url = `http://localhost:5000/api/videos/category/${category}`;
        }
        
        const response = await axios.get(url);
        setVideos(response.data);
        setError('');
      } catch (err) {
        console.error('Video listesi getirme hatası:', err);
        setError('Videolar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [category]);
  
  // Kategori değişikliği
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };
  
  // Tarih formatla
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Video süresini formatla
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" color="primary">
            Videolar
          </Typography>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={category}
              onChange={handleCategoryChange}
              label="Kategori"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="maç">Maç</MenuItem>
              <MenuItem value="antrenman">Antrenman</MenuItem>
              <MenuItem value="röportaj">Röportaj</MenuItem>
              <MenuItem value="diğer">Diğer</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : videos.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bu kategoride henüz video bulunmuyor.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Link to={`/videos/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={video.thumbnail || `https://source.unsplash.com/random/300x200?football+goal&sig=${video._id}`}
                        alt={video.title}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 8, 
                          right: 8, 
                          bgcolor: 'rgba(0,0,0,0.7)', 
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {video.duration || '1:24'}
                      </Box>
                    </Box>
                  </Link>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Link to={`/videos/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="h6" component="h2" noWrap>
                        {video.title}
                      </Typography>
                    </Link>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Avatar 
                        src={video.uploadedBy?.profilePicture} 
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        <Person fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {video.uploadedBy?.username || 'Kullanıcı'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={video.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      
                      {video.tags && video.tags.slice(0, 2).map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {formatDate(video.createdAt)}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" color="primary">
                        <Favorite fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {video.likes}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" color="primary">
                        <Comment fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {video.comments?.length || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Visibility fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {video.views}
                      </Typography>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default VideoList;
