const express = require('express');
const middlewareRouter = express.Router();
const authorizedUserChecker = require('../middleware/authorizedUserChecker');

middlewareRouter.use(authorizedUserChecker);

module.exports = middlewareRouter;
