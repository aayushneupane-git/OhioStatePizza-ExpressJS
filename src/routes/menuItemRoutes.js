const express = require('express');
const router = express.Router();
const { getMenuItems, createMenuItem } = require('../controller/menuItemController');

router.get('/', getMenuItems);
router.post('/', createMenuItem);

module.exports = router;
