import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Avatar, 
  Button, 
  Divider, 
  TextField,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Share, 
  Person, 
  Send, 
  Visibility,
  ThumbUp,
  Comment as CommentIcon
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
  }, []);
  
  // Video detaylarını çek
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`http://localhost:5000/api/videos/${id}`);
        setVideo(response.data);
        setError('');
      } catch (err) {
        console.error('Video detayları getirme hatası:', err);
        setError('Video yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchVideoDetails();
    }
  }, [id]);
  
  // Yorum ekle
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }
    
    if (!isLoggedIn) {
      setError('Yorum yapmak için giriş yapmalısınız');
      return;
    }
    
    try {
      setCommentLoading(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setCommentLoading(false);
        return;
      }
      
      const response = await axios.post(`http://localhost:5000/api/videos/${id}/comment`, 
        { text: comment },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Yeni yorumu ekle
      setVideo({
        ...video,
        comments: [...video.comments, response.data]
      });
      
      // Yorum alanını temizle
      setComment('');
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      setError('Yorum eklenirken bir hata oluştu');
    } finally {
      setCommentLoading(false);
    }
  };
  
  // Beğeni ekle
  const handleLike = async () => {
    if (!isLoggedIn) {
      setError('Beğenmek için giriş yapmalısınız');
      return;
    }
    
    try {
      setLikeLoading(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setLikeLoading(false);
        return;
      }
      
      const response = await axios.post(`http://localhost:5000/api/videos/${id}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Beğeni sayısını güncelle
      setVideo({
        ...video,
        likes: response.data.likes
      });
    } catch (err) {
      console.error('Beğeni hatası:', err);
      setError('Beğeni eklenirken bir hata oluştu');
    } finally {
      setLikeLoading(false);
    }
  };
  
  // Tarih formatla
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Yorum tarihini formatla
  const formatCommentDate = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffTime = Math.abs(now - commentDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} dakika önce`;
      }
      return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return formatDate(dateString);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : video ? (
          <>
            <Paper elevation={2} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <ReactPlayer
                  url={`http://localhost:5000${video.filePath}`}
                  width="100%"
                  height="100%"
                  controls
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {video.title}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 3 }}>
                      {video.views} görüntülenme
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(video.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Button 
                      startIcon={likeLoading ? <CircularProgress size={16} /> : <ThumbUp />}
                      variant="outlined"
                      color="primary"
                      onClick={handleLike}
                      disabled={likeLoading || !isLoggedIn}
                      sx={{ mr: 1 }}
                    >
                      {video.likes}
                    </Button>
                    
                    <Button 
                      startIcon={<Share />}
                      variant="outlined"
                      color="primary"
                    >
                      Paylaş
                    </Button>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={video.uploadedBy?.profilePicture} 
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {video.uploadedBy?.username || 'Kullanıcı'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yükleyen
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Chip 
                    label={video.category} 
                    color="primary" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  
                  {video.tags && video.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                
                <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                  {video.description}
                </Typography>
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon sx={{ mr: 1 }} />
                Yorumlar ({video.comments?.length || 0})
              </Typography>
              
              <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder={isLoggedIn ? "Yorum yaz..." : "Yorum yapmak için giriş yapın"}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={!isLoggedIn || commentLoading}
                  sx={{ mr: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  endIcon={commentLoading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                  disabled={!isLoggedIn || !comment.trim() || commentLoading}
                >
                  Gönder
                </Button>
              </Box>
              
              {!isLoggedIn && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Yorum yapmak için <Link to="/login">giriş yapın</Link>.
                </Alert>
              )}
              
              <List>
                {video.comments && video.comments.length > 0 ? (
                  video.comments.map((comment, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar src={comment.user?.profilePicture}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">
                                {comment.user?.username || 'Kullanıcı'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatCommentDate(comment.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={comment.text}
                        />
                      </ListItem>
                      {index < video.comments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Henüz yorum yapılmamış. İlk yorumu sen yap!
                    </Typography>
                  </Box>
                )}
              </List>
            </Paper>
          </>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Video bulunamadı.
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default VideoDetail;
