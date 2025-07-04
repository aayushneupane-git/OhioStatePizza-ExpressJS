const express = require("express");
const mongoose = require("mongoose");
const MenuItem = require("../models/menuItemModel");
const Store = require("../models/storeModel");
const haversine = require("haversine-distance");
const geocodeZip = require("../config/geocodeAPI");

const router = express.Router();
const MAX_SERVICE_DISTANCE = 28000; // 10km in meters

// Cache for zip code to coordinates mapping
const zipCodeCache = new Map();

router.get("/items-by-zip/:zipCode", async (req, res) => {
  try {
    const { zipCode } = req.params;

    // Validate zip code format
    if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      return res.status(400).json({ error: "Invalid zip code format" });
    }

    // Get coordinates for zip code (in production, use a geocoding service)
    let referencePoint;
    if (zipCodeCache.has(zipCode)) {
      referencePoint = zipCodeCache.get(zipCode);
    } else {
      // For demo purposes - in real app, call geocoding API here
      referencePoint = await getCoordinatesForZip(zipCode);
      zipCodeCache.set(zipCode, referencePoint);
    }

    // Use MongoDB geospatial query if you have a 2dsphere index
    const serviceableStores = await Store.find({
      "address.location": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [referencePoint.longitude, referencePoint.latitude],
          },
          $maxDistance: MAX_SERVICE_DISTANCE,
        },
      },
    }).lean();

    // Fallback to manual calculation if geospatial query isn't working
    let storesWithDistance = [];
    if (serviceableStores.length === 0) {
      const allStores = await Store.find({}).lean();
      storesWithDistance = allStores.map((store) => {
        const storeLocation = {
          latitude: store.address.location.coordinates[1],
          longitude: store.address.location.coordinates[0],
        };

        const distance = haversine(referencePoint, storeLocation);

        return {
          ...store,
          distance,
          distanceMiles: (distance / 1609.34).toFixed(1),
        };
      });

      storesWithDistance.sort((a, b) => a.distance - b.distance);
    }

    const finalStores =
      serviceableStores.length > 0
        ? serviceableStores
        : storesWithDistance.filter((s) => s.distance <= MAX_SERVICE_DISTANCE);

    if (finalStores.length === 0) {
      const nearestStore = storesWithDistance[0];
      return res.json({
        serviceAvailable: false,
        message: `No stores within service area. The nearest store is ${nearestStore.distanceMiles} miles away.`,
        nearestStore: {
          name: nearestStore.name,
          address: nearestStore.address.formatted,
          distance: nearestStore.distanceMiles + " miles",
        },
      });
    }

    const nearestStoreId = finalStores[0]._id.toString();

    const menuItems = await MenuItem.find({
      [`availabilityByStore.${nearestStoreId}`]: "Available",
    })
      .select("name category price options")
      .lean();
      
    res.json({
      serviceAvailable: true,
      nearestStore: {
        ...finalStores[0],
        distance: (finalStores[0].distance / 1609.34).toFixed(1) + " miles",
      },
      storeCount: finalStores.length,
      menuItems,
      message: `Service available from ${finalStores.length} store(s) within ${(
        MAX_SERVICE_DISTANCE / 1609.34
      ).toFixed(1)} miles`,
    });
  } catch (error) {
    console.error("Error finding items by zip:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Mock function - replace with actual geocoding service
async function getCoordinatesForZip(zipCode) {
  const { lat, lng } = await geocodeZip(zipCode);
  // In production, integrate with Google Maps, Mapbox, or similar API
  return {
    latitude: lat,
    longitude: lng,
  };
}

module.exports = router;
