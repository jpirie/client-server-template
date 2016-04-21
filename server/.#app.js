**
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

var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mysecret'}));
app.use(passport.initialize());
app.use(passport.session());
var bodyParser = require('body-parser');

require('./routes')(app, passport);

var mysql = require('mysql')

// require bcrypt for securing authentication
var bcrypt = require('bcrypt');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'techuser',
    password: 'techpassword',
    database: 'test'
});

connection.connect();

connection.query("select * from mytable;", function(err, rows, fields) {
    if (!err)
        console.log('Output', rows);
    else
        console.log('An error occurred select data from the Maria database.');
});

/*
 * Authenticaton for Facebook. Should move this out of here...
 */
var facebookAppID = '964545360278031';
var facebookAppSecret = '81a8b570842205e3f9deb2af74a51ddd';
var facebookCallbackUrl = 'http://localhost:9000/facebookcallback';

passport.use('facebook', new FacebookStrategy({
  clientID        : facebookAppID,
  clientSecret    : facebookAppSecret,
  callbackURL     : facebookCallbackUrl
},
  // facebook will send back the tokens and profile
  function(access_token, refresh_token, profile, done) {
    // asynchronous
    process.nextTick(function() {
    
      // find the user in the database based on their facebook id
    var email = profile.emails[0].value
    connection.query("select * from users where email = '" + email + "'",function(err,rows){
        console.log(rows);
        if (err)
            return done(err);
        if (rows.length) {
            console.log("Facebook auth callback. Username " + email + " has been found.");
            return done(null, rows[0]);
        } else {
            // if there is no user found with that facebook id, create them
            // we also have access here to: profile.id, profile.name.givenName, porfile.name.familyName, 

            var newUserMysql = new Object();

            newUserMysql.email  = email

            // TODO: what should we really do here? The user doesn't need a password...
            bcrypt.hash(access_token, 10, function(err, hash) {
                if (err)
                    return done(err);
                else {
                    newUserMysql.password = hash;

                    var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ hash +"')";
                    console.log(insertQuery);
                    connection.query(insertQuery,function(err,rows){
                        newUserMysql.id = rows.insertId;
                        console.log("Signup strategy: New user " + email + " created.")
                        return done(null, newUserMysql);
                    });
                }
            });
         }
      });
    });
}));

/*
 * Authentication for Twitter.
 */
 var twitterApiKey = 'GtLTZYxa9XXZF5aflc0EInsgM';
 var twitterSecret = 'T8i91kz7dvLqf5W1U2p6oczEdPx53mHwvWNpZgWNgpLmoNdfUK';
 var twitterCallbackUrl = 'http://localhost:9000/twittercallback';

passport.use('twitter', new TwitterStrategy({
    consumerKey     : twitterApiKey,
    consumerSecret  : twitterSecret,
    callbackURL     : twitterCallbackUrl
  },
  function(token, tokenSecret, profile, done) {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Twitter
    process.nextTick(function() {
 
        // this isn't actually the email, but all we get back from twitter is the profile identifier
        var email = profile.id;
        connection.query("select * from users where email = '" + email + "'",function(err,rows){
          // if there is an error, stop everything and return that
          // ie an error connecting to the database
            if (err)
                return done(err);
            if (rows.length) {
                console.log("Twitter auth callback. Username " + email + " has been found.");
                return done(null, rows[0]);
            } else {
                // TODO: This is used in the other strategies and can be refactored.
               // if there is no user, create them
                var newUserMysql = new Object();

                newUserMysql.email  = email

                // TODO: what should we really do here? The user doesn't need a password, this token is useless
                bcrypt.hash(token, 10, function(err, hash) {
                    if (err)
                        return done(err);
                    else {
                        newUserMysql.password = hash;

                        var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ hash +"')";
                        console.log(insertQuery);
                        connection.query(insertQuery,function(err,rows){
                            newUserMysql.id = rows.insertId;
                            console.log("Signup strategy: New user " + email + " created.")
                            return done(null, newUserMysql);
                        });
                    }
                });
            }
         });
      });
    })
);

/* 
 * Authentication for Google
 */

var googleClientId = '612718818950-hr60u3nimim98pdv9l0l5alg0ngee9kf.apps.googleusercontent.com';
var googleSecret = 'MdkvfASIJGvH6eQqAwivaUve';
var googleCallbackUrl = 'http://localhost:9000/googlecallback';

passport.use(new GoogleStrategy({
    clientID : googleClientId,
    clientSecret : googleSecret,
    callbackURL : googleCallbackUrl
},
    function (token, refreshToken, profile, done) {
            // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // this isn't actually the email, but we pretend it is for the moment
            var email = profile.id;
            connection.query("select * from users where email = '" + email + "'",function(err,rows){

                if (err)
                    return done(err);

                if (rows.length) {
                    console.log("Google auth callback. Username " + email + " has been found.");
                    // if a user is found, log them in
                    return done(null, rows[0]);
                } else {
                    // TODO: This is used in the other strategies and can be refactored. Actually, this is the same as twitter as they are both OAuth...
                   // if there is no user, create them
                    var newUserMysql = new Object();

                    newUserMysql.email  = email

                    // TODO: what should we really do here? The user doesn't need a password, this token is useless
                    bcrypt.hash(token, 10, function(err, hash) {
                        if (err)
                            return done(err);
                        else {
                            newUserMysql.password = hash;

                            var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ hash +"')";
                            console.log(insertQuery);
                            connection.query(insertQuery,function(err,rows){
                                newUserMysql.id = rows.insertId;
                                console.log("Signup strategy: New user " + email + " created.")
                                return done(null, newUserMysql);
                            });
                        }
                    });
                }
            });
        });
}));

// expose this function to our app using module.exports
//module.exports = function(passport) {

// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log('Serializing a user.')
        done(null, user.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log('Attempting to deserialize a user: ' + id);
        connection.query("select * from users where email = '" + id + "'", function(err,rows) {
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log("I'm in the signup strategy");
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        connection.query("select * from users where email = '"+email+"'",function(err,rows){
            console.log(rows);
            if (err)
                return done(err);
            if (rows.length) {
                console.log("Signup strategy: Username " + email + " is already taken.");
                return done(null, false, req.flash('info', 'That email is already taken.'));
            } else {
                // if there is no user with that email
                // create the user
                var newUserMysql = new Object();

                newUserMysql.email    = email;

                bcrypt.hash(password, 10, function(err, hash) {
                    if (err)
                        return done(err);
                    else {
                        newUserMysql.password = hash;

                        var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ hash +"')";
                        console.log(insertQuery);
                        connection.query(insertQuery,function(err,rows){
                            newUserMysql.id = rows.insertId;
                            console.log("Signup strategy: New user " + email + " created.")
                            return done(null, newUserMysql);
                        });
                    }
                });
            }
        });
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
            if (err)
                return done(err);
            if (!rows.length) {
                console.log("Login strategy: Could not find user " + email + ".")
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            bcrypt.compare(password, rows[0].password, function(err, res) {
                if (res) {
                    console.log("Login strategy: User " + email + " logged in successfully.");
                    return done(null, rows[0]); //TODO: should we return rows[0] here? We don't need the password again.
                } else {
                    console.log("Login strategy: Incorrect password attempt for user " + email);
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                }
            });
        });
    }));
//};

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
