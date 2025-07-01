const express = require('express');
const router = express.Router();
const Category = require('../models/cateroryModal');
const MenuItem = require('../models/menuItemModel'); // Make sure to import your MenuItem model

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();   
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new category
router.post('/', async (req, res) => {
  const { name, addons } = req.body;
  
  // Check if category with same name already exists
  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      name,
      addons: addons || []
    });

    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add addon to category
router.post('/:id/addons', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.addons.push(req.body);
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category
router.patch('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // If name is being updated, check if new name already exists
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ name: req.body.name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    if (req.body.name) category.name = req.body.name;
    if (req.body.addons) category.addons = req.body.addons;

    const updatedCategory = await category.save();
    
    // If category name was changed, update all menu items with this category
    if (req.body.name && req.body.name !== category.name) {
      await MenuItem.updateMany(
        { category: category.name },
        { $set: { category: req.body.name } }
      );
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check if any menu items are using this category
    const itemsUsingCategory = await MenuItem.find({ category: category.name });
    
    if (itemsUsingCategory.length > 0) {
      // Remove category from all menu items that use it
      await MenuItem.updateMany(
        { category: category.name },
        { $unset: { category: "" } } // Or set to null or a default category
      );
    }

    await category.deleteOne()
    res.json({ 
      message: 'Category deleted',
      affectedMenuItems: itemsUsingCategory.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;