const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  location: { 
    type: String, 
    required: true,
    trim: true 
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  price: { 
    type: Number, 
    required: true 
  },
  priceUnit: {
    type: String,
    default: 'TL/saat'
  },
  image: { 
    type: String, 
    default: 'default-venue.jpg' 
  },
  images: [String],
  contact: { 
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  amenities: [String],
  workingHours: { 
    type: String,
    trim: true
  },
  workingDays: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  size: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number
  },
  indoor: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue; 