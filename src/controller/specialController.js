const Special = require('../models/specialModel');

// GET all specials
exports.getSpecials = async (req, res, next) => {
  try {
    const specials = await Special.find();
    res.json(specials);
  } catch (error) {
    next(error);
  }
};

// POST a new special
exports.createSpecial = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      price,
      currency,
      image,
      available,
      tags
    } = req.body;

    const special = await Special.create({
      title,
      category,
      description,
      price,
      currency,
      image,
      available,
      tags
    });

    res.status(201).json(special);
  } catch (error) {
    next(error);
  }
};
