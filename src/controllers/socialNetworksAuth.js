'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');


router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


// Set up Facebook auth routes
router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/facebook' }),
  // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));

// Set up Google auth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home..
    res.redirect('/');
  });

// Set up Twitter auth routes
router.get('/twitter/connect', function (req, res) {
  req.consumerTwitter.getOAuthRequestToken(function (error, oauthToken, oauthTokenSecret /*, results*/) {
    if (error) {
      res.send('Error getting OAuth request token : ' + inspect(error), 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect('https://twitter.com/oauthorize?oauth_token=' + req.session.oauthRequestToken);
    }
  });
});

router.get('/twitter/callback', function (req, res) {
  req.consumerTwitter.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function (error, oauthAccessToken, oauthAccessTokenSecret/*, results*/) {
    if (error) {
      res.send('Error getting OAuth access token : ' + inspect(error) + '[' + oauthAccessToken + ']' + '[' + oauthAccessTokenSecret + ']' + '[' + inspect(result) + ']', 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

      res.redirect('/twitter');
    }
  });
});

router.get('/twitter', function (req, res) {
  req.consumerTwitter.get('https://api.twitter.com/1.1/account/verify_credentials.json', req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data/*, response*/) {
    if (error) {
      //console.log(error)
      res.redirect('/twitter/connect');
    } else {
      let parsedData = JSON.parse(data);
      res.send('You are signed in: ' + inspect(parsedData.screen_name));
    }
  });
});

module.exports = router;
