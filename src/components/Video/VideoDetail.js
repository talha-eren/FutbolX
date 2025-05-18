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
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Snackbar
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Share, 
  Person, 
  Send, 
  Visibility,
  ThumbUp,
  Comment as CommentIcon,
  MoreVert,
  Edit,
  Delete,
  ArrowBack
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
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
        
        const token = localStorage.getItem('userToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`http://localhost:5000/api/videos/${id}`, { headers });
        setVideo(response.data);
        
        // Beğeni durumunu kontrol et
        if (token && response.data.likedBy) {
          const userId = localStorage.getItem('userId');
          setIsLiked(response.data.likedBy.includes(userId));
        }
        
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
      setSnackbarMessage('Yorum yapmak için giriş yapmalısınız');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setCommentLoading(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setSnackbarMessage('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setSnackbarOpen(true);
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
      setSnackbarMessage('Yorumunuz eklendi');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      setSnackbarMessage('Yorum eklenirken bir hata oluştu');
      setSnackbarOpen(true);
    } finally {
      setCommentLoading(false);
    }
  };
  
  // Beğeni ekle/kaldır
  const handleLike = async () => {
    if (!isLoggedIn) {
      setSnackbarMessage('Beğenmek için giriş yapmalısınız');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setLikeLoading(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setSnackbarMessage('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setSnackbarOpen(true);
        setLikeLoading(false);
        return;
      }
      
      const response = await axios.post(`http://localhost:5000/api/videos/${id}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Beğeni sayısını ve durumunu güncelle
      setVideo({
        ...video,
        likes: response.data.likes
      });
      
      setIsLiked(!isLiked);
      
      setSnackbarMessage(isLiked ? 'Beğeni kaldırıldı' : 'Video beğenildi');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Beğeni hatası:', err);
      setSnackbarMessage('Beğeni işlemi sırasında bir hata oluştu');
      setSnackbarOpen(true);
    } finally {
      setLikeLoading(false);
    }
  };
  
  // Menü işlemleri
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
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
    try {
      setDeleteLoading(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setSnackbarMessage('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setSnackbarOpen(true);
        setDeleteLoading(false);
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/videos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSnackbarMessage('Video başarıyla silindi');
      setSnackbarOpen(true);
      
      // Ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Video silme hatası:', err);
      setSnackbarMessage('Video silinirken bir hata oluştu');
      setSnackbarOpen(true);
      setDeleteLoading(false);
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
  
  // Video URL'sini düzgün bir şekilde oluştur
  const getVideoUrl = (filePath) => {
    if (!filePath) return '';
    
    // Eğer tam URL ise doğrudan kullan
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // Eğer yol zaten / ile başlıyorsa, sunucu URL'sini ekle
    if (filePath.startsWith('/')) {
      return `http://localhost:5000${filePath}`;
    }
    
    // Diğer durumlarda tam yolu oluştur
    return `http://localhost:5000/${filePath}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Geri Dön
        </Button>
        
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
            <Paper elevation={3} sx={{ p: 0, mb: 3, overflow: 'hidden', borderRadius: 2 }}>
              <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: '#000' }}>
                <ReactPlayer
                  url={getVideoUrl(video.filePath)}
                  width="100%"
                  height="100%"
                  controls
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {video.title}
                  </Typography>
                  
                  {isLoggedIn && video.uploadedBy?._id === localStorage.getItem('userId') && (
                    <IconButton onClick={handleMenuOpen}>
                      <MoreVert />
                    </IconButton>
                  )}
                </Box>
                
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
                      startIcon={likeLoading ? <CircularProgress size={16} /> : (isLiked ? <ThumbUp /> : <FavoriteBorder />)}
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
                    src={video.uploadedBy?.profilePicture?.startsWith('http') 
                      ? video.uploadedBy.profilePicture 
                      : video.uploadedBy?.profilePicture 
                        ? `http://localhost:5000${video.uploadedBy.profilePicture}` 
                        : null}
                    sx={{ width: 50, height: 50, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {video.uploadedBy?.username || 'Kullanıcı'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yükleyen
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body1" sx={{ mt: 2, mb: 3, whiteSpace: 'pre-wrap' }}>
                  {video.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={video.category} 
                    color="primary" 
                    size="medium"
                    sx={{ fontWeight: 'bold' }}
                  />
                  
                  {video.tags && video.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      variant="outlined" 
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon sx={{ mr: 1 }} />
                Yorumlar ({video.comments?.length || 0})
              </Typography>
              
              {isLoggedIn ? (
                <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', mb: 3, mt: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Bir yorum yazın..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={commentLoading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!comment.trim() || commentLoading}
                    sx={{ ml: 1, minWidth: 100 }}
                    endIcon={commentLoading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                  >
                    Gönder
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
                  Yorum yapmak için <Link to="/login">giriş</Link> yapmalısınız.
                </Alert>
              )}
              
              <List>
                {video.comments && video.comments.length > 0 ? (
                  video.comments.map((comment, index) => (
                    <React.Fragment key={comment._id || index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar 
                            src={comment.user?.profilePicture?.startsWith('http') 
                              ? comment.user.profilePicture 
                              : comment.user?.profilePicture 
                                ? `http://localhost:5000${comment.user.profilePicture}` 
                                : null}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {comment.user?.username || 'Kullanıcı'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatCommentDate(comment.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                            >
                              {comment.text}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < video.comments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Henüz yorum yapılmamış. İlk yorumu siz yapın!
                  </Typography>
                )}
              </List>
            </Paper>
          </>
        ) : (
          <Alert severity="info">Video bulunamadı</Alert>
        )}
        
        {/* İşlem menüsü */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem component={Link} to={`/edit-video/${id}`}>
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
        <Dialog open={openDeleteDialog} onClose={handleDeleteClose}>
          <DialogTitle>Videoyu Sil</DialogTitle>
          <DialogContent>
            <Typography>
              "{video?.title}" videosunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose} disabled={deleteLoading}>İptal</Button>
            <Button 
              onClick={handleDeleteVideo} 
              color="error" 
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading && <CircularProgress size={16} color="inherit" />}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Bildirim */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
}

export default VideoDetail;
