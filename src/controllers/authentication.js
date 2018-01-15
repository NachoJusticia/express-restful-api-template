'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('../verifyToken');

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
        expiresIn: 10 // expires in 24 hours
      });

      return res.status(200).send({
        token: token,
        message: 'Login successful',
        user: loggedUser
      });
    }
    return res.boom.notFound('Incorrect credentials.');
  } catch (error) {
    return res.boom.badImplementation('There was a problem in the login process.');
  }
});


router.post('/register', async (req, res) => {

  const userToRegister = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name
  };

  try {
    const newUser = await UserDAO.createNew(userToRegister);
    const token = JWT.sign({ id: newUser._id }, Config.jwt.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    return res.status(200).send({
      token: token,
      message: 'User successfuly registered',
      newUser
    });
  } catch (error) {
    if (error.message === 'MongoError') {
      return res.boom.conflict('The email ' + userToRegister.email + ' is already in use.');
    } else if (error.message === 'ValidationError') {
      return res.boom.badRequest('The email is not valid');
    }
    return res.boom.badImplementation('There was a problem registering the user.');
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
