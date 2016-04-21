/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var flash = require('connect-flash');

var express = require('express');
var config = require('./config/environment');

// Setup server
var app = express();
app.use(flash());
var server = require('http').createServer(app);
require('./config/express')(app);

var expressSession = require('express-session');
app.use(expressSession({secret: 'mysecret'}));
var bodyParser = require('body-parser');

require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
