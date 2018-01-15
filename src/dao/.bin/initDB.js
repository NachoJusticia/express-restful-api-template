'use strict';

const Mongo = require('mongodb').MongoClient;
const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/development-database';

Mongo.connect(DB_URL)
  .then((db) => {

    db.createCollection('users')
      .then((result) => {
        console.log('Collection users created.');

        db.collection('users').createIndex({ 'email': 1 }, { unique: true, sparse: true })
          .then((result) => {
            console.log('Index created: email must be unique. Email --> ' + result + '\n');
            process.exit(0);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  });
