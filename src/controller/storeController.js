const Store = require('../models/storeModel');
const Employee = require('../models/employeeModel');
const bcrypt = require('bcryptjs');

// Create Store and Manager
exports.createStoreWithManager = async (req, res) => {
  try {
    const {
      name, address, phone, website,
      openTime, status, email, password
    } = req.body;

    const store = await Store.create({
      name, address, phone, website, openTime, status
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await Employee.create({
      name: name + ' Manager',
      email,
      password: hashedPassword,
      role: 'manager',
      storeId: store._id
    });

    res.status(201).json({ message: 'Store and Manager created', store, manager });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Stores
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.status(200).json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Store
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.status(200).json({ message: 'Store updated', store });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Store and Manager
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });

    await Employee.deleteOne({ storeId: store._id, role: 'manager' });

    res.status(200).json({ message: 'Store and manager deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
