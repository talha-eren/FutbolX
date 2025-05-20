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
    required: true
  },
  field: {
    type: Number,
    min: 1,
    max: 3,
    default: 1,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['beklemede', 'onaylandı', 'iptal edildi', 'tamamlandı'],
    default: 'beklemede'
  },
  paymentStatus: {
    type: String,
    enum: ['beklemede', 'ödendi', 'iptal edildi'],
    default: 'beklemede'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation; 