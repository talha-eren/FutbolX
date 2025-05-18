import { getApiUrl } from './networkConfig';

/**
 * Backend API ile iletişim kurmak için temel HTTP metotları
 */
const apiClient = {
  /**
   * GET isteği gönder
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - API yanıtı
   */
  get: async (endpoint, options = {}) => {
    try {
      const url = await getApiUrl(endpoint);
      console.log(`API isteği gönderiliyor: ${url}`);
      console.log(`Fetch isteği gönderiliyor: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API hata: ${response.status} - ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`GET isteği hatası (${endpoint}):`, error);
      throw error;
    }
  },
  
  /**
   * POST isteği gönder
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Gönderilecek veri
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - API yanıtı
   */
  post: async (endpoint, data, options = {}) => {
    try {
      const url = await getApiUrl(endpoint);
      console.log(`API isteği gönderiliyor: ${url}`);
      console.log(`Giriş verileri: ${JSON.stringify(data, (key, value) => 
        key === 'password' ? '***' : value
      )}`);
      console.log(`Fetch isteği gönderiliyor: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API hata: ${response.status} - ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`POST isteği hatası (${endpoint}):`, error);
      throw error;
    }
  },
  
  /**
   * PUT isteği gönder
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Gönderilecek veri
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - API yanıtı
   */
  put: async (endpoint, data, options = {}) => {
    try {
      const url = await getApiUrl(endpoint);
      console.log(`API isteği gönderiliyor: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API hata: ${response.status} - ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`PUT isteği hatası (${endpoint}):`, error);
      throw error;
    }
  },
  
  /**
   * DELETE isteği gönder
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - API yanıtı
   */
  delete: async (endpoint, options = {}) => {
    try {
      const url = await getApiUrl(endpoint);
      console.log(`API isteği gönderiliyor: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API hata: ${response.status} - ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`DELETE isteği hatası (${endpoint}):`, error);
      throw error;
    }
  }
};

export default apiClient; 