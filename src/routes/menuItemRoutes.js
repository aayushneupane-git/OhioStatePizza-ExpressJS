const express = require('express');
const router = express.Router();
const multer = require('multer');
const menuItemController = require('../controller/menuItemController');

// Memory storage for blob
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post('/', upload.single('image'), menuItemController.createMenuItem);
router.get('/', menuItemController.getAllMenuItems);
router.get('/:id', menuItemController.getAllMenuItems);
router.put('/:id', upload.single('image'), menuItemController.updateMenuItem);
router.delete('/:id', menuItemController.deleteMenuItem);

module.exports = router;
