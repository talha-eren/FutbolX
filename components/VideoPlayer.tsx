import React from 'react';
import { View } from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = ({ uri }) => {
  return (
    <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}>
      <Video
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        controls
        resizeMode="contain"
      />
    </View>
  );
};

export default VideoPlayer;
