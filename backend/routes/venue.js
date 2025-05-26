const express = require('express');
const router = express.Router();

// Örnek mekan/saha verileri
const venues = [
  {
    id: 1,
    name: 'Sporium 23 Halı Saha',
    address: 'Elazığ Merkez',
    city: 'Elazığ',
    district: 'Merkez',
    phone: '+90 424 123 4567',
    email: 'info@sporium23.com',
    website: 'www.sporium23.com',
    image: '/api/images/sporium23.jpg',
    rating: 4.5,
    reviewCount: 128,
    price: 150,
    priceUnit: 'saat',
    features: [
      'Kapalı saha',
      'Profesyonel aydınlatma',
      'Soyunma odası',
      'Duş',
      'Otopark',
      'Kafeterya'
    ],
    description: 'Elazığ\'ın en modern halı saha tesisi. Profesyonel standartlarda hizmet.',
    openingHours: {
      weekdays: '09:00 - 23:00',
      weekend: '08:00 - 24:00'
    },
    coordinates: {
      lat: 38.6748,
      lng: 39.2226
    }
  },
  {
    id: 2,
    name: 'Yeşil Vadi Halı Saha',
    address: 'Ataşehir, İstanbul',
    city: 'İstanbul',
    district: 'Ataşehir',
    phone: '+90 216 456 7890',
    email: 'info@yesilvadihs.com',
    website: 'www.yesilvadihs.com',
    image: '/api/images/yesilvadi.jpg',
    rating: 4.2,
    reviewCount: 95,
    price: 200,
    priceUnit: 'saat',
    features: [
      'Açık saha',
      'Doğal çim',
      'Tribün',
      'Soyunma odası',
      'Otopark'
    ],
    description: 'Doğayla iç içe, kaliteli çim zemine sahip halı saha.',
    openingHours: {
      weekdays: '08:00 - 22:00',
      weekend: '07:00 - 23:00'
    },
    coordinates: {
      lat: 40.9929,
      lng: 29.1244
    }
  },
  {
    id: 3,
    name: 'Göztepe Park Halı Saha',
    address: 'Göztepe, İzmir',
    city: 'İzmir',
    district: 'Göztepe',
    phone: '+90 232 789 0123',
    email: 'info@goztepepark.com',
    website: 'www.goztepepark.com',
    image: '/api/images/goztepepark.jpg',
    rating: 4.0,
    reviewCount: 67,
    price: 120,
    priceUnit: 'saat',
    features: [
      'Kapalı saha',
      'Klima',
      'Soyunma odası',
      'Duş',
      'Otopark',
      'Çay ocağı'
    ],
    description: 'Şehir parkı içerisinde, temiz ve bakımlı halı saha.',
    openingHours: {
      weekdays: '09:00 - 22:00',
      weekend: '08:00 - 23:00'
    },
    coordinates: {
      lat: 38.4192,
      lng: 27.1287
    }
  },
  {
    id: 4,
    name: 'Beşiktaş Spor Kompleksi',
    address: 'Beşiktaş, İstanbul',
    city: 'İstanbul',
    district: 'Beşiktaş',
    phone: '+90 212 345 6789',
    email: 'info@besiktaskompleks.com',
    website: 'www.besiktaskompleks.com',
    image: '/api/images/besiktaskompleks.jpg',
    rating: 4.7,
    reviewCount: 203,
    price: 250,
    priceUnit: 'saat',
    features: [
      'Kapalı saha',
      'Profesyonel zemin',
      'VIP soyunma odası',
      'Jakuzi',
      'Sauna',
      'Otopark',
      'Restoran'
    ],
    description: 'Lüks spor kompleksi, profesyonel standartlarda hizmet.',
    openingHours: {
      weekdays: '06:00 - 24:00',
      weekend: '06:00 - 24:00'
    },
    coordinates: {
      lat: 41.0422,
      lng: 29.0061
    }
  },
  {
    id: 5,
    name: 'Kartal Halı Saha',
    address: 'Kartal, İstanbul',
    city: 'İstanbul',
    district: 'Kartal',
    phone: '+90 216 567 8901',
    email: 'info@kartalhalisaha.com',
    website: 'www.kartalhalisaha.com',
    image: '/api/images/kartal.jpg',
    rating: 3.8,
    reviewCount: 45,
    price: 180,
    priceUnit: 'saat',
    features: [
      'Kapalı saha',
      'Aydınlatma',
      'Soyunma odası',
      'Otopark'
    ],
    description: 'Kartal bölgesinin en uygun fiyatlı halı sahası.',
    openingHours: {
      weekdays: '10:00 - 22:00',
      weekend: '09:00 - 23:00'
    },
    coordinates: {
      lat: 40.9059,
      lng: 29.1925
    }
  }
];

// Tüm mekanları getir
router.get('/', (req, res) => {
  try {
    console.log('Mekanlar listesi istendi');
    res.json({
      success: true,
      data: venues,
      count: venues.length
    });
  } catch (error) {
    console.error('Mekanlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Mekanlar getirilirken hata oluştu',
      error: error.message
    });
  }
});

// Belirli bir mekanı getir
router.get('/:id', (req, res) => {
  try {
    const venueId = parseInt(req.params.id);
    const venue = venues.find(v => v.id === venueId);
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Mekan bulunamadı'
      });
    }
    
    console.log(`Mekan detayı istendi: ${venue.name}`);
    res.json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Mekan detayı getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Mekan detayı getirilirken hata oluştu',
      error: error.message
    });
  }
});

// Şehre göre mekanları getir
router.get('/city/:city', (req, res) => {
  try {
    const city = req.params.city;
    const cityVenues = venues.filter(v => v.city.toLowerCase() === city.toLowerCase());
    
    console.log(`${city} şehrindeki mekanlar istendi`);
    res.json({
      success: true,
      data: cityVenues,
      count: cityVenues.length
    });
  } catch (error) {
    console.error('Şehir mekanları getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Şehir mekanları getirilirken hata oluştu',
      error: error.message
    });
  }
});

// Fiyat aralığına göre mekanları getir
router.get('/price/:min/:max', (req, res) => {
  try {
    const minPrice = parseInt(req.params.min);
    const maxPrice = parseInt(req.params.max);
    
    const priceFilteredVenues = venues.filter(v => 
      v.price >= minPrice && v.price <= maxPrice
    );
    
    console.log(`${minPrice}-${maxPrice} TL fiyat aralığındaki mekanlar istendi`);
    res.json({
      success: true,
      data: priceFilteredVenues,
      count: priceFilteredVenues.length
    });
  } catch (error) {
    console.error('Fiyat filtreli mekanlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyat filtreli mekanlar getirilirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 