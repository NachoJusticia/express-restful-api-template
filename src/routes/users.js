'use strict';

const express = require('express');
const router = express.Router();
const VerifyToken = require('../js/verifyToken');
const db = require('../models');

//==========================================================================================

router.get('/', VerifyToken, async (req, res) => {

  try {
    if (req.query.email) {
      const user = await db.users.findOne({ email: req.query.email }).lean();
      if (!user) {
        return res.boom.notFound('No user found');
      }
      return res.status(200).send(user);
    }

    const users = await db.users.find({}).lean();
    return res.status(200).send(users);
  } catch (error) {
    return res.boom.badImplementation('There was a problem finding the users');
  }
});

//==========================================================================================

router.get('/:id', VerifyToken, async (req, res) => {

  try {
    if (req.params.id !== req.user._id) {
      return res.boom.forbidden('Logged user and user requested identifiers do not match');
    }
    let user = await db.users.findOne({ _id: req.params.id }).lean();

    if (!user) {
      return res.boom.notFound('No user found');
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.boom.badImplementation('There was a problem finding the user');
  }
});

//==========================================================================================


module.exports = router;
