'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');


router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


// Set up Facebook auth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/facebook' }),
  // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  (req, res) => {
    res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
  });


// Set up Google auth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/google' }),
  // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  (req, res) => {
    res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
  });


// Set up Twitter auth routes
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/twitter' }),
  // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  (req, res) => {
    res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
  });


module.exports = router;
