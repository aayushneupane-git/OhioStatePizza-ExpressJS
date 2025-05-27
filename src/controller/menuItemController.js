const MenuItem = require('../models/menuItemModel');

// GET all menu items
exports.getMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// POST a new menu item
exports.createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      currency,
      tags,
      available,
      image
    } = req.body;

    const item = await MenuItem.create({
      name,
      description,
      category,
      price,
      currency,
      tags,
      available,
      image
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};
