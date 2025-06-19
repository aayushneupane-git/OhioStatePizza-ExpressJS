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
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
});

// ✅ Add geospatial index
storeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', storeSchema);
