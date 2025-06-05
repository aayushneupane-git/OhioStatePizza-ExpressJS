const MenuItem = require('../models/menuItemModel');

// Create
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, category, price, status, sizes, addOns } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      category,
      price,
      status,
      sizes: JSON.parse(sizes),
      addOns: JSON.parse(addOns)
    });

    if (req.file) {
      menuItem.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read by ID
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const response = item.toObject();
    if (item.image?.data) {
      response.imageBase64 = item.image.data.toString('base64');
    }

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Serve Image
exports.getImageById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item || !item.image?.data) return res.status(404).json({ error: 'Image not found' });

    res.set('Content-Type', item.image.contentType);
    res.send(item.image.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateMenuItem = async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
      addOns: req.body.addOns ? JSON.parse(req.body.addOns) : []
    };

    if (req.file) {
      updatedData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
