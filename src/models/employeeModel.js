const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['superadmin', 'manager', 'cook','admin'],
    default: 'cook'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
