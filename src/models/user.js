'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: { unique: true, dropDups: true } },
  password: String,
  verificationToken: String,
  isValidated: Boolean
});


module.exports = mongoose.model('User', UserSchema);
