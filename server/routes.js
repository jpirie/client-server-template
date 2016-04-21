/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var flash = require('connect-flash');


module.exports = function(app) {

    app.use(flash());
    // Insert routes below
    app.use('/api/account', require('./api/account'));
    app.use('/services/myservice', require('./services/myservice'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

    /*** routes ***/
    /* GET login page. */
    app.get('/login', function(req, res) {
        // Display the Login page with any flash message, if any
        res.render('index', { message: req.flash('message') });
    });

  /*All other routes should redirect to the index.html*/
  app.route('/*')
    .get(function(req, res) {
        res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
