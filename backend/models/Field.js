const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slugId: {
    type: String,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  image: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    enum: ['Müsait', 'Dolu', 'Bakımda'],
    default: 'Müsait'
  },
  description: {
    type: String,
    default: ''
  },
  features: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Yeni alan kaydetmeden önce slugId oluştur
fieldSchema.pre('save', function(next) {
  // Eğer slugId zaten tanımlanmışsa, onu koru
  if (this.slugId) {
    return next();
  }
  
  // Ad alanından slug oluştur
  if (this.name) {
    // Türkçe karakterleri İngilizce eşdeğerleriyle değiştir
    const turkishToEnglish = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    
    let slug = this.name.toLowerCase();
    
    // Türkçe karakterleri değiştir
    Object.keys(turkishToEnglish).forEach(letter => {
      slug = slug.replace(new RegExp(letter, 'g'), turkishToEnglish[letter]);
    });
    
    // Boşlukları tire ile değiştir ve özel karakterleri kaldır
    slug = slug.replace(/\s+/g, '-')     // Boşlukları tirelere dönüştür
               .replace(/[^a-z0-9-]/g, '') // Sadece harfler, rakamlar ve tireleri kabul et
               .replace(/-+/g, '-')       // Birden fazla tireyi tek tireye dönüştür
               .replace(/^-|-$/g, '');    // Baştaki ve sondaki tireleri kaldır
    
    this.slugId = slug;
  }
  
  next();
});

const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;
