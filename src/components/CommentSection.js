import React, { useState } from 'react';
import { Box, TextField, Button, Avatar, Typography, Divider } from '@mui/material';
import { Send } from '@mui/icons-material';

function CommentSection({ comments, onAddComment }) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Yorumlar
      </Typography>
      
      {comments.map((comment, index) => (
        <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: comment.color || '#4CAF50' }}>
            {comment.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {comment.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {comment.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {comment.timestamp}
            </Typography>
          </Box>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Yorum yaz..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!newComment.trim()}
          sx={{ minWidth: 'unset' }}
        >
          <Send />
        </Button>
      </form>
    </Box>
  );
}

export default CommentSection;
