const Specials = require('../models/specialModel');

exports.createSpecial = async (req, res) => {
  try {
    const { name, description, price, items, isSpecial } = req.body;

    const special = new Specials({
      name,
      description,
      price,
      isSpecial: isSpecial === 'true',
      items: items
    });

    if (req.file) {
      special.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await special.save();
    res.status(201).json(special);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ all specials
exports.getAllSpecials = async (req, res) => {
  try {
    const specials = await Specials.find().populate('items');
    res.status(200).json(specials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ one special
exports.getSpecialById = async (req, res) => {
  try {
    const special = await Specials.findById(req.params.id).populate('items');
    if (!special) return res.status(404).json({ message: 'Special not found' });

    const result = special.toObject();
    if (special.image?.data) {
      result.imageBase64 = special.image.data.toString('base64');
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE special
exports.updateSpecial = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      items: req.body.items ? JSON.parse(req.body.items) : [],
      isSpecial: req.body.isSpecial === 'true'
    };

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const special = await Specials.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!special) return res.status(404).json({ message: 'Special not found' });

    res.status(200).json(special);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE special
exports.deleteSpecial = async (req, res) => {
  try {
    const special = await Specials.findByIdAndDelete(req.params.id);
    if (!special) return res.status(404).json({ message: 'Special not found' });

    res.status(200).json({ message: 'Special deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
