const express = require('express');
const router = express.Router();
const specialController = require('../controller/specialController');

// CRUD routes
router.get('/', specialController.getSpecials);
router.get('/:id', specialController.getSpecialById);
router.post('/', specialController.createSpecial);
router.put('/:id', specialController.updateSpecial);
router.delete('/:id', specialController.deleteSpecial);

module.exports = router;
