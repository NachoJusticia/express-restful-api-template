'use strict';

const _ = require('lodash');
const EmailValidator = require('email-validator');
const Bcrypt = require('bcryptjs'); // To hash passwords

const UserModel = require(__dir + 'models').userModel;

const saltRounds = 10;
const desiredUserKeys = ['email', 'name']; // Note that the rest of the properties will not be used


/**
 * This module accepts a database connection and exports a set of methods to interact with this database.
 * @exports {Object} that is a factory containing the following data access' functions as properties:
 *          - findAll
 *          - findByEmail
 *          - checkCredentials
 *          - createNew
 *          - login
 */
module.exports = () => {


  /**
   * This function finds all the users of the collection.
   * @returns {Promise} the user objects stored in the database.
   */
  const findAll = async () => {

    return await UserModel.find({});
  };


  /**
   * This function retrieves a user from the database searching by its email
   * @param {String} email
   * @returns {Promise} the corresponding user.
   */
  const findByEmail = async (email) => {

    const user = await UserModel.findOne({ email });
    return _.pick(user, desiredUserKeys);
  };


  /**
   * This function checks if the credentials of a user are correct.
   * @param {String} email
   * @param {String} password in plain text
   * @returns {Promise} that will be true if the credentials are correct otherwise false.
   */
  const checkCredentials = async (email, password) => {

    const user = await UserModel.findOne({ email });
    if (user) {
      if (Bcrypt.compareSync(password, user.password)) { // Check if the password is correct
        return _.pick(user, desiredUserKeys); // Credentials matched ok
      }
    }
    return false; // Chedentials did not match
  };


  /**
   * This function inserts a new object for a user in the database.
   * The password field is hashed using Bcrypt library and 10 salt rounds.
   * @param {Object} newUser that has the information of a user.
   * @returns {Promise} that will evaluates in the new registered user or an error
   */
  const createNew = async (newUser) => {

    if (!EmailValidator.validate(newUser.email)) {
      throw new Error('ValidationError');
    }

    const hashedPassword = Bcrypt.hashSync(newUser.password, saltRounds);
    newUser.password = hashedPassword;  // Store hashed password in DB

    try {
      const registeredUser = await UserModel.create(newUser);
      if (registeredUser) {
        return _.pick(registeredUser, desiredUserKeys);
      }
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('MongoError');
      }
    }
  };


  /**
   * This function is useful to update some fields of an existing user.
   * @param {String} email is unique in the database and it is the searching key.
   * @param {Object} user is the new object that is going to be stored for that user.
   * @returns {Promise} that will be the response of the mongo database.
   */
  const updateByEmail = async (email, user) => {

    return await UserModel.update({ email }, user);
  };

  // Exports the following factory
  return {
    findAll,
    findByEmail,
    checkCredentials,
    createNew,
    updateByEmail
  };
};
