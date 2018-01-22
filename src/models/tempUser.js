'use strict';

const mongoose = require('mongoose');

const TempUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: { unique: true, dropDups: true } },
  password: String,
  GENERATED_VERIFYING_URL: String  // This is useful for the email verification process
});


module.exports = mongoose.model('TempUser', TempUserSchema);
