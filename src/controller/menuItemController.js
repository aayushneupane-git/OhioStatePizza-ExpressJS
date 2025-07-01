const MenuItem = require("../models/menuItemModel");

// CREATE
exports.createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      options, // JSON string or object
      availabilityByStore, // JSON string or object
      image, // base64 string
    } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      category,
      price: parseFloat(price),
      options: typeof options === "string" ? JSON.parse(options) : options,
      availabilityByStore:
        typeof availabilityByStore === "string"
          ? JSON.parse(availabilityByStore)
          : availabilityByStore,
      image,
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateMenuItem = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: parseFloat(req.body.price),
      options:
        typeof req.body.options === "string"
          ? JSON.parse(req.body.options)
          : req.body.options,
      availabilityByStore:
        typeof req.body.availabilityByStore === "string"
          ? JSON.parse(req.body.availabilityByStore)
          : req.body.availabilityByStore,
      image: req.body.image,
    };

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ALL
exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ BY ID
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
