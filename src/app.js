'use strict';

global.__dir = `${__dirname}/`;

const Config = require('getconfig');

// Server initialization
const express = require('express');
const boom = require('express-boom');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20');
const TwitterStrategy = require('passport-twitter');
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
app.use((req, res, next) => {
  req.nev = nev;
  next();
});

app.get('/api', (req, res) => {
  res.status(200).send('API works.');
});

/**
 * CONFIG FOR SOCIAL NETWORKS
 */
// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes
const transformFacebookProfile = (profile) => ({
  name: profile.name,
  avatar: profile.picture.data.url
});
const transformGoogleProfile = (profile) => ({
  name: profile.displayName,
  avatar: profile.image.url
});
const transformTwitterProfile = (profile) => ({
  name: profile.displayName
});

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));


/** GOOGLE */
// Register Google Passport strategy
passport.use(new GoogleStrategy(Config.google,
  // Gets called when user authorizes access to their profile
  async (accessToken, refreshToken, profile, done) => done(null, transformGoogleProfile(profile._json))
));

/** TWITTER */
passport.use(new TwitterStrategy(Config.twitter,
  // Gets called when user authorizes access to their profile
  async (accessToken, refreshToken, profile, done) => done(null, transformTwitterProfile(profile._json))
));

/** FACEBOOK */
// Register Facebook Passport strategy
passport.use(new FacebookStrategy(Config.facebook,
  // Gets called when user authorizes access to their profile
  async (accessToken, refreshToken, profile, done) => done(null, transformFacebookProfile(profile._json))
));

// Import controllers
const UserController = require(`${__dir}controllers/user`);
const AuthController = require(`${__dir}controllers/authentication`);
const SocialNetworksAuth = require(`${__dir}controllers/SocialNetworksAuth`);

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard'}));

app.use('/api/users', UserController);
app.use('/api/auth', AuthController);
app.use('/api/social-auth', SocialNetworksAuth);


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

module.exports = app;
