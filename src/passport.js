const Config = require('getconfig');
const TwitterStrategy = require('passport-twitter');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20');

const UserDAO = require('./dao/index').users;


// expose this function to our app using module.exports
module.exports = function(passport) {
// Serialize user into the sessions
  passport.serializeUser((user, done) => done(null, user));

  // Deserialize user from the sessions
  passport.deserializeUser((user, done) => done(null, user));


  // =========================================================================
  // GOOGLE ==================================================================
  // =========================================================================
  // Register Google Passport strategy
  passport.use(new GoogleStrategy(Config.google,
    async function (token, tokenSecret, profile, done) {
      try {
        const user = await UserDAO.createNewSocialNetwork(profile);
        done(null, user);
      } catch (error) {
        return done(null, error);
      }
    }));


  // =========================================================================
  // FACEBOOK ==================================================================
  // =========================================================================
  // Register Facebook Passport strategy
  passport.use(new FacebookStrategy(Config.facebook,
    async function (token, tokenSecret, profile/*, done*/) {
      try {
        const user = await UserDAO.findUserByFacebook(profile);
        if (!user) {
          return res.status(404).send('No facebook user found.');
        }
        res.status(200).send(user);
      } catch (error) {
        return res.status(500).send('There was a problem finding the user.');
      }
    }));

  // =========================================================================
  // TWITTER ==================================================================
  // =========================================================================
  passport.use(new TwitterStrategy(Config.twitter,
    async function (token, tokenSecret, profile/*, done*/) {
      try {
        const user = await UserDAO.findUserByTwitter(profile);
        if (!user) {
          return res.status(404).send('No twitter user found.');
        }
        res.status(200).send(user);
      } catch (error) {
        return res.status(500).send('There was a problem finding the user.');
      }
    }));

};
