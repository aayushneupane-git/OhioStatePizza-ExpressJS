const express = require('express');
const router = express.Router();
const multer = require('multer');
const menuItemController = require('../controller/menuItemController');

// Memory storage for blob
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Routes
router.post('/', menuItemController.createMenuItem);
router.get('/', menuItemController.getAllMenuItems);
router.get('/:id', menuItemController.getMenuItemById);
router.put('/:id', menuItemController.updateMenuItem);
router.delete('/:id', menuItemController.deleteMenuItem);
module.exports = router;
