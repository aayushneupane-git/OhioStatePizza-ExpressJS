const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: String, // e.g., CEO, Manager
  company: String,  // optional: Apple, Google etc.
  message: {
    type: String,
    required: true
  },
  avatar: String, // Image URL or path
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
