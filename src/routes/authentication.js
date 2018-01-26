'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const nunjucks = require( 'nunjucks' ) ;
const util = require('../js/util');
const randomstring = require('randomstring');
const validator = require('email-validator');

// Configure JWT
const JWT = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Config = require('getconfig');
const VerifyToken = require('../js/verifyToken');

// Import templates for emails
const PATH_TO_TEMPLATES = './src/templates' ;
nunjucks.configure( PATH_TO_TEMPLATES, { autoescape: true });

//const _ = require('lodash');

// DB
const db = require('../models');
const Bcrypt = require('bcryptjs'); // To hash passwords


//==========================================================================================//

router.post('/login', async (req, res) => {

  try {
    const user = await db.users.findOne({ email: req.body.email });
    if (user && validator.validate(req.body.email)) {
      if ( Bcrypt.compareSync(req.body.password, user.password) ) { // Check if the password is correct
        const token = JWT.sign(user, Config.jwt.secret, { expiresIn: 86400 });  // expires in 24 hours
        return res.status(201).send({
          statusCode: 201,
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

//==========================================================================================//

router.post('/register', async (req, res) => {

  try {
    let dbUser = await db.users.findOne({ email: req.body.email });
    if (!dbUser && validator.validate(req.body.email)) {
      const newUser = new db.users({
        name: req.body.name || req.body.email.split('@')[0],
        email: req.body.email,
        isValidated: false,
        verificationToken: randomstring.generate(48)
      });

      newUser.password = Bcrypt.hashSync(req.body.password, 10);
      await db.users.create(newUser);

      const link = Config.BASE_URL  + '/auth/email-verification/?verificationToken=' + newUser.verificationToken;
      const html = nunjucks.render('emailVerification.html', { link: link, name: newUser.name });

      util.sendEmail(newUser.email, Config.nev.email, 'WeSpeak Company', html, function(err) {
        if (err) {
          return res.boom.serverUnavailable('unavailable');
        }
      });
      return res.status(201).send({statusCode: 201, message: 'Verify email sent.'});
    } else if ( validator.validate(req.body.email) === false ) {
      return res.status(201).send({message: 'Please enter a valid email.'});
    }
    return res.status(201).send({message: 'Your user maybe already exist. Please log in.'});
  } catch (error) {
    return res.boom.badImplementation('There was a problem registering the user');
  }
});

//==========================================================================================//

router.get('/me', VerifyToken, async (req, res) => {

  if (req.user) { // The JWT can be decoded (the user is logged in)
    return res.status(200).send(req.user);
  }
  return res.boom.unauthorized('Invalid token');
});

//==========================================================================================//

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

//==========================================================================================//

router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

//==========================================================================================//

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebook' }), (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));

//==========================================================================================//

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//==========================================================================================//

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/google' }), (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));

//==========================================================================================//

router.get('/twitter', passport.authenticate('twitter'));

//==========================================================================================//

router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twitter' }), (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));

//==========================================================================================//


module.exports = router;
