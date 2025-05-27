const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['BURGERS', 'PIZZAS', 'CHICKEN', 'BEVERAGES', 'COFFEE'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  tags: [String], // e.g. ['RECOMMENDED', 'NEW']
  available: {
    type: Boolean,
    default: true
  },
  image: String
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;
