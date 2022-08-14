const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.route('/:userId').get(authController.login);

router.route('/accountId/:userId').get(authController.checkAccountId);

module.exports = router;
