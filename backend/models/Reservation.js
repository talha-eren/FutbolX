const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
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
  }
});

// Aynı saha, tarih ve saat için çakışma kontrolü için index
reservationSchema.index({ field: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
