'use strict';

var express = require('express');
var controller = require('./thing.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.put('/', controller.modify);
router.delete('/', controller.destroy);

module.exports = router;
