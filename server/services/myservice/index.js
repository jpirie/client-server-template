'use strict';

var express = require('express');
var controller = require('./myservice.controller');

var router = express.Router();

router.get('/get/:getparam', controller.get);
router.delete('/', controller.destroy);

module.exports = router;
