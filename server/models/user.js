// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var LessPassHandler = cozydb.getModel('User', {
      email: {
          type: String
      }
});

module.exports = LessPassHandler;
