var View = require('./view');
var template = require('./templates/home');

module.exports = View.extend({
    id: 'home-view',
    template: template,

    events: {
        'click input[type="submit"]': 'generatePassword'
    },

    generatePassword: function () {
        var site = $('input[type="text"]').val();
        if(site.length) {
            $.ajax({
                url: "/pass/" + site,
                success: function (data) {
                    $("#password").html("Password for " + site + ": " + data)
                }
            })
        } else {
            $("#password").html("Please enter a site or service name")
        }
    }
});
