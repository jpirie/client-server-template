'use strict';

var _ = require('lodash');

exports.get = function(req, res) {
    res.json([
        {
            name : 'For a get'
        }
    ]);
};


/* DELETE */
exports.destroy = function(req, res) {
    res.json([
        {
            name : 'For a destroy'
        }
    ]);
};
