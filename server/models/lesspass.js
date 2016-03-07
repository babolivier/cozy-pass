// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var LessPassHandler = cozydb.getModel('Lesspass', {
      masterPassword: {
          default: '',
          type: String
      }
});

module.exports = LessPassHandler;
