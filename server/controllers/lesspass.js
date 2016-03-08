Handler     = require('../models/lesspass');
User        = require('../models/user');
lesspass    = require('lesspass');

// INTERNAL

function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function loadMasterPasswordIfExists(next) {
    Handler.request("all", function(err, results) {
        if (!results.length) {
            next(null);
        } else {
            next(results[0].masterPassword);
        }
    })
}

function createMasterPassword(next) {
    User.request('all', function (err, results) {
        var email = results[0].email;
        var randstr = randomString(16);
        lesspass.createMasterPassword(email, randstr).then(function (masterPassword) {
            loadMasterPasswordIfExists(function (exists) {
                if(!exists) {
                    Handler.create({
                        "masterPassword": masterPassword
                    }, function (err) {
                        if (!err) {
                            next(null);
                        } else {
                            next(err);
                        }
                    });
                } else {
                    next(new Error("Existing password"));
                }
            })
        });
    });
}

function getNewEntry(site) {
    // Custom settings are an upcoming feature, here's preparing for them
    return {
        site: site,
        password: {
            length: 14,
            settings: ['lowercase', 'uppercase', 'numbers', 'symbols'],
            counter: 1
        }
    };
}

// FRONT

function generate (req, res) {
    var site = req.params.site;
    var entry = getNewEntry(site);
    loadMasterPasswordIfExists(function (masterPassword) {
        if(masterPassword) {
            var password = lesspass.createPassword(masterPassword, entry);
            res.status(200).send(password);
        } else {
            createMasterPassword(function () {
                generate(req, res);
            });
        }
    });
}

function init (req, res) {
    createMasterPassword(function (err) {
        if(err) {
            // To clean up
            if(err.message == "Existing password") {
                res.status(409).send(err.message);
            } else {
                res.status(500).send(err.message);
            }
        } else {
            res.status(200).send("OK");
        }
    })
}

function isInitialized(req, res) {
    loadMasterPasswordIfExists(function (masterPassword) {
        if(masterPassword) {
            res.status(200).send("true");
        } else {
            res.status(404).send("false");
        }
    })
}

module.exports = {
    "init": init,
    "isInitialized": isInitialized,
    "generate": generate
};