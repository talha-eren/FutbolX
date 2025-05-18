import React, { useState } from 'react';
import { Box, TextField, Button, Avatar, Typography, Divider, CircularProgress } from '@mui/material';
import { Send, Reply } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CommentSection({ videoId, comments, onAddComment }) {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tarih formatı
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Yorum yapmak için giriş yapmalısınız!');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`http://localhost:5000/api/videos/${videoId}/comment`, 
        { text: newComment },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      onAddComment(response.data);
      setNewComment('');
    } catch (err) {
      console.error('Yorum gönderme hatası:', err);
      setError('Yorum gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Yorumlar {comments?.length > 0 && `(${comments.length})`}
      </Typography>
      
      {comments?.length > 0 ? (
        comments.map((comment, index) => (
          <Box key={comment._id || index} sx={{ 
            display: 'flex', 
            mb: 3, 
            alignItems: 'flex-start',
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
          }}>
            <Link to={`/profile/${comment.user?._id}`} style={{ textDecoration: 'none' }}>
              <Avatar 
                src={comment.user?.profilePicture} 
                sx={{ width: 40, height: 40, mr: 2, bgcolor: '#4CAF50' }}
              >
                {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Link>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Link to={`/profile/${comment.user?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {comment.user?.username || 'Kullanıcı'}
                  </Typography>
                </Link>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comment.createdAt)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                {comment.text}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  size="small" 
                  startIcon={<Reply fontSize="small" />} 
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Yanıtla
                </Button>
              </Box>
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 3 }}>
          Henüz yorum yok. İlk yorumu sen yap!
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Yorum yaz..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          variant="outlined"
          multiline
          maxRows={4}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!newComment.trim() || loading}
          sx={{ minWidth: 'unset', height: 'fit-content' }}
        >
          {loading ? <CircularProgress size={20} /> : <Send />}
        </Button>
      </form>
    </Box>
  );
}

export default CommentSection;
