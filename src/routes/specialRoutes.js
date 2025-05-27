const express = require('express');
const router = express.Router();
const { getSpecials, createSpecial } = require('../controller/specialController');

router.get('/', getSpecials);
router.post('/', createSpecial);

module.exports = router;
