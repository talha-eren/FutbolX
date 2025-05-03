import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Bu dosya artık sharePost.tsx ile değiştirilmiştir.
 * Bu bileşen, eski videoUpload sayfasına yapılan istekleri yeni sayfa olan
 * sharePost'a yönlendirmek için basit bir yönlendirme görevi görür.
 */
const VideoUploadScreen = () => {
  const router = useRouter();

  // Component mount olunca yönlendirme yap
  useEffect(() => {
    // Kısa bir gecikme ile yönlendirme yap (Flash ekranını önlemek için)
      const timer = setTimeout(() => {
      router.replace('/(tabs)/sharePost');
    }, 100);
      
      return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Yönlendiriliyor...</Text>
        </View>
  );
};

export default VideoUploadScreen;
