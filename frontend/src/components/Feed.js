import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { Favorite, ChatBubble, Share } from '@mui/icons-material';

function Feed() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: 'futbolcu1',
      videoUrl: '/videos/gol1.mp4',
      description: 'Harika bir gol!',
      likes: 120,
      comments: 15,
    },
    {
      id: 2,
      username: 'futbolcu2',
      videoUrl: '/videos/gol2.mp4',
      description: 'Son dakika golü!',
      likes: 85,
      comments: 8,
    },
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <div className="feed-container">
      {posts.map(post => (
        <Card key={post.id} className="post-card">
          <video
            className="post-video"
            src={post.videoUrl}
            controls
            loop
            playsInline
          />
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
              {post.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.description}
            </Typography>
          </CardContent>
          <Box className="interaction-buttons">
            <IconButton onClick={() => handleLike(post.id)}>
              <Favorite />
              <Typography variant="body2">{post.likes}</Typography>
            </IconButton>
            <IconButton>
              <ChatBubble />
              <Typography variant="body2">{post.comments}</Typography>
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
          </Box>
        </Card>
      ))}
    </div>
  );
}

export default Feed;
