import React, { useState, useRef } from 'react';
import { 
  Box, 
  Container,
  Typography,
  TextField,
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  CloudUpload,
  Movie,
  TextFields,
  PhotoCamera
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function UploadVideo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [postType, setPostType] = useState('video');
  
  // Form verileri
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    isPublic: true,
    videoFile: null,
    imageFile: null,
    textContent: ''
  });
  
  // Video dosyası seçimi
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
    setFormData({
      ...formData,
        videoFile: file
    });
    }
  };

  // Görsel dosyası seçimi
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        imageFile: file
      });
    }
  };

  // Form değişikliklerini izle
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    const val = name === 'isPublic' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: val
    });
  };
  
  // Paylaşım tipini değiştir
  const handlePostTypeChange = (event, newValue) => {
    setPostType(newValue);
  };
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.title.trim()) {
      setError('Lütfen bir başlık girin.');
      return;
    }
    
    if (!formData.category) {
      setError('Lütfen bir kategori seçin.');
      return;
    }
    
    if (postType === 'video' && !formData.videoFile) {
      setError('Lütfen bir video dosyası seçin.');
      return;
    } else if (postType === 'image' && !formData.imageFile) {
      setError('Lütfen bir görsel dosyası seçin.');
      return;
    } else if (postType === 'text' && !formData.textContent.trim()) {
      setError('Lütfen metin içeriği girin.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        setError('Oturum açmanız gerekmektedir.');
        setLoading(false);
        return;
      }
      
      console.log("Gönderilen bilgiler:", { 
        postType, 
        hasVideoFile: !!formData.videoFile,
        hasImageFile: !!formData.imageFile,
        title: formData.title,
        category: formData.category
      });
      
      // MultiPart form verisi oluştur
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('tags', formData.tags);
      data.append('isPublic', formData.isPublic);
      data.append('post_type', postType);
      
      if (postType === 'video' && formData.videoFile) {
        // Dosya adını 'file' olarak ayarla - backend bunu bekliyor
        data.append('file', formData.videoFile);
        console.log('Video dosyası eklendi:', formData.videoFile.name);
      } else if (postType === 'image' && formData.imageFile) {
        // Dosya adını 'file' olarak ayarla - backend bunu bekliyor
        data.append('file', formData.imageFile);
        console.log('Görsel dosyası eklendi:', formData.imageFile.name);
      } else if (postType === 'text') {
        data.append('textContent', formData.textContent);
      }
      
      // API isteği
      let endpoint = 'http://localhost:5000/api/videos/upload';
      
      const response = await axios.post(
        endpoint,
        data,
        {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setUploadSuccess(true);
      
      // 2 saniye sonra yönlendir
      setTimeout(() => {
        navigate('/videos');
      }, 2000);
      
    } catch (err) {
      console.error('Gönderi yükleme hatası:', err);
      
      if (err.response) {
        // Sunucudan dönen hata mesajı
        setError(err.response.data?.message || `Sunucu hatası: ${err.response.status}`);
      } else if (err.request) {
        // İstek yapıldı ama cevap alınamadı
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // İstek yapılırken bir hata oluştu
        setError('Gönderi yüklenirken beklenmeyen bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: '#4CAF50' }}>
          Gönderi Paylaş
        </Typography>
        
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {/* Gönderi Tipi Seçimi */}
          <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={postType} onChange={handlePostTypeChange} centered>
              <Tab 
                icon={<Movie />} 
                label="Video" 
                value="video"
                sx={{ fontWeight: 'medium', textTransform: 'none' }}
              />
              <Tab 
                icon={<PhotoCamera />} 
                label="Görsel" 
                value="image"
                sx={{ fontWeight: 'medium', textTransform: 'none' }}
              />
              <Tab 
                icon={<TextFields />} 
                label="Yazı" 
                value="text"
                sx={{ fontWeight: 'medium', textTransform: 'none' }}
              />
            </Tabs>
          </Box>
          
          {uploadSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Gönderi başarıyla paylaşıldı! Yönlendiriliyorsunuz...
            </Alert>
          ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          ) : null}
        
        <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Başlık"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            {/* Video Seçimi */}
            {postType === 'video' && (
              <Box sx={{ mb: 3, mt: 2 }}>
              <input
                type="file"
                accept="video/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                onChange={handleFileChange}
              />
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current.click()}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    border: '2px dashed rgba(76, 175, 80, 0.5)',
                    borderRadius: 2,
                    '&:hover': {
                      border: '2px dashed #4CAF50'
                    }
                  }}
                >
                  {formData.videoFile ? `Seçilen Video: ${formData.videoFile.name}` : 'Video Dosyası Seç'}
            </Button>
          </Box>
            )}
            
            {/* Görsel Seçimi */}
            {postType === 'image' && (
              <Box sx={{ mb: 3, mt: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={imageInputRef}
                  onChange={handleImageChange}
                />
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PhotoCamera />}
                  onClick={() => imageInputRef.current.click()}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    border: '2px dashed rgba(76, 175, 80, 0.5)',
                    borderRadius: 2,
                    '&:hover': {
                      border: '2px dashed #4CAF50'
                    }
                  }}
                >
                  {formData.imageFile ? `Seçilen Görsel: ${formData.imageFile.name}` : 'Görsel Dosyası Seç'}
                </Button>
            </Box>
          )}
          
            {/* Metin İçeriği */}
            {postType === 'text' && (
          <TextField
            fullWidth
                label="Metin İçeriği"
                name="textContent"
                value={formData.textContent}
                onChange={handleFormChange}
            margin="normal"
            multiline
                rows={6}
                required={postType === 'text'}
                sx={{ mb: 2 }}
          />
            )}
          
            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              name="category"
              value={formData.category}
                onChange={handleFormChange}
              label="Kategori"
                required
            >
              <MenuItem value="maç">Maç</MenuItem>
              <MenuItem value="antrenman">Antrenman</MenuItem>
              <MenuItem value="röportaj">Röportaj</MenuItem>
              <MenuItem value="diğer">Diğer</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
              fullWidth
            label="Etiketler (virgülle ayırın)"
            name="tags"
            value={formData.tags}
              onChange={handleFormChange}
            margin="normal"
              placeholder="Örnek: futbol, gol, penaltı"
              sx={{ mb: 3 }}
          />
          
          <FormControlLabel
            control={
                <Switch
                checked={formData.isPublic} 
                  onChange={handleFormChange}
                name="isPublic" 
                color="primary"
              />
            }
            label="Herkese açık"
          />
          
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
                disabled={loading || (postType === 'video' && !formData.videoFile) || (postType === 'image' && !formData.imageFile) || (postType === 'text' && !formData.textContent)}
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 28,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(76,175,80,0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 14px rgba(76,175,80,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
                {loading ? 'Yükleniyor...' : 'Gönderiyi Paylaş'}
          </Button>
            </Box>
        </form>
      </Paper>
      </Box>
    </Container>
  );
}

export default UploadVideo;
