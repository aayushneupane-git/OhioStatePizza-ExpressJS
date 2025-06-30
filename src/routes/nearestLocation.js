const express = require("express");
const MenuItem = require("../models/menuItemModel");
const Store = require("../models/storeModel");
const geocodeZip = require("../config/geocodeAPI");

const router = express.Router();

router.get("/items-by-zip/:zipCode", async (req, res) => {
  try {
    const { zipCode } = req.params;

    // Get lat/lng of the customer's ZIP
    const { lat, lng } = await geocodeZip(zipCode);
    if (!lat || !lng) return res.status(400).json({ message: "Invalid ZIP code." });

    const maxDistanceInMiles = 18;
    const maxDistanceInMeters = maxDistanceInMiles * 1609.34;

    // Find the nearest store within 18 miles
    const nearestStore = await Store.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistanceInMeters,
        },
      },
    });


    if (!nearestStore) {
      return res.status(404).json({ message: "Store can't deliver to that location." });
    }

    // Get menu items available at this store
    const items = await MenuItem.find({
      [`availabilityByStore.${nearestStore._id}`]: "Available",
    });

    res.json({ store: nearestStore, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
