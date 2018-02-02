'use strict';

const Config = require('getconfig');
const TwitterStrategy = require('passport-twitter');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20');
const EmailValidator = require('email-validator');
const db = require('../models');


module.exports = (passport) => {

  passport.serializeUser((user, done) => done(null, user));   // Serialize user into the sessions
  passport.deserializeUser((user, done) => done(null, user)); // Deserialize user from the sessions


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
        // If user has already registered only send user info
        if (error.code === 11000 ) {
          const newUser = new db.users({
            name: profile.displayName,
            email: profile.emails[0].value
          });
          return done(null, newUser);
        }
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
        if (error.code === 11000 ) {
          const newUser = new db.users({
            name: profile.name.givenName + ' ' + profile.name.familyName,
            email: profile.emails[0].value
          });
          return done(null, newUser);
        }
        return done(null, error);
      }
    }));

  // Register Twitter Passport strategy
  passport.use(new TwitterStrategy(Config.twitter,
    async function (token, tokenSecret, profile, done) {
      try {
        const newUser = new db.users({
          name: profile.displayName,
          email: profile.id
        });

        const registeredUser = await db.users.create(newUser);
        if (registeredUser) {
          done(null, registeredUser);
        }
      } catch (error) {
        if (error.code === 11000 ) {
          const newUser = new db.users({
            name: profile.displayName,
            email: profile.id
          });
          return done(null, newUser);
        }
        return done(null, error);
      }
    }));
};
