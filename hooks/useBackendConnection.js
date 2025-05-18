import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { testBackendConnection, getApiBaseUrl } from '../services/networkConfig';

/**
 * Backend bağlantısını yöneten hook
 * 
 * @returns {{
 *   isConnected: boolean,
 *   isBackendAvailable: boolean,
 *   apiBaseUrl: string | null,
 *   refreshConnection: () => Promise<void>
 * }}
 */
const useBackendConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState(null);
  
  // Bağlantı durumunu yenileyen fonksiyon
  const refreshConnection = async () => {
    // Önce ağ bağlantısını kontrol et
    const netInfo = await NetInfo.fetch();
    const connected = netInfo.isConnected;
    setIsConnected(connected);
    
    if (connected) {
      // Ardından backend bağlantısını test et
      const backendAvailable = await testBackendConnection();
      setIsBackendAvailable(backendAvailable);
      
      // API URL'yi güncelle
      const baseUrl = await getApiBaseUrl();
      setApiBaseUrl(baseUrl);
      
      return { connected, backendAvailable, baseUrl };
    }
    
    return { connected, backendAvailable: false, baseUrl: null };
  };
  
  useEffect(() => {
    // İlk yüklemede bağlantıyı kontrol et
    refreshConnection();
    
    // Ağ bağlantısı değişikliklerini dinle
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Eğer bağlantı durumu değiştiyse backend bağlantısını yeniden kontrol et
      if (state.isConnected) {
        refreshConnection();
      } else {
        setIsBackendAvailable(false);
      }
    });
    
    // Uygulama durumu değişikliklerini dinle (arka plandan ön plana geçiş gibi)
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // Uygulama ön plana geldiğinde bağlantıyı kontrol et
        refreshConnection();
      }
    });
    
    // Cleanup fonksiyonu
    return () => {
      unsubscribeNetInfo();
      appStateSubscription.remove();
    };
  }, []);
  
  return {
    isConnected,
    isBackendAvailable,
    apiBaseUrl,
    refreshConnection
  };
};

export default useBackendConnection; 