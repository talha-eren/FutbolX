const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    trim: true,
    default: 'Misafir'
  },
  customerPhone: {
    type: String,
    trim: true,
    default: 'Telefon Bilgisi Yok'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: function() {
      // Yeni oluşturulurken zorunlu, güncelleme sırasında opsiyonel
      return this.isNew;
    },
    default: 450
  },
  field: {
    type: Number,
    min: 1,
    max: 3,
    default: 1,
    required: function() {
      // Yeni oluşturulurken zorunlu, güncelleme sırasında opsiyonel
      return this.isNew;
    }
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['beklemede', 'onaylandı', 'iptal edildi', 'tamamlandı', 'Onay bekliyor', 'Onay Bekliyor', 'onay bekliyor'],
    default: 'beklemede'
  },
  paymentStatus: {
    type: String,
    enum: ['beklemede', 'ödendi', 'iptal edildi', 'Ödenmedi', 'ödenmedi'],
    default: 'beklemede'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  indoorField: {
    type: String,
    trim: true,
    default: ''
  }
});

// MongoDB'ye kaydetmeden önce statü değerlerini normalize et
reservationSchema.pre('save', function(next) {
  // Status değerini normalize et
  if (this.status && typeof this.status === 'string') {
    // Tüm "onay bekliyor" türevlerini "beklemede" olarak standartlaştır
    if (this.status.toLowerCase().includes('onay') && this.status.toLowerCase().includes('bekl')) {
      this.status = 'beklemede';
    }
    
    // Diğer statü kontrollerini ekle
    if (this.status.toLowerCase() === 'onaylandı' || this.status.toLowerCase() === 'onayli' || this.status.toLowerCase() === 'onaylı') {
      this.status = 'onaylandı';
    }
    
    if (this.status.toLowerCase().includes('iptal')) {
      this.status = 'iptal edildi';
    }
    
    if (this.status.toLowerCase().includes('tamam')) {
      this.status = 'tamamlandı';
    }
  }
  
  // Eğer price değeri eksikse ve isNew değilse, varsayılan 450 değerini ata
  if (!this.price && !this.isNew) {
    this.price = 450; 
  }
  
  // Eğer field değeri eksikse ve isNew değilse, varsayılan 1 değerini ata
  if (!this.field && !this.isNew) {
    this.field = 1;
  }
  
  // PaymentStatus değerini normalize et
  if (this.paymentStatus && typeof this.paymentStatus === 'string') {
    if (this.paymentStatus.toLowerCase().includes('öden') && this.paymentStatus.toLowerCase().includes('me')) {
      this.paymentStatus = 'beklemede';
    }
    
    if (this.paymentStatus.toLowerCase().includes('öden') && !this.paymentStatus.toLowerCase().includes('me')) {
      this.paymentStatus = 'ödendi';
    }
  }
  
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation; 