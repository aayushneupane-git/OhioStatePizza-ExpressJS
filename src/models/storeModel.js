const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  website: String,
  openTime: String,
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  }
});

module.exports = mongoose.model('Store', storeSchema);
