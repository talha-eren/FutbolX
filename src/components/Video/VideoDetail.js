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
  Snackbar,
  Card,
  CardContent
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
import { blueGrey } from '@mui/material/colors';

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
    
    // uploads/ ile başlıyorsa doğru yolu oluştur
    if (filePath.startsWith('uploads/')) {
      return `http://localhost:5000/${filePath}`;
    }
    
    // Diğer durumlarda tam yolu oluştur
    return `http://localhost:5000/uploads/${filePath}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
          variant="text"
          color="primary"
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
            <Card sx={{ mb: 3, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 3 }}>
              <Box sx={{ 
                position: 'relative', 
                width: '100%', 
                paddingTop: '56.25%', 
                bgcolor: '#000', 
                overflow: 'hidden' 
              }}>
                {video.postType === 'image' || (video.filePath && video.filePath.includes('/uploads/images/')) ? (
                  <img
                    src={getVideoUrl(video.filePath)}
                    alt={video.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = '/images/placeholder-image.jpg';
                    }}
                  />
                ) : (
                <ReactPlayer
                    url={getVideoUrl(video.filePath)}
                  width="100%"
                  height="100%"
                  controls
                    playing
                    playsinline
                  style={{ position: 'absolute', top: 0, left: 0 }}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload',
                          crossOrigin: 'anonymous',
                          preload: 'auto'
                        },
                        forceVideo: true
                      }
                    }}
                    onReady={() => console.log("Video ready to play")}
                    fallback={
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#1c1c1c',
                          color: 'white'
                        }}
                      >
                        <Typography>Video yüklenemiyor...</Typography>
                      </Box>
                    }
                    onError={(e) => {
                      console.error("Video oynatma hatası:", e);
                      console.error("Video URL:", getVideoUrl(video.filePath));
                    }}
                                    />
                )}
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography 
                    variant="h5" 
                    component="h1" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ 
                      color: '#424242',
                      fontSize: { xs: '1.2rem', md: '1.5rem' },
                      mb: 1.5
                    }}
                  >
                    {video.title || 'Video Başlığı'}
                </Typography>
                  
                  {isLoggedIn && video.uploadedBy?._id === localStorage.getItem('userId') && (
                    <IconButton onClick={handleMenuOpen} sx={{ color: 'text.secondary' }}>
                      <MoreVert />
                    </IconButton>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      icon={<Visibility />} 
                      label={`${video.views || 0} görüntülenme`} 
                      variant="outlined" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontWeight: 'medium' }} 
                    />
                    
                    <Chip 
                      label={video.createdAt ? formatDate(video.createdAt) : 'Tarih bilgisi yok'} 
                      variant="outlined" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontWeight: 'medium' }} 
                    />
                  </Box>
                  
                  <Box>
                    <Button 
                      startIcon={likeLoading ? <CircularProgress size={16} /> : (isLiked ? <ThumbUp color="primary" /> : <ThumbUp />)}
                      variant={isLiked ? "contained" : "outlined"}
                      color="primary"
                      onClick={handleLike}
                      disabled={likeLoading || !isLoggedIn}
                      sx={{ mr: 1, borderRadius: 5, fontWeight: 'bold' }}
                      size="small"
                    >
                      {video.likes || 0}
                    </Button>
                    
                    <Button 
                      startIcon={<Share />}
                      variant="outlined"
                      color="primary"
                      sx={{ borderRadius: 5, fontWeight: 'bold' }}
                      size="small"
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
                        ? (video.uploadedBy.profilePicture.startsWith('/') 
                          ? `http://localhost:5000${video.uploadedBy.profilePicture}` 
                          : `http://localhost:5000/uploads/${video.uploadedBy.profilePicture}`)
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
                
                <Typography variant="body1" sx={{ 
                  mt: 2, 
                  mb: 3, 
                  whiteSpace: 'pre-wrap', 
                  color: '#424242',
                  px: 1,
                  py: 1.5,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  lineHeight: 1.6
                }}>
                  {video.description || 'Bu gönderinin açıklaması bulunmuyor.'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {video.category && (
                  <Chip 
                    label={video.category} 
                    color="primary" 
                      size="medium"
                      sx={{ fontWeight: 'bold', borderRadius: 2 }}
                  />
                  )}
                  
                  {video.tags && video.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      variant="outlined"
                      size="medium"
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 'bold',
                  color: '#333',
                  mb: 2 
                }}>
                  <CommentIcon sx={{ mr: 1, color: '#666' }} />
                Yorumlar ({video.comments?.length || 0})
              </Typography>
              
                {isLoggedIn ? (
                  <Box component="form" onSubmit={handleAddComment} sx={{ 
                    display: 'flex', 
                    mb: 3, 
                    mt: 2, 
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(25, 118, 210, 0.12)'
                  }}>
                <TextField
                  fullWidth
                      variant="outlined"
                      placeholder="Yorumunuzu buraya yazın..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                      disabled={commentLoading}
                      multiline
                      rows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#fff'
                        }
                      }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                      disabled={!comment.trim() || commentLoading}
                      sx={{ ml: 2, minWidth: 100, borderRadius: 2, alignSelf: 'flex-start' }}
                  endIcon={commentLoading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                >
                  Gönder
                </Button>
              </Box>
                ) : (
                  <Alert severity="info" sx={{ mb: 2, mt: 2, borderRadius: 2 }}>
                    Yorum yapmak için <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#1976d2' }}>giriş</Link> yapmalısınız.
                </Alert>
              )}
              
                <List sx={{ p: 0 }}>
                {video.comments && video.comments.length > 0 ? (
                  video.comments.map((comment, index) => (
                      <React.Fragment key={comment._id || index}>
                        <ListItem 
                          alignItems="flex-start" 
                          sx={{ 
                            px: 2, 
                            py: 2, 
                            borderRadius: 2, 
                            my: 1,
                            bgcolor: index % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.01)',
                            border: '1px solid rgba(0,0,0,0.06)',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.05)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                        <ListItemAvatar>
                            <Avatar 
                              src={comment.user?.profilePicture?.startsWith('http') 
                                ? comment.user.profilePicture 
                                : comment.user?.profilePicture 
                                  ? (comment.user.profilePicture.startsWith('/') 
                                    ? `http://localhost:5000${comment.user.profilePicture}` 
                                    : `http://localhost:5000/uploads/${comment.user.profilePicture}`)
                                  : null}
                              sx={{ 
                                bgcolor: blueGrey[500],
                                width: 40,
                                height: 40
                              }}
                            />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: blueGrey[800] }}>
                                {comment.user?.username || 'Kullanıcı'}
                              </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  bgcolor: 'rgba(0,0,0,0.05)', 
                                  px: 1.5, 
                                  py: 0.5, 
                                  borderRadius: 5,
                                  fontWeight: 'medium',
                                  fontSize: '0.7rem'
                                }}>
                                {formatCommentDate(comment.createdAt)}
                              </Typography>
                            </Box>
                          }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{ 
                                  mt: 1, 
                                  whiteSpace: 'pre-wrap', 
                                  px: 0.5,
                                  color: '#424242',
                                  fontSize: '0.9rem',
                                  lineHeight: 1.5
                                }}
                              >
                                {comment.text}
                              </Typography>
                            }
                        />
                      </ListItem>
                        {index < video.comments.length - 1 && <Divider component="li" sx={{ opacity: 0.06 }} />}
                    </React.Fragment>
                  ))
                ) : (
                    <Box sx={{ 
                      py: 4, 
                      textAlign: 'center', 
                      bgcolor: 'rgba(0,0,0,0.02)', 
                      borderRadius: 2,
                      border: '1px dashed rgba(0,0,0,0.1)'
                    }}>
                      <CommentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        Henüz yorum yapılmamış. İlk yorumu siz yapın!
                    </Typography>
                  </Box>
                )}
              </List>
              </CardContent>
            </Card>
          </>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>Video bulunamadı</Alert>
        )}
        
        {/* İşlem menüsü */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2, minWidth: 150 }
          }}
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
        <Dialog 
          open={openDeleteDialog} 
          onClose={handleDeleteClose}
          PaperProps={{
            sx: { borderRadius: 3, p: 1 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Videoyu Sil</DialogTitle>
          <DialogContent>
            <Typography>
              "{video?.title}" videosunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose} disabled={deleteLoading} sx={{ borderRadius: 2 }}>İptal</Button>
            <Button 
              onClick={handleDeleteVideo} 
              color="error" 
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading && <CircularProgress size={16} color="inherit" />}
              sx={{ borderRadius: 2 }}
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
          sx={{ 
            '& .MuiSnackbarContent-root': { 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            } 
          }}
        />
      </Box>
    </Container>
  );
}

export default VideoDetail;
