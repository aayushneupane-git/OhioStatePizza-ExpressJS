const mongoose = require('mongoose');

const specialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: String,
  description: String,
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  image: String,
  available: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, { timestamps: true });

const Special = mongoose.model('Special', specialSchema);
module.exports = Special;
