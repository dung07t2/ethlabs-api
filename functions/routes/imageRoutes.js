const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

router.delete(mediaController.deleteMedia);

module.exports = router;
