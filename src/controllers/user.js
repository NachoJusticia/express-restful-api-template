'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('../verifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
const UserDAO = require('../dao/index').users;


router.get('/all', VerifyToken, async (req, res) => {

  try {
    const users = await UserDAO.findAll();
    res.status(200).send(users);
  } catch (error) {
    return res.status(500).send('There was a problem finding the users.');
  }
});


router.get('/email/:email', VerifyToken, async (req, res) => {

  try {
    const user = await UserDAO.findByEmail(req.params.email);
    if (!user) {
      return res.status(404).send('No user found.');
    }
    res.status(200).send(user);
  } catch (error) {
    return res.status(500).send('There was a problem finding the user.');
  }
});

/**
 * Exports the following routes:
 *
 * GET  /all
* GET   /email/:email
 */
module.exports = router;
