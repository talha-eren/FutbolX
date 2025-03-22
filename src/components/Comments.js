import React, { useState } from 'react';
import { Box, TextField, Button, Avatar, Typography, Divider } from '@mui/material';
import { Send } from '@mui/icons-material';

function Comments({ comments, onAddComment }) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment({
        username: 'sen', // Gerçek uygulamada oturum açmış kullanıcı
        text: newComment,
        timestamp: 'Şimdi',
        color: '#4CAF50'
      });
      setNewComment('');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Yorumlar ({comments.length})
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Yorum yaz..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!newComment.trim()}
          sx={{
            minWidth: 'unset',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: 0
          }}
        >
          <Send />
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {comments.map((comment, index) => (
          <Box key={index}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: comment.color,
                  fontSize: '0.875rem'
                }}
              >
                {comment.username[0].toUpperCase()}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">
                    {comment.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comment.timestamp}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {comment.text}
                </Typography>
              </Box>
            </Box>
            {index < comments.length - 1 && (
              <Divider sx={{ mt: 2 }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Comments;
