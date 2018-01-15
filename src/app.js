'use strict';

// Server initialization
const express = require('express');
const boom = require('express-boom');
const app = express();
app.use(boom());

// Database connection
const mongoose = require('mongoose');
const config = require('getconfig');
mongoose.connect(config.DB_URL, { 'useMongoClient': true });

global.__global = `${__dirname}/`;

app.get('/api', (req, res) => {
  res.status(200).send('API works.');
});

// Import controllers
const UserController = require(`${__global}controllers/user`);
const AuthController = require(`${__global}controllers/authentication`);

app.use('/api/users', UserController);
app.use('/api/auth', AuthController);

module.exports = app;
