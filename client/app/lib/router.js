var application = require('application');

function dispError(error) {
    console.log(error);
}

function initiate(next) {
    $.ajax({
        url: "/init",
        method: "POST",
        success: function () {
            next();
        },
        error: function () {
            dispError("Can't initiate");
        }
    })
}

function checkInit(next) {
    $.ajax({
        url: "/init",
        complete: function (xhr) {
            switch (xhr.status) {
                case 404:   initiate(next);
                            break;
                case 200:   next();
                            break;
                default:    break;
            }
        }
    });
}

module.exports = Backbone.Router.extend({
    routes: {
        '': 'home'
    },

    home: function () {
        checkInit(function() {
            $('body').html(application.homeView.render().el);
        });
    }
});
