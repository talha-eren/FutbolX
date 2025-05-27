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
  Edit,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
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
  const [likedVideos, setLikedVideos] = useState({});
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  
  const playerRefs = useRef({});
  
  // Görünürlük izleme için ref
  const { ref, inView } = useInView({
    threshold: 0.7,
  });
  
  // Tam ekran açma/kapama
  const toggleFullscreen = (videoId) => {
    if (fullscreenVideo === videoId) {
      setFullscreenVideo(null);
    } else {
      setFullscreenVideo(videoId);
    }
  };

  // ESC tuşu ile tam ekrandan çıkma
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && fullscreenVideo) {
        setFullscreenVideo(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [fullscreenVideo]);
  
  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
  }, []);
  
  // Görünür videoları otomatik oynat
  useEffect(() => {
    if (activeVideoIndex !== null && inView) {
      const currentVideo = videos[activeVideoIndex];
      if (currentVideo && currentVideo._id) {
        // Görünen videoyu otomatik olarak oynat
        setIsPlaying(prev => ({
          ...prev,
          [currentVideo._id]: true
        }));
      }
    }
  }, [activeVideoIndex, inView, videos]);
  
  // Videoları çek
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get('http://localhost:5000/api/videos', { headers });
        console.log('Fetched videos:', response.data);
        
        // İlk başta tüm videoları durdurulmuş olarak ayarla
        const playingState = {};
        const likedState = {};
        
        response.data.forEach(video => {
          playingState[video._id] = false;
          likedState[video._id] = video.likedBy && video.likedBy.includes(localStorage.getItem('userId'));
        });
        
        setVideos(response.data);
        setIsPlaying(playingState);
        setLikedVideos(likedState);
        setPlayedSeconds({});
        setDuration({});
        setError('');
      } catch (err) {
        console.error('Video listesi getirme hatası:', err);
        setError('Videolar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        // Hata durumunda boş bir örnek video göster
        setVideos([{
          _id: 'sample1',
          title: 'FutbolX Turnuvası Final Maçı',
          description: '2024 FutbolX Turnuvası final maçı özeti',
          postType: 'text',
          textContent: 'Şu anda video içeriği görüntülenemiyor. Lütfen daha sonra tekrar deneyin.',
          category: 'maç',
          tags: ['maç', 'turnuva', 'final', 'futbolx'],
          createdAt: new Date(),
          uploadedBy: { username: 'Sistem', profilePicture: null },
          likes: 0,
          comments: [],
          views: 0
        }]);
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
      alert('Beğenmek için giriş yapmalısınız!');
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
      
      // Beğeni sayısını ve durumunu güncelle
      const updatedVideos = [...videos];
      updatedVideos[index].likes = response.data.likes;
      
      // Beğeni durumunu tersine çevir
      setLikedVideos(prev => ({
        ...prev,
        [videoId]: !prev[videoId]
      }));
      
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
    // Olay yayılımını durdur
    event.stopPropagation();
    
    setAnchorEl(event.currentTarget);
    setSelectedVideo(video);
    console.log('Seçilen video:', video?._id);
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
    if (!selectedVideo) {
      alert('Silinecek gönderi bulunamadı!');
      return;
    }
    
    try {
      console.log('Silinecek video:', selectedVideo);
      
      // API'ye direkt fetch ile istek gönderelim
      const response = await fetch(`http://localhost:5000/api/videos/${selectedVideo._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Silme yanıtı:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Silme hatası: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      // Silme başarılı, listeyi güncelleyelim
      setVideos(videos.filter(v => v._id !== selectedVideo._id));
      handleDeleteClose();
      
      // Bildirim gösterelim
      alert(`"${selectedVideo.title}" başarıyla silindi.`);
      
    } catch (err) {
      console.error('Video silme hatası:', err);
      alert('Video silinirken bir hata oluştu: ' + err.message);
    }
  };
  
  // Video oynatmayı başlat/durdur
  const togglePlay = (videoId) => {
    const videoElement = playerRefs.current[videoId];
    
    if (!videoElement) {
      console.error("Video elementi bulunamadı:", videoId);
      return;
    }
    
    console.log("Video durumu:", videoElement.paused ? "Duraklatılmış" : "Oynatılıyor");
    
    try {
      if (videoElement.paused) {
        // Video duraklatılmışsa oynat
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video başarıyla oynatılmaya başlandı");
              setIsPlaying(prev => ({ ...prev, [videoId]: true }));
            })
            .catch(error => {
              console.error("Video oynatma hatası:", error);
              // Otoplay politikası hatası olabilir, kullanıcı etkileşimi gerekebilir
              alert("Video otomatik olarak oynatılamıyor. Lütfen sayfayı yenileyin veya video üzerine tekrar tıklayın.");
            });
        }
      } else {
        // Video oynatılıyorsa duraklat
        videoElement.pause();
        setIsPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    } catch (error) {
      console.error("Video kontrol hatası:", error);
    }
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
  
  // İleri sarma
  const handleSeekForward = (videoId) => {
    const videoElement = playerRefs.current[videoId];
    if (!videoElement) return;
    
    try {
      const newTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
      videoElement.currentTime = newTime;
      setPlayedSeconds(prev => ({ ...prev, [videoId]: newTime }));
    } catch (error) {
      console.error("İleri sarma hatası:", error);
    }
  };
  
  // Geri sarma
  const handleSeekBackward = (videoId) => {
    const videoElement = playerRefs.current[videoId];
    if (!videoElement) return;
    
    try {
      const newTime = Math.max(0, videoElement.currentTime - 10);
      videoElement.currentTime = newTime;
      setPlayedSeconds(prev => ({ ...prev, [videoId]: newTime }));
    } catch (error) {
      console.error("Geri sarma hatası:", error);
    }
  };
  
  // Slider işlemleri
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };
  
  const handleSeekChange = (videoId, value) => {
    setPlayedSeconds(prev => ({ ...prev, [videoId]: value }));
  };
  
  const handleSeekMouseUp = (videoId, value) => {
    setSeeking(false);
    
    const videoElement = playerRefs.current[videoId];
    if (!videoElement) return;
    
    try {
      videoElement.currentTime = value;
      setPlayedSeconds(prev => ({ ...prev, [videoId]: value }));
    } catch (error) {
      console.error("Seek hatası:", error);
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
                  src={video.uploadedBy?.profilePicture ? 
                    (video.uploadedBy.profilePicture.startsWith('http') 
                      ? video.uploadedBy.profilePicture 
                      : video.uploadedBy.profilePicture.startsWith('/') 
                        ? `http://localhost:5000${video.uploadedBy.profilePicture}` 
                        : `http://localhost:5000/uploads/${video.uploadedBy.profilePicture}`) 
                    : null}
                  alt={video.uploadedBy?.username || 'Kullanıcı'}
                  sx={{ bgcolor: '#1976d2' }}
                  onError={(e) => {
                    // Resim yüklenme hatası olduğunda hata bildirimini durdur ve stil uygula
                    e.target.onError = null; 
                    e.target.src = '';
                    e.target.style.display = 'flex';
                    e.target.style.alignItems = 'center';
                    e.target.style.justifyContent = 'center';
                  }}
                >
                  {video.uploadedBy?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              }
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    aria-label="delete" 
                    onClick={() => {
                      setSelectedVideo(video);
                      handleDeleteClick();
                    }}
                    color="error"
                    sx={{ 
                      zIndex: 100,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton 
                    aria-label="settings" 
                    onClick={(e) => handleMenuOpen(e, video)}
                    color="primary"
                    sx={{ 
                      zIndex: 100,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
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
            
            <Box sx={{ position: 'relative', paddingTop: '75%', backgroundColor: (video.postType === 'image' || (video.filePath && video.filePath.includes('/uploads/images/'))) ? '#f5f5f5' : (video.postType === 'text') ? '#f8f8f8' : '#000' }}>
              {(video.postType === 'image' || (video.filePath && video.filePath.includes('/uploads/images/'))) ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleFullscreen(video._id)}
                >
                  <img
                    src={video.filePath ? 
                      (video.filePath.startsWith('http') 
                        ? video.filePath 
                        : video.filePath.startsWith('/') 
                          ? `http://localhost:5000${video.filePath}` 
                          : `http://localhost:5000/${video.filePath}`) 
                      : '/images/players/player1.jpg'}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = '/images/players/player1.jpg';
                    }}
                  />
                  
                  {/* Tam ekran butonu */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen(video._id);
                    }}
                  >
                    <Fullscreen />
                  </IconButton>
                </Box>
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
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleFullscreen(video._id)}
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
                    {video.textContent || 'İçerik bulunamadı'}
                  </Typography>
                  
                  {/* Tam ekran butonu */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen(video._id);
                    }}
                  >
                    <Fullscreen />
                  </IconButton>
                </Box>
              ) : (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#000',
                  cursor: 'pointer'
                }}
                onClick={() => togglePlay(video._id)}
              >
                <video
                  key={`video-${video._id}`}
                  ref={(player) => {
                    playerRefs.current[video._id] = player;
                  }}
                  src={video.filePath ? 
                    (video.filePath.startsWith('http') 
                      ? video.filePath 
                      : video.filePath.startsWith('/') 
                        ? `http://localhost:5000${video.filePath}` 
                        : `http://localhost:5000/${video.filePath}`) 
                    : '/videos/gol1.mp4'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  playsInline
                  muted={muted}
                  loop
                  controls={false}
                  preload="metadata"
                  onPlay={() => {
                    console.log(`Video ${video._id} playing`);
                    setIsPlaying(prev => ({...prev, [video._id]: true}));
                  }}
                  onPause={() => {
                    console.log(`Video ${video._id} paused`);
                    setIsPlaying(prev => ({...prev, [video._id]: false}));
                  }}
                  onTimeUpdate={(e) => {
                    const seconds = e.target.currentTime;
                    setPlayedSeconds(prev => ({...prev, [video._id]: seconds}));
                  }}
                  onLoadedMetadata={(e) => {
                    const videoDuration = e.target.duration;
                    setDuration(prev => ({...prev, [video._id]: videoDuration}));
                  }}
                  onError={(e) => {
                    console.error('Video yüklenirken hata:', e);
                    console.error('Video src:', e.target.src);
                  }}
                />
                
                {/* Play/Pause Overlay */}
                {!isPlaying[video._id] && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '50%',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    <PlayArrow sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                )}
                
                {/* Video için tam ekran butonu */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    zIndex: 15,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen(video._id);
                  }}
                >
                  <Fullscreen />
                </IconButton>
              </Box>
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
                  {likedVideos[video._id] ? <Favorite /> : <FavoriteBorder />}
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
        sx={{ 
          zIndex: 9999,
          '& .MuiPaper-root': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem component={Link} to={`/videos/${selectedVideo?._id}`}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ mr: 1, fontSize: 20 }} />
            <Typography>Videoyu Görüntüle</Typography>
          </Box>
        </MenuItem>
        
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
      </Menu>
      
      {/* Silme Onay Dialogu */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleDeleteClose}
        PaperProps={{
          sx: { borderRadius: 2, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Videoyu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedVideo?.title}" videosunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteClose} 
            color="primary" 
            variant="outlined"
          >
            İptal
          </Button>
          <Button 
            onClick={handleDeleteVideo} 
            color="error" 
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tam Ekran Dialog */}
      <Dialog
        open={Boolean(fullscreenVideo)}
        onClose={() => setFullscreenVideo(null)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
            borderRadius: 0,
            backgroundColor: '#000'
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000'
          }}
        >
          {/* Kapatma butonu */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              zIndex: 1000,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
            onClick={() => setFullscreenVideo(null)}
          >
            <FullscreenExit />
          </IconButton>

          {fullscreenVideo && (() => {
            const video = videos.find(v => v._id === fullscreenVideo);
            if (!video) return null;

            if (video.postType === 'image' || (video.filePath && video.filePath.includes('/uploads/images/'))) {
              return (
                <img
                  src={video.filePath ? 
                    (video.filePath.startsWith('http') 
                      ? video.filePath 
                      : video.filePath.startsWith('/') 
                        ? `http://localhost:5000${video.filePath}` 
                        : `http://localhost:5000/${video.filePath}`) 
                    : '/images/players/player1.jpg'}
                  alt={video.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              );
            } else if (video.postType === 'text') {
              return (
                <Box
                  sx={{
                    width: '80%',
                    maxWidth: '800px',
                    padding: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: '#333',
                      fontWeight: 'bold',
                      mb: 3
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#555', 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8
                    }}
                  >
                    {video.textContent || 'İçerik bulunamadı'}
                  </Typography>
                </Box>
              );
            } else {
              // Video içeriği için
              return (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <video
                    src={video.filePath ? 
                      (video.filePath.startsWith('http') 
                        ? video.filePath 
                        : video.filePath.startsWith('/') 
                          ? `http://localhost:5000${video.filePath}` 
                          : `http://localhost:5000/${video.filePath}`) 
                      : '/videos/gol1.mp4'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    controls
                    autoPlay
                    muted={muted}
                    onError={(e) => {
                      console.error('Tam ekran video yüklenirken hata:', e);
                    }}
                  />
                </Box>
              );
            }
          })()}

          {/* Video bilgileri */}
          {fullscreenVideo && (() => {
            const video = videos.find(v => v._id === fullscreenVideo);
            if (!video) return null;

            return (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  p: 3
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {video.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {video.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={video.uploadedBy?.profilePicture ? 
                      (video.uploadedBy.profilePicture.startsWith('http') 
                        ? video.uploadedBy.profilePicture 
                        : video.uploadedBy.profilePicture.startsWith('/') 
                          ? `http://localhost:5000${video.uploadedBy.profilePicture}` 
                          : `http://localhost:5000/uploads/${video.uploadedBy.profilePicture}`) 
                      : null}
                    alt={video.uploadedBy?.username || 'Kullanıcı'}
                    sx={{ bgcolor: '#1976d2' }}
                  >
                    {video.uploadedBy?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {video.uploadedBy?.username || 'Kullanıcı'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {formatDate(video.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })()}
        </Box>
      </Dialog>
    </Box>
  );
}

export default VideoFeed;
