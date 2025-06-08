const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'  
  }],
  isSpecial: {
    type: Boolean,
    default : false
  },
  image: String,
}, { timestamps: true });

const Specials = mongoose.model('Combo', comboSchema);
module.exports = Specials;
