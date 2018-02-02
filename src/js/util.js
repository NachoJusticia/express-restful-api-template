'use strict';

const Config = require('getconfig');
const nodemailer = require('nodemailer');
const util = exports;

const emailer = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: Config.nev.email,
    pass: Config.nev.password
  }
});


util.sendEmail = (to, from, subject, html, callback) => {

  const message = {
    from: from,
    to: to,
    subject: subject,
    text: html,
    html: html
  };

  emailer.sendMail(message, (err) => {
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};
