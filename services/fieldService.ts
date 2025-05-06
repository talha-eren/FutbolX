import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

// Halı saha veri tipleri
export type Field = {
  id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  images: string[];
  featuredImage: string;
  price: number;
  hourlyRates: {
    [key: string]: number; // '09-10': 250, '10-11': 300, vs.
  };
  features: string[];
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    }; // 'monday': { open: '09:00', close: '23:00' }
  };
  rating: number;
  ratingCount: number;
  lat: number;
  lng: number;
  isActive: boolean;
};

// Halı saha servisleri
export const fieldService = {
  // Tüm halı sahaları getir
  getAll: async (): Promise<Field[]> => {
    try {
      console.log('Halı sahalar getiriliyor...');
      const token = await AsyncStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/fields`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Halı sahaları getirme başarısız');
      }
      
      const data = await response.json();
      console.log(`${data.length} halı saha verileri alındı`);
      return data;
    } catch (error) {
      console.error('Halı sahaları getirme hatası:', error);
      return []; // Hata durumunda boş dizi döndür
    }
  },
  
  // Halı saha detayı getir
  getById: async (id: string): Promise<Field | null> => {
    try {
      console.log(`Halı saha detayı getiriliyor (${id})...`);
      const token = await AsyncStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/fields/${id}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Halı saha detayını getirme başarısız');
      }
      
      const data = await response.json();
      console.log('Halı saha detayı alındı:', data.name);
      return data;
    } catch (error) {
      console.error('Halı saha detayını getirme hatası:', error);
      return null; // Hata durumunda null döndür
    }
  },
  
  // Şehre göre halı sahaları getir
  getByCity: async (city: string): Promise<Field[]> => {
    try {
      console.log(`${city} şehrindeki halı sahalar getiriliyor...`);
      const token = await AsyncStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/fields/city/${city}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Şehirdeki halı sahaları getirme başarısız');
      }
      
      const data = await response.json();
      console.log(`${city} şehrinde ${data.length} halı saha bulundu`);
      return data;
    } catch (error) {
      console.error('Şehirdeki halı sahaları getirme hatası:', error);
      return []; // Hata durumunda boş dizi döndür
    }
  },
  
  // İlçeye göre halı sahaları getir
  getByDistrict: async (district: string): Promise<Field[]> => {
    try {
      console.log(`${district} ilçesindeki halı sahalar getiriliyor...`);
      const token = await AsyncStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/fields/district/${district}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('İlçedeki halı sahaları getirme başarısız');
      }
      
      const data = await response.json();
      console.log(`${district} ilçesinde ${data.length} halı saha bulundu`);
      return data;
    } catch (error) {
      console.error('İlçedeki halı sahaları getirme hatası:', error);
      return []; // Hata durumunda boş dizi döndür
    }
  },
  
  // Sosyal Halı Saha sitesinden verileri çek
  fetchFromSosyalHalisaha: async (): Promise<any[]> => {
    try {
      console.log('SosyalHalisaha.com\'dan veriler çekiliyor...');
      const url = 'https://sosyalhalisaha.com/saha-filtre/23';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Veri çekme başarısız');
      }
      
      // HTML içeriğini al
      const html = await response.text();
      
      // Burada HTML parse etme işlemi yapılabilir
      // Bu örnek için statik veri döndürüyoruz
      // Gerçek bir uygulamada cheerio veya benzer bir kütüphane kullanılabilir
      
      const mockData = [
        {
          name: 'Beşiktaş Halı Saha',
          location: 'Beşiktaş, İstanbul',
          address: 'Cihannüma Mah. Barbaros Bulvarı No:12',
          city: 'İstanbul',
          district: 'Beşiktaş',
          phone: '0212 123 4567',
          featuredImage: 'https://example.com/images/besiktas1.jpg',
          price: 500,
          features: ['Kafeterya', 'Duş', 'Soyunma Odası'],
          rating: 4.5
        },
        {
          name: 'Kadıköy Halı Saha Tesisleri',
          location: 'Kadıköy, İstanbul',
          address: 'Caferağa Mah. Moda Cad. No:45',
          city: 'İstanbul',
          district: 'Kadıköy',
          phone: '0216 345 6789',
          featuredImage: 'https://example.com/images/kadikoy1.jpg',
          price: 450,
          features: ['Otopark', 'Kafeterya', 'Duş'],
          rating: 4.2
        },
        {
          name: 'Bakırköy Spor Kompleksi',
          location: 'Bakırköy, İstanbul',
          address: 'Ataköy 7-8-9-10. Kısım Mah. Kennedy Cad. No:23',
          city: 'İstanbul',
          district: 'Bakırköy',
          phone: '0212 987 6543',
          featuredImage: 'https://example.com/images/bakirkoy1.jpg',
          price: 475,
          features: ['Otopark', 'Duş', 'Soyunma Odası', 'Kafeterya'],
          rating: 4.7
        }
      ];
      
      console.log('SosyalHalisaha verilerinden örnek:', mockData.length);
      return mockData;
    } catch (error) {
      console.error('SosyalHalisaha verilerini çekme hatası:', error);
      return []; // Hata durumunda boş dizi döndür
    }
  },
  
  // Verileri veritabanına ekle
  addToDatabase: async (fields: any[]): Promise<boolean> => {
    try {
      console.log('Halı saha verileri veritabanına ekleniyor...');
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Kullanıcı girişi gereklidir');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`${API_URL}/fields/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields })
      });
      
      if (!response.ok) {
        throw new Error('Verileri veritabanına ekleme başarısız');
      }
      
      const data = await response.json();
      console.log(`${data.added || 0} halı saha veritabanına eklendi`);
      return true;
    } catch (error) {
      console.error('Verileri veritabanına ekleme hatası:', error);
      return false;
    }
  }
}; 