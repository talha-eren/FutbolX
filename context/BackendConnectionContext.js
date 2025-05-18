import React, { createContext, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import useBackendConnection from '../hooks/useBackendConnection';

// Context oluşturma
const BackendConnectionContext = createContext({
  isConnected: false,
  isBackendAvailable: false,
  apiBaseUrl: null,
  refreshConnection: async () => {}
});

/**
 * Backend bağlantı durumunu sağlayan Provider komponenti
 */
export const BackendConnectionProvider = ({ children }) => {
  const connection = useBackendConnection();
  
  return (
    <BackendConnectionContext.Provider value={connection}>
      {children}
    </BackendConnectionContext.Provider>
  );
};

/**
 * Backend bağlantı durumunu kullanmak için hook
 */
export const useBackendConnectionContext = () => useContext(BackendConnectionContext);

/**
 * Backend bağlantısını kontrol eden ve gerekirse bir hata ekranı gösteren HOC
 */
export const withBackendConnection = (WrappedComponent) => {
  return (props) => {
    const { isConnected, isBackendAvailable, refreshConnection } = useBackendConnectionContext();
    
    // Eğer ağ bağlantısı yoksa
    if (!isConnected) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bağlantı Hatası</Text>
          <Text style={styles.message}>
            İnternet bağlantınızı kontrol edin ve tekrar deneyin.
          </Text>
          <Button 
            title="Yeniden Dene" 
            onPress={refreshConnection} 
            color="#0366d6"
          />
        </View>
      );
    }
    
    // Eğer backend'e bağlanılamıyorsa
    if (!isBackendAvailable) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Sunucu Bağlantı Hatası</Text>
          <Text style={styles.message}>
            Sunucuya bağlanılamıyor. Aynı WiFi ağında olduğunuzdan emin olun.
          </Text>
          <Button 
            title="Yeniden Dene" 
            onPress={refreshConnection} 
            color="#0366d6"
          />
        </View>
      );
    }
    
    // Her şey yolundaysa istenen komponenti göster
    return <WrappedComponent {...props} />;
  };
};

// Stilleri tanımlayalım
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666'
  }
});

export default BackendConnectionContext; 