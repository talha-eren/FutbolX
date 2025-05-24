import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

// Define HeadersInit type if not available
type HeadersInit = {
  [key: string]: string;
};

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
      console.log(`${(data as any[]).length} halı saha verileri alındı`);
      return data as Field[];
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
      console.log('Halı saha detayı alındı:', (data as Field).name);
      return data as Field;
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
      console.log(`${city} şehrinde ${(data as any[]).length} halı saha bulundu`);
      return data as Field[];
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
      console.log(`${district} ilçesinde ${(data as any[]).length} halı saha bulundu`);
      return data as Field[];
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
      console.log(`${(data as any).added || 0} halı saha veritabanına eklendi`);
      return true;
    } catch (error) {
      console.error('Verileri veritabanına ekleme hatası:', error);
      return false;
    }
  },
  
  // Sporyum 23 halı saha bilgilerini getir
  getSporyum23Fields: async (): Promise<any> => {
    try {
      console.log('Sporyum 23 halı saha bilgileri getiriliyor...');
      
      // Gerçek API'den veri çekmeyi deneyelim
      try {
        const token = await AsyncStorage.getItem('token');
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}/fields/name/Sporyum%2023`, {
          method: 'GET',
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Sporyum 23 verileri API\'den alındı');
          return data;
        }
      } catch (apiError) {
        console.log('API\'den veri alınamadı, statik veriler kullanılacak', apiError);
      }
      
      // API'den veri alınamazsa statik verileri döndür
      const sporyum23 = {
        id: 'sporyum23',
        name: 'Sporyum 23',
        location: 'Çaydaçıra Mah. Zübeyde Hanım Caddesi No:23, Elazığ/Merkez',
        address: 'Çaydaçıra Mah. Zübeyde Hanım Caddesi No:23',
        city: 'Elazığ',
        district: 'Merkez',
        phone: '0424 238 23 23',
        email: 'info@sporyum23.com',
        website: 'https://www.sporyum23.com',
        description: 'Elazığ\'ın en modern halı saha tesisi, gece aydınlatmalı kapalı sahaları ile kaliteli bir oyun deneyimi sunuyor.',
        images: [
          'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop'
        ],
        featuredImage: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
        price: 450,
        hourlyRates: {
          '09-10': 300,
          '10-11': 300,
          '11-12': 300,
          '12-13': 300,
          '13-14': 320,
          '14-15': 320,
          '15-16': 320,
          '16-17': 350,
          '17-18': 350,
          '18-19': 380,
          '19-20': 380,
          '20-21': 380,
          '21-22': 350,
          '22-23': 350,
          '23-00': 320,
        },
        features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya', 'Aydınlatma'],
        openingHours: {
          monday: { open: '09:00', close: '00:00' },
          tuesday: { open: '09:00', close: '00:00' },
          wednesday: { open: '09:00', close: '00:00' },
          thursday: { open: '09:00', close: '00:00' },
          friday: { open: '09:00', close: '00:00' },
          saturday: { open: '09:00', close: '00:00' },
          sunday: { open: '09:00', close: '00:00' }
        },
        rating: 4.8,
        ratingCount: 128,
        lat: 38.674953,
        lng: 39.186031,
        isActive: true,
        // Kapalı sahalar
        indoorFields: [
          {
            id: 'sporyum23-indoor-1',
            name: 'Kapalı Saha 1',
            description: 'Profesyonel standartlarda, tam boy kapalı halı saha',
            size: '25m x 40m',
            price: 450,
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            features: ['Profesyonel Zemin', 'Tam Boy', 'Klima']
          },
          {
            id: 'sporyum23-indoor-2',
            name: 'Kapalı Saha 2',
            description: 'Orta boy, kapalı halı saha',
            size: '20m x 35m',
            price: 400,
            image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
            features: ['Standart Zemin', 'Orta Boy', 'Klima']
          },
          {
            id: 'sporyum23-indoor-3',
            name: 'Kapalı Saha 3',
            description: 'Küçük boy, kapalı halı saha',
            size: '15m x 25m',
            price: 350,
            image: 'https://images.unsplash.com/photo-1542541864-c0e546f4b689?q=80&w=1470&auto=format&fit=crop',
            features: ['Standart Zemin', 'Küçük Boy', 'Klima']
          }
        ]
      };
      
      return sporyum23;
    } catch (error) {
      console.error('Sporyum 23 verilerini getirme hatası:', error);
      throw error;
    }
  }
}; 