import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Divider,
  Snackbar,
  Grid
} from '@mui/material';
import { 
  Save, 
  Cancel, 
  ArrowBack, 
  VideoLibrary,
  Add,
  Delete
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Kategori seçenekleri
const categories = [
  'maç', 'antrenman', 'teknik', 'taktik', 'gol', 'kurtarış', 'turnuva', 'diğer'
];

function VideoEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form alanları
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Form doğrulama
  const [titleError, setTitleError] = useState('');
  
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('userToken');
      
      if (!isLoggedIn || !token) {
        navigate('/login', { state: { from: `/edit-video/${id}` } });
      }
    };
    
    checkAuth();
  }, [id, navigate]);
  
  // Video verilerini çek
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('Oturum bulunamadı');
        }
        
        const response = await axios.get(`http://localhost:5000/api/videos/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const videoData = response.data;
        setVideo(videoData);
        
        // Form alanlarını doldur
        setTitle(videoData.title || '');
        setDescription(videoData.description || '');
        setCategory(videoData.category || 'diğer');
        setTags(videoData.tags || []);
        setIsPublic(videoData.isPublic !== false);
        
        // Kullanıcı kontrolü
        const userId = localStorage.getItem('userId');
        if (videoData.uploadedBy._id !== userId) {
          setError('Bu videoyu düzenleme yetkiniz yok');
          setTimeout(() => navigate(`/videos/${id}`), 3000);
        }
        
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
  }, [id, navigate]);
  
  // Yeni etiket ekle
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  // Etiket sil
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };
  
  // Enter tuşu ile etiket ekleme
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Form doğrulama
  const validateForm = () => {
    let isValid = true;
    
    // Başlık kontrolü
    if (!title.trim()) {
      setTitleError('Başlık gereklidir');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    return isValid;
  };
  
  // Formu gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }
      
      const videoData = {
        title,
        description,
        category,
        tags: tags.join(','),
        isPublic: isPublic
      };
      
      await axios.put(`http://localhost:5000/api/videos/${id}`, videoData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSnackbarMessage('Video başarıyla güncellendi');
      setSnackbarOpen(true);
      
      // Başarılı güncelleme sonrası video detay sayfasına yönlendir
      setTimeout(() => {
        navigate(`/videos/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Video güncelleme hatası:', err);
      setError('Video güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
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
          onClick={() => navigate(`/videos/${id}`)}
          sx={{ mb: 2 }}
        >
          Geri Dön
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <VideoLibrary sx={{ mr: 1 }} />
          Video Düzenle
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : video ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Başlık"
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={!!titleError}
                    helperText={titleError}
                    sx={{ mb: 3 }}
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Açıklama"
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={4}
                    sx={{ mb: 3 }}
                  />
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label="Kategori"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Etiketler
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        label="Yeni etiket"
                        variant="outlined"
                        size="small"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        sx={{ mr: 1, flexGrow: 1 }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                        startIcon={<Add />}
                      >
                        Ekle
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleDeleteTag(tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {tags.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Henüz etiket eklenmedi
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Görünürlük</InputLabel>
                    <Select
                      value={isPublic}
                      onChange={(e) => setIsPublic(e.target.value)}
                      label="Görünürlük"
                    >
                      <MenuItem value={true}>Herkese Açık</MenuItem>
                      <MenuItem value={false}>Özel</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => navigate(`/videos/${id}`)}
                    >
                      İptal
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={saving ? <CircularProgress size={24} color="inherit" /> : <Save />}
                      disabled={saving}
                    >
                      Kaydet
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
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
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Önizleme
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Video içeriği değiştirilemez, sadece bilgiler düzenlenebilir
                  </Typography>
                </Box>
              </Paper>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>İpuçları:</strong>
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Başlık ve açıklama, videonuzun bulunmasına yardımcı olur</li>
                  <li>Doğru kategori seçimi, hedef kitlenize ulaşmanızı sağlar</li>
                  <li>Etiketler, videonuzun arama sonuçlarında görünme olasılığını artırır</li>
                </ul>
              </Alert>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="warning">Video bulunamadı</Alert>
        )}
        
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

export default VideoEdit; 