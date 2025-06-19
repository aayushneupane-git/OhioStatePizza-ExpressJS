// utils/geocode.js
const axios = require("axios");

const geocodeZip = async (zipCode) => {
  const apiKey = "93c210c9d6684dfb98359e4d4f1a8df6"; // replace this
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${zipCode}&key=${apiKey}&countrycode=us&limit=1`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    console.log(data.results[0].geometry)

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    } else {
      throw new Error("No coordinates found for ZIP code.");
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw error;
  }
};

module.exports = geocodeZip;
