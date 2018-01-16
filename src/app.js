'use strict';

global.__dir = `${__dirname}/`;

const Config = require('getconfig');

// Server initialization
const express = require('express');
const boom = require('express-boom');
const app = express();
app.use(boom());

// Database connection
const mongoose = require('mongoose');
mongoose.connect(Config.DB_URL, { 'useMongoClient': true });

// Email verification configuration
const emailVerificationConfig = require('./emailVerification');
const nev = require('email-verification')(mongoose);
nev.configure(emailVerificationConfig, (error) => {
  if (error) {
    throw error;
  }
});

const nodemailer = require('nodemailer');
nodemailer.createTransport({
  from: 'replyemail@example.com',
  options: {
    host: 'smtp.example.com',
    port: 587,
    auth: {
      user: 'your_smtp_username',
      pass: 'your_smtp_email'
    }
  }
});

app.use((req, res, next) => {
  req.nev = nev;
  next();
});

app.get('/api', (req, res) => {
  res.status(200).send('API works.');
});

// Import controllers
const UserController = require(`${__dir}controllers/user`);
const AuthController = require(`${__dir}controllers/authentication`);

app.use('/api/users', UserController);
app.use('/api/auth', AuthController);

module.exports = app;
