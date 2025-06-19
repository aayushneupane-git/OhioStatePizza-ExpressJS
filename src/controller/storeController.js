const Store = require('../models/storeModel');
const Employee = require('../models/employeeModel');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Helper: Geocode ZIP Code to Coordinates
const geocodeZip = async (zipCode) => {
  const apiKey = "93c210c9d6684dfb98359e4d4f1a8df6"; // replace with environment variable in production
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${zipCode}&key=${apiKey}&countrycode=us&limit=1`;

  try {
    const response = await axios.get(url);
    const result = response.data?.results?.[0];

    if (!result) throw new Error("No coordinates found for ZIP code.");

    const { lat, lng } = result.geometry;
    return { lat, lng };
  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw error;
  }
};

// ✅ Create Store and Manager (includes location)
exports.createStoreWithManager = async (req, res) => {
  try {
    const {
      name, address, phone, website,
      openTime, status, email, password, zipCode
    } = req.body;

    if (!zipCode) {
      return res.status(400).json({ error: 'ZIP code is required to determine location.' });
    }

    const { lat, lng } = await geocodeZip(zipCode);

    const store = await Store.create({
      name,
      address,
      phone,
      website,
      openTime,
      status,
      location: {
        type: "Point",
        coordinates: [lng, lat]
      }
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Stores
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.status(200).json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Store (preserve location unless explicitly updated)
exports.updateStore = async (req, res) => {
  try {
    const update = req.body;

    // Optional: if ZIP is being updated, re-geocode
    if (update.zipCode) {
      const { lat, lng } = await geocodeZip(update.zipCode);
      update.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      delete update.zipCode;
    }

    const store = await Store.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!store) return res.status(404).json({ error: 'Store not found' });

    res.status(200).json({ message: 'Store updated', store });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Store and Manager
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
