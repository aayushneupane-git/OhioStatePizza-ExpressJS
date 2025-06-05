const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: String,
  price: Number
});

const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  price: Number,
  status: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' },
  sizes: [optionSchema],
  addOns: [optionSchema],
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
