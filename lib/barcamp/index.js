var express = require('express'),
  engine = require('ejs-locals'),
  http = require('http'),
  path = require('path'),
  passport = require('passport'),
  ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
  async = require('async'),
  flash = require('connect-flash'),
  logger = require('./logger.js'),
  form = require('./routes/form'),
  database = require('./models/database'),
  LocalStrategy = require('passport-local').Strategy,
  expressValidator = require('express-validator'),
  utils = require('./utils.js');

function Barcamp() {
  'use strict';
  var self = this;

  this.app = express();

  this.app.engine('ejs', engine); // use ejs-locals for all ejs templates:

  this.app.configure(function () {
    self.app.use(require('express-domain-middleware'));
    self.app.set('port', process.env.PORT || 3333);

    /*jslint nomen: true*/
    self.app.set('views', __dirname + '/../../views');
    /*jslint nomen: false*/

    self.app.set('view engine', 'ejs');

    self.app.set('database', database);
    self.app.set('logger', logger);
    self.app.use(logger.connectLogger);

    self.app.use(express.bodyParser());
    self.app.use(express.methodOverride());
    /*jslint nomen: true*/
    self.app.use(express.static(path.join(__dirname, '../../public')));
    self.app.use(express.favicon(path.join(__dirname, '../../public/favicon.ico')));
    /*jslint nomen: false*/

    /*jslint regexp: true */
    self.app.use(expressValidator({
      customValidators: {

        lettersonly: function (value) {
          return value.match(/^[a-z0-9_\-]+$/i);
        },
        tag: function (value) {
          return value.match(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð0-9_\-]+$/i);
        },
        validName: function (value) {
          return value.match(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'\-]+$/i);
        },
        isArray: function (value, max) {
          return Array.isArray(value) && value.length <= max;
        },
        gte: function (param, num) {
          return param >= num;
        },
        isWithin: function (value, min, max) {
          return value >= min && value <= max;
        },
        maxLength: function (array, max) {
          return array.length <= max;
        },
        weigthSum: function (elements, sumShould) {
          var t,
            sumIs = 0.0;
          for (t = 0; t < elements.length; t += 1) {
            sumIs += Math.round(parseFloat(elements[t].elementWeight) * 10000) / 10000;
          }
          return sumIs === sumShould;
        },
        isNonNegative: function (value) {
          return value >= 0;
        },
        facebookUsername: function (value) {
          return value.match(/^[a-z\d.]{5,}$/i);
        },
        twitterUsername: function (value) {
          return value.match(/^\w{1,15}$/i);
        }//,
        //googlePlusUsername: function (value) {
        //  return value.match();
        //}
      }
    }));
    /*jslint regexp: false */

    self.app.use(express.cookieParser());
    self.app.use(express.session({
      cookie: { maxAge: 60 * 60000 },
      secret: '#bcg14'
    }));
    self.app.use(flash());

    passport.use(new LocalStrategy({
      passReqToCallback: true
    },
      function (req, username, password, done) {

        req.assert('username', 'Bad Request').isAlpha();

        if (req.validationErrors()) {
          return done(null, false, {
            message: 'Malformed input'
          });
        }

        self.app.get('database').model.User.find({ where: {
          username: username
        }}).success(function (user) {

          if (!user) {
            logger.debug('no User');

            return done(null, false, {
              message: 'Incorrect username.'
            });
          }
          logger.debug('trying to log in user:\n' + user.values);
          user.verifyPassword(password, function (err, valid) {
            if (err) {
              // TODO: contact admin
              return done(null, false, {
                message: 'Login currently unavailable. Please return later to try again.'
              });
            }

            if (!valid) {
              return done(null, false, {
                message: 'Login failed. Please check username and password.'
              });
            }

            logger.info('Login: username ' + username + '(' + user.id + ')');
            return done(null, user);
          });
        });
      }
      ));
    self.app.use(passport.initialize());
    self.app.use(passport.session());

    passport.serializeUser(function (user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
      self.app.get('database').model.User.findAll({
        id: id
      }).success(function (users) {
        done(null, users[0]);
      }).error(function (err) {
        logger.debug("Authentication error: " + err);
        done(err, false);
      });
    });


    self.app.use(self.app.router);

    self.app.use(logger.logErrors);
    self.app.use(logger.clientErrorHandler);
    self.app.use(logger.errorHandler);

  });

  self.app.locals.productionEnvironment = utils.productionEnvironment;
  self.app.locals.stagingEnvironment = utils.stagingEnvironment;
  self.app.locals.developmentEnvironment = utils.developmentEnvironment;

  self.setupRoutes();
}
var p = Barcamp.prototype;

p.run = function () {
  'use strict';
  var self = this;
  http.createServer(self.app).listen(self.app.get('port'), function () {
    console.log('Express server listening on port ' + self.app.get('port'));
  });
};

p.setupRoutes = function () {
  'use strict';

  /*jslint unparam:false*/
  this.app.get('/login', function (req, res) {
    /*jslint unparam:true*/
    res.render('login', {
      message: req.flash('error')
    });
  });

  this.app.post('/login', passport.authenticate('local', {
    successRedirect: '/form',
    failureRedirect: '/login',
    failureFlash: 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Username und Passwort.'
  }), function (req) {
    if (req.body.save) { // TODO: not working
      req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
    }
  });

  this.app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });

  /*jslint unparam:false*/
  this.app.get('/tagcloud', function (req, res) {
    /*jslint unparam:true*/

    req.app.get('database').model.Tag.findAll().success(function (tags) {
      res.render('index', {'tags': tags});
    });

  });

  /*jslint unparam:false*/
  this.app.get('/list', function (req, res) {
    /*jslint unparam:true*/

    req.app.get('database').model.User.findAll().success(function (users) {
      res.render('list', {'users': users});
    });

  });


  this.app.get('/form', ensureLoggedIn('/login'), function (req, res) {
    /*jslint unparam:true*/
    res.render('form');
  });

  this.app.post('/form', ensureLoggedIn('/login'), form.add);

  this.app.get('/check_email', function (req, res) {

    req.assert('email', 'Bitte überprüfe deine Eingabe').notEmpty().isEmail().isLength(3, 128);

    var errors = req.validationErrors();
    if (errors) {
      res.send(false);
      return;
    }

    req.app.get('database').model.User.findAll({ where: {email: req.query.email}}).success(function (users) {

      if (users.length > 0) {
        res.send(false);
      } else {
        res.send(true);
      }

    });
  });

  this.app.get('/', function (req, res) {
    /*jslint unparam:true*/
    res.render('register');
  });

  this.app.post('/register', form.doRegister);

  /*jslint unparam:false*/
  this.app.get('/cancelme', function (req, res) {
    /*jslint unparam:true*/
    res.render('cancelme');
  });

  this.app.post('/sendcancelmail', form.sendCancelMail);

  /*jslint unparam:false*/
  this.app.get('/cancelemailsent', function (req, res) {
    /*jslint unparam:true*/
    res.render('cancelemailsent');
  });

  this.app.get('/areyousure/:token', function (req, res, next) {

    req.assert('token', 'Invalid Input.').notEmpty().isHexadecimal();

    if (req.validationErrors()) {
      next(new Error('Danke, aber wir konnten deine Eingabe nicht annehmen.'));
    }

    res.render('areyousure', {'token': req.params.token});
  });

  this.app.get('/cancel/:token', form.cancelRegistration);
};

module.exports = new Barcamp();
