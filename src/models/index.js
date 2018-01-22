'use strict';

const UserModel = require('./user');
const TempUserModel = require('./tempUser');


module.exports = {
  users: UserModel,
  tempUserModel: TempUserModel
};
