const mongoose = require('mongoose');

const optionItemSchema = new mongoose.Schema({
  label: String,
  priceModifier: Number
}, { _id: false });

const optionsSchema = new mongoose.Schema({
  sizes: [optionItemSchema],
  addOns: [optionItemSchema],
  crusts: [optionItemSchema],
  sauces: [optionItemSchema],
  meats: [optionItemSchema],
  veggies: [optionItemSchema],
  dips: [optionItemSchema],
  flavors: [optionItemSchema],
  extras: [optionItemSchema]
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  price: Number,
  status: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available'
  },
  options: {
    type: optionsSchema,
    default: {}
  },
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
