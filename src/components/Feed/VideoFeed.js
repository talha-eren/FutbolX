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
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Comment as CommentIcon, 
  Share,
  MoreVert,
  Visibility,
  VolumeUp,
  VolumeOff,
  PlayArrow,
  Pause,
  FastForward,
  FastRewind,
  Delete,
  Edit
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState({});
  const [playedSeconds, setPlayedSeconds] = useState({});
  const [duration, setDuration] = useState({});
  const [seeking, setSeeking] = useState(false);
  
  const playerRefs = useRef({});
  
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
        
        // İlk başta tüm videoları durdurulmuş olarak ayarla
        const playingState = {};
        response.data.forEach(video => {
          playingState[video._id] = false;
        });
        
        setVideos(response.data);
        setIsPlaying(playingState);
        setPlayedSeconds({});
        setDuration({});
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
  
  // Menü işlemleri
  const handleMenuOpen = (event, video) => {
    setAnchorEl(event.currentTarget);
    setSelectedVideo(video);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Silme dialogu
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };
  
  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
  };
  
  // Video silme
  const handleDeleteVideo = async () => {
    if (!selectedVideo || !isLoggedIn) return;
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      
      await axios.delete(`http://localhost:5000/api/videos/${selectedVideo._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Silinen videoyu listeden kaldır
      setVideos(videos.filter(v => v._id !== selectedVideo._id));
      handleDeleteClose();
    } catch (err) {
      console.error('Video silme hatası:', err);
    }
  };
  
  // Video oynatma kontrolü
  const togglePlay = (videoId) => {
    setIsPlaying(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };
  
  // Videonun ilerlemesini izle
  const handleProgress = (videoId, state) => {
    if (!seeking) {
      setPlayedSeconds(prev => ({
        ...prev,
        [videoId]: state.playedSeconds
      }));
    }
  };
  
  // Videonun süresini ayarla
  const handleDuration = (videoId, duration) => {
    setDuration(prev => ({
      ...prev,
      [videoId]: duration
    }));
  };
  
  // Sliderı sürüklerken
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };
  
  // Sliderı hareket ettirirken
  const handleSeekChange = (videoId, value) => {
    setPlayedSeconds(prev => ({
      ...prev,
      [videoId]: value
    }));
  };
  
  // Sliderı bıraktığımızda
  const handleSeekMouseUp = (videoId, value) => {
    setSeeking(false);
    if (playerRefs.current[videoId]) {
      playerRefs.current[videoId].seekTo(value);
    }
  };
  
  // İleri/geri sarma
  const handleSeekForward = (videoId) => {
    const newPosition = Math.min((playedSeconds[videoId] || 0) + 10, (duration[videoId] || 0));
    if (playerRefs.current[videoId]) {
      playerRefs.current[videoId].seekTo(newPosition);
    }
  };
  
  const handleSeekBackward = (videoId) => {
    const newPosition = Math.max((playedSeconds[videoId] || 0) - 10, 0);
    if (playerRefs.current[videoId]) {
      playerRefs.current[videoId].seekTo(newPosition);
    }
  };
  
  // Süre formatı
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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
          Henüz gönderi bulunmuyor.
        </Alert>
      ) : (
        videos.map((video, index) => (
          <Card 
            key={video._id} 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
              }
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
                <IconButton aria-label="settings" onClick={(e) => handleMenuOpen(e, video)}>
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
            
            <Box sx={{ position: 'relative', paddingTop: '56.25%', backgroundColor: (video.postType === 'image' || (video.filePath && video.filePath.includes('/uploads/images/'))) ? '#f5f5f5' : (video.postType === 'text') ? '#f8f8f8' : '#000' }}>
              {(video.postType === 'image' || (video.filePath && video.filePath.includes('/uploads/images/'))) ? (
                <img
                  src={`http://localhost:5000${video.filePath}`}
                  alt={video.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : video.postType === 'text' ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    padding: '24px',
                    overflow: 'auto',
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#333', 
                      whiteSpace: 'pre-wrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'left',
                      fontWeight: 'medium',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 8,
                      WebkitBoxOrient: 'vertical',
                      fontSize: '1rem'
                    }}
                  >
                    {video.textContent}
                  </Typography>
                </Box>
              ) : (
              <ReactPlayer
                  ref={(player) => {
                    playerRefs.current[video._id] = player;
                  }}
                url={`http://localhost:5000${video.filePath}`}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                  playing={isPlaying[video._id] && (index === activeVideoIndex && inView)}
                muted={muted}
                loop
                controls={false}
                playsinline
                  onProgress={(state) => handleProgress(video._id, state)}
                  onDuration={(duration) => handleDuration(video._id, duration)}
              />
              )}
              
              {/* Video ve Görsel için alt kontroller */}
              {video.postType !== 'text' && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                    width: '100%',
                    bottom: 0, 
                    left: 0,
                    p: 2,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    zIndex: 2
                  }}
                >
                  {/* Video kontrolları - sadece video tipinde göster */}
                  {(video.postType === 'video' || (video.filePath && !video.filePath.includes('/uploads/images/'))) && (
                    <>
                      <Slider
                        value={playedSeconds[video._id] || 0}
                        max={duration[video._id] || 100}
                        onChange={(_, value) => handleSeekChange(video._id, value)}
                        onMouseDown={handleSeekMouseDown}
                        onChangeCommitted={(_, value) => handleSeekMouseUp(video._id, value)}
                        sx={{ 
                          color: '#fff',
                          '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                            transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                            '&:hover, &.Mui-focusVisible': {
                              boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.16)'
                            }
                          }
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="white">
                            {formatTime(playedSeconds[video._id])} / {formatTime(duration[video._id])}
                          </Typography>
                          
                          <IconButton 
                            onClick={toggleMute} 
                            size="small"
                            sx={{ color: 'white' }}
                          >
                            {muted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
                </IconButton>
              </Box>
              
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            onClick={() => handleSeekBackward(video._id)} 
                            size="small"
                            sx={{ color: 'white' }}
                          >
                            <FastRewind fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            onClick={() => togglePlay(video._id)} 
                sx={{ 
                              color: 'white',
                              bgcolor: 'rgba(0,0,0,0.3)',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                            }}
                          >
                            {isPlaying[video._id] ? <Pause /> : <PlayArrow />}
                          </IconButton>
                          
                          <IconButton 
                            onClick={() => handleSeekForward(video._id)} 
                            size="small"
                            sx={{ color: 'white' }}
                          >
                            <FastForward fontSize="small" />
                          </IconButton>
                        </Box>
                        
                <Chip 
                          label={!isNaN(duration[video._id]) ? formatTime(duration[video._id]) : "0:00"} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
                    </>
                  )}
                  
                  {/* Görsel türü için bilgi etiketi */}
                  {(video.postType === 'image' || (video.filePath && video.filePath.includes('/uploads/images/'))) && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', top: 10, right: 10 }}>
                      <Chip 
                        label="Görsel" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(33, 150, 243, 0.9)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Yazı türü için özel etiket (köşeye sabitlenmiş) */}
              {video.postType === 'text' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 2
                  }}
                >
                  <Chip 
                    label="Yazı" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              )}
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
      
      {/* İşlem menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem component={Link} to={`/videos/${selectedVideo?._id}`}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ mr: 1, fontSize: 20 }} />
            <Typography>Videoyu Görüntüle</Typography>
          </Box>
        </MenuItem>
        
        {isLoggedIn && selectedVideo?.uploadedBy?.username === localStorage.getItem('username') && (
          <>
            <MenuItem component={Link} to={`/edit-video/${selectedVideo?._id}`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Edit sx={{ mr: 1, fontSize: 20 }} />
                <Typography>Düzenle</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem onClick={handleDeleteClick}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                <Delete sx={{ mr: 1, fontSize: 20 }} />
                <Typography>Sil</Typography>
              </Box>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Silme Onay Dialogu */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteClose}>
        <DialogTitle>Videoyu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedVideo?.title}" videosunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>İptal</Button>
          <Button onClick={handleDeleteVideo} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VideoFeed;
