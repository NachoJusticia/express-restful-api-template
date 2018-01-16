'use strict';

global.__dir = `${__dirname}/`;

const Config = require('getconfig');

// Server initialization
const express = require('express');
const boom = require('express-boom');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
let oauth = require('oauth');
let logger = require('express-logger');
let session = require('express-session');
const app = express();
app.use(boom());

// Database connection
const mongoose = require('mongoose');
mongoose.connect(Config.DB_URL, { 'useMongoClient': true });

// Email verification configuration
const emailVerificationConfig = require('./emailVerification');
const nev = require('email-verification')(mongoose);
nev.configure(emailVerificationConfig, (error) => {
  if (error) {
    throw error;
  }
});

const nodemailer = require('nodemailer');
nodemailer.createTransport({
  from: 'replyemail@example.com',
  options: {
    host: 'smtp.example.com',
    port: 587,
    auth: {
      user: 'your_smtp_username',
      pass: 'your_smtp_email'
    }
  }
});


app.get('/api', (req, res) => {
  res.status(200).send('API works.');
});

/**
 * CONFIG FOR SOCIAL NETWORKS
 */


/** GOOGLE */
passport.use(new GoogleStrategy({
  clientID: Config.google.clientID,
  clientSecret: Config.google.clientSecret,
  callbackURL: Config.google.callbackURL
},
function (accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

/** TWITTER */
// Get your credentials for TWITTER here: https://dev.twitter.com/apps
const _twitterConsumerKey = Config.twitter.consumerKey;
const _twitterConsumerSecret = Config.twitter.consumerSecret;
const consumerTwitter = new oauth.OAuth(
  'https://twitter.com/oauth/request_token', 'https://twitter.com/oauth/access_token',
  _twitterConsumerKey, _twitterConsumerSecret, '1.0A', Config.twitter.callbackURL, 'HMAC-SHA1');

app.use((req, res, next) => {
  req.nev = nev;
  req.consumerTwitter = consumerTwitter;
  next();
});

/** FACEBOOK */
// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes
const transformFacebookProfile = (profile) => ({
  name: profile.name,
  avatar: profile.picture.data.url
});
// Register Facebook Passport strategy
passport.use(new FacebookStrategy(Config.facebook,
  // Gets called when user authorizes access to their profile
  async function(accessToken, refreshToken, profile, done) {
    // Return done callback and pass transformed user object
    done(null, transformFacebookProfile(profile._json));
  }
));

// Import controllers
const UserController = require(`${__dir}controllers/user`);
const AuthController = require(`${__dir}controllers/authentication`);
const SocialNetworksAuth = require(`${__dir}controllers/SocialNetworksAuth`);

app.use('/api/users', UserController);
app.use('/api/auth', AuthController);
app.use('/api/social-auth', SocialNetworksAuth);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// Set up Twitter auth routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger({ path: 'log/express.log'}));
app.use(cookieParser());
app.use(session({ secret: 'very secret', resave: false, saveUninitialized: true}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

module.exports = app;
