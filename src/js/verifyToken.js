'use strict';

const JWT = require('jsonwebtoken');
const config = require('getconfig');


module.exports = (req, res, next) => {

  const tokenHeader = req.headers.authorization;
  let headerParts = ['', ''];
  if (tokenHeader) {
    headerParts = tokenHeader.split(' ');
  }
  if (headerParts.length !== 2 || headerParts[0] !== 'Bearer') {
    return res.boom.unauthorized('Invalid authorization header');
  }

  const token = headerParts[1];

  // Verify secret and check token expiration
  JWT.verify(token, config.jwt.secret, (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        return res.boom.unauthorized('JWT token expired at ' + error.expiredAt.toString());
      }
      return res.boom.unauthorized('Invalid token');
    }

    // If everything is good, save the user for its use in other routes
    req.user = decoded;
    next();
  });
};
