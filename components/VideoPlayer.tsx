import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
  uri: string;
  thumbnailUrl?: string;
  title?: string;
  autoPlay?: boolean;
  onClose?: () => void;
  isFullScreen?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  thumbnailUrl,
  title,
  autoPlay = false,
  onClose,
  isFullScreen = false
}) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePlaybackStatusUpdate = (status: any) => {
    setStatus(status);
    if (status.isLoaded) {
      setLoading(false);
    }
  };

  const handleError = (error: string) => {
    setError(error);
    setLoading(false);
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isFullScreen) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={true}
        onRequestClose={onClose}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenVideoContainer}>
            <Video
              ref={videoRef}
              style={styles.fullScreenVideo}
              source={{ uri }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              onError={(error) => handleError(error.error.message)}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <IconSymbol name="xmark.circle.fill" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={0.9}
        onPress={togglePlayPause}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri }}
          posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
          posterStyle={styles.posterImage}
          usePoster={!!thumbnailUrl}
          resizeMode={ResizeMode.COVER}
          shouldPlay={autoPlay}
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(error) => handleError(error.error.message)}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FFCC00" />
            <ThemedText style={styles.errorText}>Video yüklenemedi</ThemedText>
          </View>
        )}

        {!loading && !error && !status.isPlaying && (
          <View style={styles.playButtonContainer}>
            <IconSymbol name="play.fill" size={32} color="#FFFFFF" />
          </View>
        )}

        {status.isPlaying && (
          <View style={styles.controlsContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressIndicator, 
                  { width: `${status.positionMillis / status.durationMillis * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <ThemedText style={styles.timeText}>
                {status.durationMillis ? formatTime(status.positionMillis) : '0:00'}
              </ThemedText>
              <ThemedText style={styles.timeText}>
                {status.durationMillis ? formatTime(status.durationMillis) : '0:00'}
              </ThemedText>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {title && <ThemedText style={styles.title}>{title}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  playButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullScreenVideoContainer: {
    width: '100%',
    height: screenWidth * (9 / 16),
    position: 'relative',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
});

export default VideoPlayer;
