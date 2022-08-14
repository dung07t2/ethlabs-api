const express = require('express');
const router = express.Router();
const { decreaseCount } = require('../controllers/countController');

router.route('/decrease').post(decreaseCount);

module.exports = router;
