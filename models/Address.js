// ============================================================
// Address Model — stores multiple addresses per user
// ============================================================

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  label: {
    type: String,
    default: 'Home', // e.g. Home, Work, Other
  },
  street: {
    type: String,
    required: [true, 'Street is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  zip: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Address', addressSchema);
