const Store = require('../models/storeModel');
const Employee = require('../models/employeeModel');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Enhanced Geocoding Helper that accepts full address or ZIP code
const geocodeAddress = async (addressData) => {
  const apiKey = process.env.OPENCAGE_API_KEY || "93c210c9d6684dfb98359e4d4f1a8df6"; // Use env var in production
  let query;
  
  if (addressData.fullAddress) {
    query = encodeURIComponent(addressData.fullAddress);
  } else if (addressData.zipCode) {
    query = encodeURIComponent(addressData.zipCode);
  } else {
    throw new Error("Either fullAddress or zipCode is required");
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}&countrycode=us&limit=1`;

  try {
    const response = await axios.get(url);
    const result = response.data?.results?.[0];

    if (!result) throw new Error("No coordinates found for the address.");
    
    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng,
      formattedAddress: result.formatted, // Full formatted address
      addressComponents: result.components // Detailed address components
    };
  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw error;
  }
};

// ✅ Create Store and Manager (with enhanced location handling)
exports.createStoreWithManager = async (req, res) => {
  try {
    const {
      name, 
      address, 
      city,
      state,
      zipCode,
      phone, 
      website,
      openTime, 
      status, 
      email, 
      password
    } = req.body;

    if (!zipCode && !address) {
      return res.status(400).json({ error: 'Either full address or ZIP code is required.' });
    }

    // Geocode using either full address or just ZIP code
    const geoData = await geocodeAddress({
      fullAddress: `${address}, ${city}, ${state} ${zipCode}`,
      zipCode
    });

    const store = await Store.create({
      name,
      address: {
        street: address,
        city,
        state,
        zipCode,
        formatted: geoData.formattedAddress,
        location: {
          type: "Point",
          coordinates: [geoData.lng, geoData.lat]
        }
      },
      phone,
      website,
      openTime,
      status
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await Employee.create({
      name: `${name} Manager`,
      email,
      password: hashedPassword,
      role: 'manager',
      storeId: store._id
    });

    res.status(201).json({ 
      message: 'Store and Manager created successfully', 
      store,
      manager 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Failed to create store',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ Update Store with better address handling
exports.updateStore = async (req, res) => {
  try {
    const update = req.body;
    const storeId = req.params.id;

    // If any address component is being updated, re-geocode
    if (update.address || update.city || update.state || update.zipCode) {
      const existingStore = await Store.findById(storeId);
      if (!existingStore) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const addressToGeocode = {
        fullAddress: [
          update.address || existingStore.address.street,
          update.city || existingStore.address.city,
          update.state || existingStore.address.state,
          update.zipCode || existingStore.address.zipCode
        ].join(', ')
      };

      const geoData = await geocodeAddress(addressToGeocode);

      update.address = {
        street: update.address || existingStore.address.street,
        city: update.city || existingStore.address.city,
        state: update.state || existingStore.address.state,
        zipCode: update.zipCode || existingStore.address.zipCode,
        formatted: geoData.formattedAddress,
        location: {
          type: 'Point',
          coordinates: [geoData.lng, geoData.lat]
        }
      };
    }

    const updatedStore = await Store.findByIdAndUpdate(storeId, update, {
      new: true,
      runValidators: true
    });

    if (!updatedStore) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.status(200).json({ 
      message: 'Store updated successfully',
      store: updatedStore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Failed to update store',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
