const express = require('express');
const router = express.Router();
const multer = require('multer');

const specialController = require('../controller/specialController');

// Use memory storage to keep image in buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Routes
router.post('/', upload.single('image'), specialController.createSpecial);
router.get('/', specialController.getAllSpecials);
router.get('/:id', specialController.getSpecialById);
router.put('/:id', upload.single('image'), specialController.updateSpecial);
router.delete('/:id', specialController.deleteSpecial);

module.exports = router;
