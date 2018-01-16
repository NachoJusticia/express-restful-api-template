'use strict';

const mongoose = require('mongoose');

const TempUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  GENERATED_VERIFYING_URL: String
});


module.exports = mongoose.model('TempUser', TempUserSchema);
