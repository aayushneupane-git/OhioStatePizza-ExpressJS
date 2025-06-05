const Special = require('../models/specialModel');

// GET all specials
exports.getSpecials = async (req, res, next) => {
  try {
    const specials = await Special.find();
    res.status(200).json(specials);
  } catch (error) {
    next(error);
  }
};

// GET one special by ID
exports.getSpecialById = async (req, res, next) => {
  try {
    const special = await Special.findById(req.params.id);
    if (!special) return res.status(404).json({ message: 'Special not found' });
    res.status(200).json(special);
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

// PUT update special
exports.updateSpecial = async (req, res, next) => {
  try {
    const updatedSpecial = await Special.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSpecial) return res.status(404).json({ message: 'Special not found' });
    res.status(200).json(updatedSpecial);
  } catch (error) {
    next(error);
  }
};

// DELETE special
exports.deleteSpecial = async (req, res, next) => {
  try {
    const special = await Special.findByIdAndDelete(req.params.id);
    if (!special) return res.status(404).json({ message: 'Special not found' });
    res.status(200).json({ message: 'Special deleted successfully' });
  } catch (error) {
    next(error);
  }
};
