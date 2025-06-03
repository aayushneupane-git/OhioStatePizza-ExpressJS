const express = require('express');
const router = express.Router();
const storeController = require('../controller/storeController');

// POST: Create store and linked manager
router.post('/create', storeController.createStoreWithManager);

module.exports = router;
