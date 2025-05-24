const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  // Kapalı saha bilgileri için ek alan
  indoorField: {
    type: String,
    enum: ['sporyum23-indoor-1', 'sporyum23-indoor-2', 'sporyum23-indoor-3'],
    required: function() {
      // Eğer field Sporyum 23 ise bu alan zorunlu
      return this.field && this.field.toString() === 'sporyum23';
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  status: {
    type: String,
    enum: ['Onay Bekliyor', 'Onaylandı', 'İptal Edildi', 'Tamamlandı'],
    default: 'Onay Bekliyor'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Ödenmedi', 'Ödendi', 'Kısmi Ödeme', 'İade Edildi'],
    default: 'Ödenmedi'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Katılımcılar için yeni alan
  participants: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      confirmed: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  // Maç tipi için yeni alan
  matchType: {
    type: String,
    enum: ['Özel Maç', 'Turnuva', 'Antrenman', 'Diğer'],
    default: 'Özel Maç'
  }
});

// Aynı saha, tarih ve saat için çakışma kontrolü için index
reservationSchema.index({ field: 1, indoorField: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

// Rezervasyon kaydetmeden önce yapılacak işlemler
reservationSchema.pre('save', function(next) {
  console.log('Rezervasyon pre-save hook çalıştırılıyor:', {
    field: this.field,
    indoorField: this.indoorField, 
    user: this.user,
    date: this.date,
    startTime: this.startTime,
    endTime: this.endTime
  });
  
  // Kullanıcı ID kontrolü
  if (!this.user) {
    const error = new Error('Rezervasyon için kullanıcı ID\'si gereklidir');
    return next(error);
  }
  
  // Sporyum 23 için indoorField kontrolü - string karşılaştırma yapmak yerine daha esnek bir kontrol
  const fieldId = this.field && this.field.toString();
  // Eğer fieldId değeri Sporium 23 ile ilgiliyse ve kapalı saha bilgisi yoksa
  if (fieldId && 
      (fieldId === 'sporium23' || 
       fieldId.includes('sporyum') || 
       fieldId.includes('sporium')) && 
      !this.indoorField) {
    const error = new Error('Sporyum 23 için kapalı saha ID\'si gereklidir');
    return next(error);
  }
  
  // Tarih kontrolü - geçmiş tarihler için rezervasyon yapılamaz
  const now = new Date();
  const reservationDate = new Date(this.date);
  
  if (reservationDate < now && this.isNew) {
    const error = new Error('Geçmiş tarihler için rezervasyon yapılamaz');
    return next(error);
  }
  
  // Başlangıç ve bitiş saati kontrolü
  const startHour = parseInt(this.startTime.split(':')[0]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  
  if (startHour >= endHour) {
    const error = new Error('Bitiş saati başlangıç saatinden sonra olmalıdır');
    return next(error);
  }
  
  next();
});

// Belirli bir tarihte müsait saatleri kontrol etmek için statik metod
reservationSchema.statics.checkAvailability = async function(fieldId, indoorFieldId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // O gün için tüm rezervasyonları getir
  const reservations = await this.find({
    field: fieldId,
    indoorField: indoorFieldId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $ne: 'İptal Edildi' }
  }).select('startTime endTime');
  
  // Çalışma saatleri (09:00 - 00:00)
  const workingHours = {
    start: 9,
    end: 24 // 00:00 için 24 kullanılıyor
  };
  
  // Tüm saatleri oluştur ve müsaitlik durumunu belirle
  const timeSlots = [];
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    // Bu saat aralığında rezervasyon var mı kontrol et
    const isReserved = reservations.some(reservation => {
      const resStart = parseInt(reservation.startTime.split(':')[0]);
      const resEnd = parseInt(reservation.endTime.split(':')[0]);
      
      return (hour >= resStart && hour < resEnd);
    });
    
    timeSlots.push({
      startTime,
      endTime,
      available: !isReserved
    });
  }
  
  return timeSlots;
};

// Tarih-saat çakışması kontrolü
reservationSchema.statics.checkConflict = async function(fieldId, indoorFieldId, date, startTime, endTime) {
  // Tarih formatını yyyy-mm-dd şekline getir
  const formattedDate = new Date(date).toISOString().split('T')[0];
  
  console.log('Çakışma kontrolü yapılıyor:', {
    field: fieldId,
    indoorField: indoorFieldId,
    date: formattedDate,
    startTime,
    endTime
  });
  
  // Aynı tarih ve saat aralığında, aynı sahada (ve eğer varsa aynı kapalı sahada) rezervasyon var mı kontrol et
  const query = {
    date: {
      $gte: new Date(`${formattedDate}T00:00:00.000Z`),
      $lt: new Date(`${formattedDate}T23:59:59.999Z`),
    },
    startTime,
    endTime,
    field: fieldId
  };
  
  // Eğer kapalı saha ID'si varsa, onu da koşullara ekle
  if (indoorFieldId) {
    query.indoorField = indoorFieldId;
  }
  
  const existingReservation = await this.findOne(query);
  
  if (existingReservation) {
    console.log('Çakışan rezervasyon bulundu:', existingReservation._id);
    return existingReservation;
  }
  
  console.log('Çakışan rezervasyon yok, rezervasyon yapılabilir');
  return null;
};

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
