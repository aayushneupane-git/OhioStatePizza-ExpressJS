const express = require('express');
const router = express.Router();
const storeController = require('../controller/storeController');

// POST /stores
router.post('/', storeController.createStoreWithManager);

// GET /stores
router.get('/', storeController.getAllStores);

// GET /stores/:id
router.get('/:id', storeController.getStoreById);

// PUT /stores/:id
router.put('/:id', storeController.updateStore);

// DELETE /stores/:id
router.delete('/:id', storeController.deleteStore);

module.exports = router;
