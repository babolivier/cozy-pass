// See documentation on https://github.com/cozy/americano#routes

var lesspass = require('./lesspass');

module.exports = {
    'pass/:site': {
        get: lesspass.generate
    },
    'init': {
        get: lesspass.isInitiated,
        post: lesspass.init
    }
};

