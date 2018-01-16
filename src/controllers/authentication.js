'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('../verifyToken');
const _ = require('lodash');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const UserDAO = require('../dao/index').users;

// Configure JWT
const JWT = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Config = require('getconfig');


router.post('/login', async (req, res) => {

  try {
    const loggedUser = await UserDAO.checkCredentials(req.body.email, req.body.password);
    if (loggedUser) {
      const token = JWT.sign(loggedUser, Config.jwt.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

      return res.status(200).send({
        token: token,
        message: 'Login successful',
        user: loggedUser
      });
    }
    return res.boom.notFound('Incorrect credentials');
  } catch (error) {
    return res.boom.badImplementation('There was a problem in the login process');
  }
});


router.post('/register', async (req, res) => {

  try {
    const userToRegister = {
      email: req.body.email,
      password: req.body.password,
      name: req.body.name
    };
    userToRegister._doc = _.clone(userToRegister); // The nev module needs this _doc property to create the temporary user

    req.nev.createTempUser(userToRegister, function (err, existingPersistentUser, newTempUser) {

      if (err) {
        return res.boom.badImplementation('There was a problem registering the user');
      } else if (existingPersistentUser || newTempUser === null) {
        return res.boom.conflict('The email ' + req.body.email + ' is already in use');
      }

      // User created in temporary collection
      const URL = newTempUser[req.nev.options.URLFieldName];
      req.nev.sendVerificationEmail(userToRegister.email, URL, function (err, /*info*/) {
        if (err) {
          return res.boom.badImplementation('There was a problem sendint the verification email to the email ' + req.body.email);
        }

        return res.status(200).send({
          message: 'Verification email sent',
          user: userToRegister._doc
        });
      });
    });
  } catch (err) {
    return res.boom.badImplementation('There was a problem registering the user');
  }
});


router.get('/me', VerifyToken, async (req, res) => {

  if (req.user) { // The JWT can be decoded (the user is logged in)
    return res.status(200).send(req.user);
  }
  return res.boom.unauthorized('Invalid token');
});


/**
 * Exports the following routes:
 *
 * POST /login
 * POST /register
 * GET  /me
 */
module.exports = router;
