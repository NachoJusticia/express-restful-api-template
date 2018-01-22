const Config = require('getconfig');
const TwitterStrategy = require('passport-twitter');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20');

const EmailValidator = require('email-validator');

// DB
const db = require('../models');

// expose this function to our app using module.exports
module.exports = function (passport) {
  // Serialize user into the sessions
  passport.serializeUser((user, done) => done(null, user));

  // Deserialize user from the sessions
  passport.deserializeUser((user, done) => done(null, user));


  // Register Google Passport strategy
  passport.use(new GoogleStrategy(Config.google,
    async function (token, tokenSecret, profile, done) {
      try {
        if (!EmailValidator.validate(profile.emails[0].value)) {
          throw new Error('ValidationError');
        }
        const newUser = new db.users({
          name: profile.displayName,
          email: profile.emails[0].value
        });

        const registeredUser = await db.users.create(newUser);
        if (registeredUser) {
          done(null, registeredUser);
        }
      } catch (error) {
        return done(null, error);
      }
    }));


  // Register Facebook Passport strategy
  passport.use(new FacebookStrategy(Config.facebook,
    async function (token, tokenSecret, profile, done) {
      try {
        if (!EmailValidator.validate(profile.emails[0].value)) {
          throw new Error('ValidationError');
        }
        const newUser = new db.users({
          name: profile.name.givenName + ' ' + profile.name.familyName,
          email: profile.emails[0].value
        });

        const registeredUser = await db.users.create(newUser);
        if (registeredUser) {
          done(null, registeredUser);
        }
      } catch (error) {
        return done(null, error);
      }
    }));

  // Register Twitter Passport strategy
  passport.use(new TwitterStrategy(Config.twitter,
    async function (token, tokenSecret, profile, done) {
      try {
        if (!EmailValidator.validate(profile.emails[0].value)) {
          throw new Error('ValidationError');
        }
        const newUser = new db.users({
          name: profile.displayName,
          email: profile.id
        });

        const registeredUser = await db.users.create(newUser);
        if (registeredUser) {
          done(null, registeredUser);
        }
      } catch (error) {
        return done(null, error);
      }
    }));

};
