'use strict';

const Config = require('getconfig');
const Bcrypt = require('bcryptjs'); // To hash passwords

const db = require('../models');
const emailAccount = Config.nev.email;

const customHasherFunction = (password, tempUserData, insertTempUser, callback) => {
  const hash = Bcrypt.hashSync(password, 10, null);
  return insertTempUser(hash, tempUserData, callback);
};

module.exports = {
  verificationURL: `${Config.BASE_URL}/auth/email-verification/` + '${URL}',
  URLLength: 48,
  persistentUserModel: db.users,
  tempUserModel: db.tempUserModel,
  tempUserCollection: 'temporary_users',
  emailFieldName: 'email',
  passwordFieldName: 'password',
  URLFieldName: 'GENERATED_VERIFYING_URL',
  expirationTime: 86400,
  transportOptions: {
    service: 'Gmail',
    auth: {
      user: emailAccount,
      pass: Config.nev.password
    }
  },
  verifyMailOptions: {
    from: 'Do Not Reply <' + emailAccount + '>',
    subject: 'Confirm your account',
    html: '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
      'paste the following link into your browser:</p><p>${URL}</p>',
    text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}'
  },
  shouldSendConfirmation: true,
  confirmMailOptions: {
    from: 'Do Not Reply <' + emailAccount + '>',
    subject: 'Successfully verified!',
    html: '<p>Your account has been successfully verified.</p>',
    text: 'Your account has been successfully verified.'
  },
  hashingFunction: customHasherFunction
};
