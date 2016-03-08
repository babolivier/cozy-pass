(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("application", function(exports, require, module) {
// Application bootstrapper.
var Application = {
  initialize: function () {
    var HomeView = require('views/home_view'), Router = require('lib/router');
    // Ideally, initialized classes should be kept in controllers & mediator.
    // If you're making big webapp, here's more sophisticated skeleton
    // https://github.com/paulmillr/brunch-with-chaplin
    this.homeView = new HomeView();
    this.router = new Router();
    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  }
};

module.exports = Application;

});

require.register("initialize", function(exports, require, module) {
var application = require('application');

$(function () {
  application.initialize();
  Backbone.history.start();
});

});

require.register("lib/router", function(exports, require, module) {
var application = require('application');

function dispError(error) {
    console.log(error);
}

function initiate(next) {
    $.ajax({
        url: "init",
        method: "POST",
        success: function () {
            next();
        },
        error: function (xhr) {
            dispError("Can't initiate");
            console.error(xhr)
        }
    })
}

function checkInit(next) {
    $.ajax({
        url: "init",
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

});

require.register("lib/view_helper", function(exports, require, module) {
// Put your handlebars.js helpers here.

});

;require.register("models/collection", function(exports, require, module) {
// Base class for all collections.
module.exports = Backbone.Collection.extend({
});

});

require.register("models/model", function(exports, require, module) {
// Base class for all models.
module.exports = Backbone.Model.extend({
});

});

require.register("views/home_view", function(exports, require, module) {
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
                url: "pass/" + site,
                success: function (data) {
                    $("#password").html("Password for " + site + ": " + data)
                }
            })
        } else {
            $("#password").html("Please enter a site or service name")
        }
    }
});

});

require.register("views/templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="content"><h1>Password management</h1><div id="main"><input type="text" placeholder="Site or service name"/><input type="submit" value="Generate"/><div id="password"></div></div></div>');
}
return buf.join("");
};
});

require.register("views/view", function(exports, require, module) {
require('lib/view_helper');

// Base class for all views.
module.exports = Backbone.View.extend({
  initialize: function () {
    this.render = _.bind(this.render, this);
  },

  template: function () { return null; },
  getRenderData: function () { return null; },

  render: function () {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  },

  afterRender: function () { return null; }
});

});


//# sourceMappingURL=app.js.map