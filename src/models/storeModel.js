const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2
    },
    zipCode: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{5}(-\d{4})?$/.test(v);
        },
        message: props => `${props.value} is not a valid ZIP code`
      }
    },
    formatted: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(v) {
            return v.length === 2 && 
                   v[0] >= -180 && v[0] <= 180 && // longitude
                   v[1] >= -90 && v[1] <= 90;    // latitude
          },
          message: props => `${props.value} is not a valid coordinate pair`
        }
      }
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(\()?\d{3}(\))?[- ]?\d{3}[- ]?\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number`
    }
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL`
    },
    lowercase: true
  },
  openTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Temporarily Closed'],
    default: 'Open'
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

// Add geospatial index for location queries
storeSchema.index({ 'address.location': '2dsphere' });

// Update timestamp on save
storeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update timestamp on update operations
storeSchema.pre('updateOne', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Store', storeSchema);