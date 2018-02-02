'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const nunjucks = require('nunjucks');
const util = require('../js/util');
const randomstring = require('randomstring');
const EmailValidator = require('email-validator');

// Configure JWT
const JWT = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Config = require('getconfig');
const VerifyToken = require('../js/verifyToken');

// Import email template
nunjucks.configure('./src/templates', { autoescape: true });

// DB
const db = require('../models');
const Bcrypt = require('bcryptjs'); // To hash passwords


//==========================================================================================//

router.post('/login', async (req, res) => {

  try {
    if (!req.body.email || !EmailValidator.validate(req.body.email)) {
      return res.boom.badRequest('Please enter a valid email');
    }
    const user = await db.users.findOne({ email: req.body.email }).lean();
    if (user) {
      if (Bcrypt.compareSync(req.body.password, user.password)) { // Check if the password is correct
        const token = JWT.sign(user, Config.jwt.secret, { expiresIn: 86400 });  // expires in 24 hours
        return res.status(200).send({
          message: 'Login successful',
          token: token,
          user
        });
      }
      return res.boom.notFound('Incorrect credentials');
    }
    return res.boom.notFound('Incorrect credentials');
  } catch (error) {
    return res.boom.badImplementation('There was a problem in the login process');
  }
});

//==========================================================================================//

router.post('/register', async function (req, res) {

  try {
    if (!req.body.email || !EmailValidator.validate(req.body.email)) {
      return res.boom.badRequest('Please enter a valid email');
    }

    const newUser = new db.users({
      name: req.body.name,
      email: req.body.email,
      password: Bcrypt.hashSync(req.body.password, 10),
      verificationToken: randomstring.generate(48)
    });
    await db.users.create(newUser);

    const html = nunjucks.render('emailVerification.html', {
      link: Config.BASE_URL + '/auth/email-verification/?verificationToken=' + newUser.verificationToken,
      name: newUser.name
    });

    util.sendEmail(newUser.email, Config.nev.email, 'Express Awesome Template', html, (err) => {
      if (err) {
        return res.boom.serverUnavailable('Gmail service temporary unaccessible');
      }
      return res.status(200).send({ message: 'Verification email sent to ' + req.body.email });
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.boom.conflict('The user with email ' + req.body.email + ' already exists');
    }
    return res.boom.badImplementation('There was a problem registering the user');
  }
});

//==========================================================================================//

router.get('/me', VerifyToken, async function (req, res) {

  if (req.user) { // The JWT can be decoded (the user is logged in)
    return res.status(200).send(req.user);
  }
  return res.boom.unauthorized('Invalid JWT token');
});

//==========================================================================================//

router.get('/email-verification', async function (req, res) {

  try {
    const user = await db.users.findOne({ verificationToken: req.query.verificationToken });

    if (!user) {
      return res.boom.notFound('This token URL does is not associated to any user');
    }
    user.verificationToken = undefined;
    await user.save();
    return res.status(200).send('User verification success');
  } catch (error) {
    return res.boom.badImplementation('There was a problem verifying the user\'s email');
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
