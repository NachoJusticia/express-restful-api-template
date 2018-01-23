'use strict';

const Config = require('getconfig');

// Server initialization
const express = require('express');
const boom = require('express-boom');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();
app.use(boom()); // Error standarization
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


// Database connection
const mongoose = require('mongoose');
mongoose.connect(Config.DB_URL, { 'useMongoClient': true });


app.get('/api', (req, res) => {
  res.status(200).send('API works.');
});

require('./js/passport')(passport); // pass passport Twitter, Google and Facebook for configuration

// Import routes
const usersRoutes = require('./routes/users');
const authenticationRoutes = require('./routes/authentication');

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard',resave: false}));

app.use('/api/users', usersRoutes);
app.use('/api/auth', authenticationRoutes);

// Start server
const port = Config.PORT;

app.listen(port, () => {
  console.info(`Express server listening on port ${port}`);
});
