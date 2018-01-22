'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');

// Configure JWT
const JWT = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Config = require('getconfig');
const VerifyToken = require('../js/verifyToken');

const _ = require('lodash');

// DB
const db = require('../models');
const Bcrypt = require('bcryptjs'); // To hash passwords
const desiredUserKeys = ['email', 'name'];


/**
 * Check user's email and password for login
 */
router.post('/login', async (req, res) => {

  try {
    const user = await db.users.findOne({ email: req.body.email }).lean();
    if (user) {
      if (Bcrypt.compareSync(req.body.password, user.password)) { // Check if the password is correct
        const token = JWT.sign(user, Config.jwt.secret, { expiresIn: 86400 });  // expires in 24 hours
        return res.status(200).send({ token: token, message: 'Login successful', user });
      }
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
    const userToRegister = { email: req.body.email, password: req.body.password, name: req.body.name };
    userToRegister._doc = _.clone(userToRegister); // The nev module needs this _doc property to create the temporary user

    req.nev.createTempUser(userToRegister, (error, existingPersistentUser, newTempUser) => {
      if (error) {
        return res.boom.badImplementation('There was a problem registering the user');
      } else if (existingPersistentUser || newTempUser === null) {
        return res.boom.conflict('The email ' + req.body.email + ' is already in use');
      }
      const URL = newTempUser[req.nev.options.URLFieldName]; // User created in temporary collection

      req.nev.sendVerificationEmail(userToRegister.email, URL, (error, /*info*/) => {
        if (error) {
          return res.boom.badImplementation('There was a problem sending the verification email to the email ' + req.body.email);
        }
        return res.status(200).send({ message: 'Verification email sent', user: _.pick(userToRegister, desiredUserKeys) });
      });
    });
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
router.get('/email-verification/:verificationURL', async (req, res) => {

  try {
    req.nev.confirmTempUser(req.params.verificationURL, async (error, user) => {
      if (error) {
        return res.boom.badImplementation('There was a problem while confirmating the user email');
      }

      if (user) {
        req.nev.sendConfirmationEmail(user.email, (err, info) => {
          if (err) {
            return res.boom.badImplementation('There was a problem sending the success confirmation email');
          }
          return res.status(200).send({ message: 'Confirmation email sent', info });
        });
      } else {
        return res.boom.notFound('This verification URL does not belong to any user');
      }
    });
  } catch (error) {
    return res.boom.notFound('We could not find any user registration request for this URL');
  }
});


// Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebook' }), (req, res) => res.send(req.user));


// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/google' }), (req, res) => res.send(req.user));


// Twitter
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twitter' }), (req, res) => res.send(req.user));


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
