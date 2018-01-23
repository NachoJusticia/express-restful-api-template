'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
//const emailVerification = require('../js/emailVerification');
const swig = require('swig');
const util = require('../js/util');

// Configure JWT
const JWT = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Config = require('getconfig');
const VerifyToken = require('../js/verifyToken');

//const _ = require('lodash');

// DB
const db = require('../models');
const Bcrypt = require('bcryptjs'); // To hash passwords
//const desiredUserKeys = ['email', 'name'];


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
    let dbUser = await db.users.findOne({ email: req.body.email });
    if (!dbUser) {
      const newUser = new db.users({
        name: req.body.name,
        email: req.body.email,
        password: req. body.password
      });

      db.users.create(newUser);

      //const token = JWT.sign({email: req.body.email, id: req.body._id}, Config.jwt.token , {expiresIn: 15 * 60});  // token valid 15 min
      const link = 'http://localhost:3000/api/auth/email-verification/?email=' + newUser.email + '&id=' + newUser.name + '&token=' + '1234';

      const templatePath = './src/templates/emailVerification.html';
      const html = swig.renderFile(templatePath,{ link: link, name: newUser.name });

      util.sendEmail(newUser.email, Config.nev.email, 'Company Name', html, function(err) {
        if (err) {
          return res.status(500).send({code: 'ERR_SERVER_ERROR', msg: err});
        }
        return res.status(201).send();
      });

      return res.status(404).send({msg: 'Verify email sent.'});
    }

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
    let dbUser = await db.users.findOne({ email: req.query.email });

    if (dbUser) {
      return res.send('Verification correct.');
    }

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
