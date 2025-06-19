// routes/menu.js
const express = require("express");
const MenuItem = require("../models/menuItemModel");
const Store = require("../models/storeModel");
const geocodeZip = require("../config/geocodeAPI");

const router = express.Router();

router.get("/items-by-zip/:zipCode", async (req, res) => {
  try {
    const { zipCode } = req.params;
    const { lat, lng } = await geocodeZip(zipCode);

    console.log("LONG IS", lat, "LNG IS", lng);

    const nearestStore = await Store.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
        },
      },
    });

    if (!nearestStore) {
      return res.status(404).json({ message: "No nearby store found." });
    }

    const items = await MenuItem.find({
      [`availabilityByStore.${nearestStore._id}`]: "Available",
    });

    res.json({ store: nearestStore, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
