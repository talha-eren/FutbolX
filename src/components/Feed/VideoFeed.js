import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Button
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Comment as CommentIcon, 
  Share,
  MoreVert,
  Visibility,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

function VideoFeed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Görünürlük izleme için ref
  const { ref, inView } = useInView({
    threshold: 0.7,
  });
  
  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
  }, []);
  
  // Videoları çek
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/videos');
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
  }, []);
  
  // Tarih formatla
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Beğeni ekle
  const handleLike = async (videoId, index) => {
    if (!isLoggedIn) {
      return;
    }
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return;
      }
      
      const response = await axios.post(`http://localhost:5000/api/videos/${videoId}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Beğeni sayısını güncelle
      const updatedVideos = [...videos];
      updatedVideos[index].likes = response.data.likes;
      setVideos(updatedVideos);
    } catch (err) {
      console.error('Beğeni hatası:', err);
    }
  };
  
  // Sesi aç/kapat
  const toggleMute = () => {
    setMuted(!muted);
  };
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary" sx={{ mb: 4 }}>
        Keşfet
      </Typography>
      
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
          Henüz video bulunmuyor.
        </Alert>
      ) : (
        videos.map((video, index) => (
          <Card 
            key={video._id} 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            ref={index === activeVideoIndex ? ref : null}
          >
            <CardHeader
              avatar={
                <Avatar 
                  src={video.uploadedBy?.profilePicture} 
                  alt={video.uploadedBy?.username || 'Kullanıcı'}
                >
                  {video.uploadedBy?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              }
              action={
                <IconButton aria-label="settings">
                  <MoreVert />
                </IconButton>
              }
              title={
                <Link to={`/profile/${video.uploadedBy?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {video.uploadedBy?.username || 'Kullanıcı'}
                  </Typography>
                </Link>
              }
              subheader={formatDate(video.createdAt)}
            />
            
            <Box sx={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
              <ReactPlayer
                url={`http://localhost:5000${video.filePath}`}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                playing={index === activeVideoIndex && inView}
                muted={muted}
                loop
                controls={false}
                playsinline
              />
              
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  right: 16,
                  zIndex: 1
                }}
              >
                <IconButton 
                  onClick={toggleMute} 
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  {muted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
              </Box>
              
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  left: 16,
                  zIndex: 1
                }}
              >
                <Chip 
                  label={video.duration} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </Box>
            
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                <Link to={`/videos/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {video.title}
                </Link>
              </Typography>
              
              <Typography variant="body2" color="text.secondary" noWrap>
                {video.description}
              </Typography>
              
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={video.category} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                
                {video.tags && video.tags.slice(0, 3).map((tag, idx) => (
                  <Chip 
                    key={idx} 
                    label={tag} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="primary" 
                  onClick={() => handleLike(video._id, index)}
                  disabled={!isLoggedIn}
                >
                  {video.liked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {video.likes}
                </Typography>
                
                <IconButton 
                  color="primary" 
                  component={Link} 
                  to={`/videos/${video._id}`}
                  sx={{ ml: 1 }}
                >
                  <CommentIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {video.comments?.length || 0}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="primary">
                  <Share />
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Visibility fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {video.views}
                  </Typography>
                </Box>
              </Box>
            </CardActions>
            
            <Divider />
            
            <Box sx={{ p: 2 }}>
              <Button 
                fullWidth 
                component={Link} 
                to={`/videos/${video._id}`}
                color="primary"
              >
                Tüm Yorumları Gör
              </Button>
            </Box>
          </Card>
        ))
      )}
    </Box>
  );
}

export default VideoFeed;
