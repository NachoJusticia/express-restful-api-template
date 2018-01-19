'use strict';

global.__dir = `${__dirname}/`;

const Config = require('getconfig');


// Server initialization
const express = require('express');
const boom = require('express-boom');
const passport = require('passport');


const app = express();
app.use(boom());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


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

require('./passport')(passport); // pass passport Twitter, Google and Facebook for configuration

// Import controllers
const UserController = require(`${__dir}controllers/user`);
const AuthController = require(`${__dir}controllers/authentication`);
const SocialNetworksAuth = require(`${__dir}controllers/SocialNetworksAuth`);

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard',resave: false}));

app.use('/api/users', UserController);
app.use('/api/auth', AuthController);
app.use('/api/social-auth', SocialNetworksAuth);

module.exports = app;
