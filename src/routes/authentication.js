'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const swig = require('swig');
const util = require('../js/util');
const randomstring = require('randomstring');

// Configure JWT
const JWT = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Config = require('getconfig');
const VerifyToken = require('../js/verifyToken');

//const _ = require('lodash');

// DB
const db = require('../models');
const Bcrypt = require('bcryptjs'); // To hash passwords


/**
 * Check user's email and password for login
 */
router.post('/login', async (req, res) => {

  try {
    const user = await db.users.findOne({ email: req.body.email });
    if (user && user.isValidated === true) {
      if ( Bcrypt.compareSync(req.body.password, user.password) ) { // Check if the password is correct
        const token = JWT.sign(user, Config.jwt.secret, { expiresIn: 86400 });  // expires in 24 hours
        return res.status(201).send({
          token: token,
          message: 'Login successful',
          name: user.name,
          email: user.email,
          isValidated: user.isValidated });
      }
      return res.boom.notFound('Incorrect credentials');

    }
    return res.boom.notFound('Incorrect credentials');

  } catch (error) {
    return res.boom.badImplementation('There was a problem in the login process');
  }
});


/**
 * Receives a user registration request and sends a verification email to confirm the email address
 */
router.post('/register', async (req, res) => {

  try {
    let dbUser = await db.users.findOne({ email: req.body.email });
    if (!dbUser) {
      const newUser = new db.users({
        name: req.body.name,
        email: req.body.email,
        isValidated: false,
        verificationToken: randomstring.generate(48)
      });

      newUser.password = Bcrypt.hashSync(req.body.password, 10);
      await db.users.create(newUser);

      const link = Config.BASE_URL  + '/auth/email-verification/?verificationToken=' + newUser.verificationToken;
      const templatePath = './src/templates/emailVerification.html';
      const html = swig.renderFile(templatePath,{ link: link, name: newUser.name });

      util.sendEmail(newUser.email, Config.nev.email, 'WeSpeak Company', html, function(err) {
        if (err) {
          return res.boom.serverUnavailable('unavailable');
        }
      });
      return res.status(201).send({message: 'Verify email sent.'});
    }
    return res.status(201).send({message: 'Your user maybe already exist. Please log in.'});
  } catch (error) {
    return res.boom.badImplementation('There was a problem registering the user');
  }
});


/**
 * [ Authentication required ]
 * Response with the logged user object if the JWT authentication is ok
 */
router.get('/me', VerifyToken, async (req, res) => {

  if (req.user) { // The JWT can be decoded (the user is logged in)
    return res.status(200).send(req.user);
  }
  return res.boom.unauthorized('Invalid token');
});


/**
 * Confirms a temporal user and moves it to the persistent collection
 */
router.get('/email-verification', async (req, res) => {

  try {
    db.users.findOne({ verificationToken: req.query.verificationToken }, (err, user) => {
      user.isValidated = true;
      user.verificationToken = undefined;
      user.save(function (err) {
        if (err) {
          return res.boom.notFound('User not found.');
        }
      });
    });
    return res.status(201).send('User verification received and successfull.');
  } catch (error) {
    return res.boom.notFound('We could not find any user registration request for this URL');
  }
});


// Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebook' }), (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));


// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/google' }), (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));


// Twitter
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twitter' }), (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));


/**
 * Exports the following routes:
 *
 * POST /login
 * POST /register
 * GET  /me
 * GET  /email-verification/:verificationURL
 * GET  /facebook
 * GET  /facebook/callback
 * GET  /google
 * GET  /google/callback
 * GET  /twitter
 * GET  /twitter/callback
 */
module.exports = router;
