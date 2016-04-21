/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');

exports.index = function(req, res) {
    res.json(
        {
            name : 'Some information retrieved via service call (GET)',
        }
    );
};

/* POST */
exports.create = function(req, res) {
    res.json([
        {
            name : 'For creation of accounts'
        }
    ]);
};

/* DELETE */
exports.destroy = function(req, res) {
    res.json([
        {
            name : 'For deletion of accounts'
        }
    ]);
};

/* PUT */
exports.modify = function(req, res) {
    res.json([
        {
            name : 'For modification of accounts'
        }
    ]);
};
