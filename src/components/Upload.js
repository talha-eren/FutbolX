import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

function Upload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
    } else {
      alert('Lütfen geçerli bir video dosyası seçin');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Backend entegrasyonu burada yapılacak
    console.log('Video yükleniyor:', file, description);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Yeni Video Yükle
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <input
              accept="video/*"
              style={{ display: 'none' }}
              id="video-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="video-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Video Seç
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Seçilen dosya: {file.name}
              </Typography>
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Açıklama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!file}
          >
            Yükle
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Upload;
