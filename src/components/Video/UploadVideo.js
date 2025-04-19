import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox,
  CircularProgress,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import { CloudUpload, VideoLibrary } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadVideo() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'diğer',
    tags: '',
    isPublic: true,
    duration: '0:00'
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState('0:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const navigate = useNavigate();

  // Form alanlarını güncelle
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Video dosyasını seç
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya türünü kontrol et
      const validTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv'];
      if (!validTypes.includes(file.type)) {
        setError('Lütfen geçerli bir video dosyası seçin (MP4, WebM, AVI, MOV, WMV, FLV, MKV)');
        return;
      }
      
      // Dosya boyutunu kontrol et (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video dosyası 100MB\'dan küçük olmalıdır');
        return;
      }
      
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setError('');
      
      // Video süresini al
      const video = document.createElement('video');
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(video.duration / 60);
        const seconds = Math.floor(video.duration % 60);
        const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        setVideoDuration(durationStr);
        setFormData(prev => ({ ...prev, duration: durationStr }));
        console.log('Video süresi:', durationStr);
      });
    }
  };

  // Formu gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      setError('Lütfen bir video dosyası seçin');
      return;
    }
    
    if (!formData.title) {
      setError('Lütfen video başlığını girin');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);
    
    try {
      // Form verilerini oluştur
      const videoFormData = new FormData();
      videoFormData.append('video', videoFile);
      videoFormData.append('title', formData.title);
      videoFormData.append('description', formData.description);
      videoFormData.append('category', formData.category);
      videoFormData.append('tags', formData.tags);
      videoFormData.append('isPublic', formData.isPublic);
      videoFormData.append('duration', formData.duration || videoDuration);
      
      // Token'ı al
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      // Video yükleme isteği gönder
      const response = await axios.post('http://localhost:5000/api/videos/upload', videoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      console.log('Video yükleme başarılı:', response.data);
      setSuccess('Video başarıyla yüklendi!');
      
      // 2 saniye sonra video sayfasına yönlendir
      setTimeout(() => {
        navigate('/videos');
      }, 2000);
      
    } catch (err) {
      console.error('Video yükleme hatası:', err);
      
      if (err.response) {
        setError(err.response.data.message || 'Video yüklenirken bir hata oluştu');
      } else if (err.request) {
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        setError('Video yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Video Yükle
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ 
                height: 100, 
                border: '2px dashed #4CAF50',
                '&:hover': { border: '2px dashed #388E3C' }
              }}
            >
              {videoFile ? 'Video Seçildi: ' + videoFile.name : 'Video Dosyası Seç'}
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Box>
          
          {videoPreview && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <video 
                src={videoPreview} 
                controls 
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Video Süresi: {videoDuration}
              </Typography>
            </Box>
          )}
          
          <TextField
            label="Video Başlığı"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          
          <TextField
            label="Açıklama"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Kategori</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Kategori"
            >
              <MenuItem value="maç">Maç</MenuItem>
              <MenuItem value="antrenman">Antrenman</MenuItem>
              <MenuItem value="röportaj">Röportaj</MenuItem>
              <MenuItem value="diğer">Diğer</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Etiketler (virgülle ayırın)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            fullWidth
            margin="normal"
            helperText="Örnek: futbol, gol, penaltı"
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.isPublic} 
                onChange={handleChange} 
                name="isPublic" 
                color="primary"
              />
            }
            label="Herkese açık"
            sx={{ mt: 2 }}
          />
          
          {loading && (
            <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
              <CircularProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                %{uploadProgress} Yükleniyor...
              </Typography>
            </Box>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<VideoLibrary />}
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Yükleniyor...' : 'Videoyu Yükle'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default UploadVideo;
