const express = require("express");
const axios = require("axios");
const router = express.Router();

const OPENCAGE_API_KEY = "93c210c9d6684dfb98359e4d4f1a8df6";

// Haversine formula to calculate distance in miles
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth's radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocode function
async function geocodeAddress(address) {
  const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
    params: {
      q: address,
      key: OPENCAGE_API_KEY,
    },
  });

  const geometry = response.data.results[0]?.geometry;
  if (!geometry) throw new Error("Geocoding failed for: " + address);
  return geometry;
}

// POST /api/delivery-charge
router.post("/delivery-charge", async (req, res) => {
  const { storeAddress, customerAddress } = req.body;

  if (!storeAddress || !customerAddress) {
    return res.status(400).json({ error: "Both storeAddress and customerAddress are required." });
  }

  try {
    const [storeGeo, customerGeo] = await Promise.all([
      geocodeAddress(storeAddress),
      geocodeAddress(customerAddress),
    ]);

    const distanceMiles = getDistanceInMiles(
      storeGeo.lat,
      storeGeo.lng,
      customerGeo.lat,
      customerGeo.lng
    );

    const deliveryCharge = parseFloat((distanceMiles * 1.2).toFixed(2));

    res.json({
      storeAddress,
      customerAddress,
      distance: distanceMiles.toFixed(2),
      deliveryCharge,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
