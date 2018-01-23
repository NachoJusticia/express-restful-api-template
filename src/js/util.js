'use strict';
const Config = require('getconfig');
const nodemailer = require('nodemailer');
let util = exports;

const emailer = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: Config.nev.email,
    pass: Config.nev.password
  }
});


util.sendEmail = function (to, from, subject, html, cb) {
  let message = {
    from: from,
    to: to,
    subject: subject,
    text: html,
    html: html
  };

  emailer.sendMail(message, function (err) {
    if (err) {
      return cb(err);
    }
    cb(null);
  });
};

