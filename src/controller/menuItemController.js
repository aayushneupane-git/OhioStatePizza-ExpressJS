const MenuItem = require('../models/menuItemModel');

// CREATE
exports.createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      options, // JSON string
      availabilityByStore // JSON string
    } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      category,
      price: parseFloat(price),
      options,
      availabilityByStore
    });

    // if (req.file) {
    //   menuItem.image = {
    //     data: req.file.buffer,
    //     contentType: req.file.mimetype
    //   };
    // }

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    console.log(err)
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
      options: req.body.options,
      availabilityByStore: req.body.availabilityByStore
    };

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!item) return res.status(404).json({ error: 'Item not found' });
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
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const response = item.toObject();
    // if (item.image?.data) {
    //   response.imageBase64 = item.image.data.toString('base64');
    // }

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
