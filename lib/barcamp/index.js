/*
 * index.js - BRS Main File
 *
 * Written by Paul Rudolf Seebacher, Jörg Simon and Jürgen Brüder
 * 
 * Copyright © 2015 by the contributing authors
 *
 * This file is part of the BarCamp Registration System.
 * 
 * The BarCamp Registration System is free software: you can redistribute
 * it and/or modify it under the terms of the GNU Affero General Public
 * License as published by the Free Software Foundation, either version
 * 3 of the License, or (at your option) any later version.
 *
 * The BarCamp Registration System is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with the BarCamp Registration System.
 * If not, see <http://www.gnu.org/licenses/>.
 */

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
        },
        isLatin1: function (value) {
          return value.match(/^[A-z\x00-\xff]+$/i);
        }
        //,
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
          logger.debug('trying to log in user:\n' + user.username);
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
    successRedirect: '/statistics',
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

  this.app.get('/setpwd', form.setOrgaUserPassword);

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

    req.app.get('database').model.User.findAll({ where: {password: null}}).success(function (users) {
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

  this.app.get('/statistics', ensureLoggedIn('/login'), function (req, res) {

    //Get Data
    req.app.get('database').model.User.findAll().success(function (users) {

      var statistics = {
        'registered': 0,
        'children_yes': 0,
        'children_no': 0,
        'attending_day_1': 0,
        'attending_day_2': 0,
        'attending_day_3': 0,
        'lastname_no': 0,
        'lastname_yes': 0,
        'newcomer_no': 0,
        'newcomer_yes': 0,
        'camp_none': 0,
        'camp_uxcamp': 0,
        'camp_politcamp': 0,
        'camp_startcamp': 0,
        'camp_designcamp': 0,
        'camp_appdevcamp': 0,
        'camp_wissenscamp': 0,
        'men_s': 0,
        'men_m': 0,
        'men_l': 0,
        'men_xl': 0,
        'women_s': 0,
        'women_m': 0,
        'women_l': 0,
        'women_xl': 0
      };

      users.forEach(function (user) {

        statistics.registered += 1;

        // Newcomer
        if (user.newcomer === true) {
          statistics.newcomer_no += 1;
        } else {
          statistics.newcomer_yes += 1;
        }

        // No last name
        if (user.lastName) {
          statistics.lastname_yes += 1;
        } else {
          statistics.lastname_no += 1;
        }

        // Attendance
        if (user.day_one === true) {
          statistics.attending_day_1 += 1;
        }

        if (user.day_two === true) {
          statistics.attending_day_2 += 1;
        }

        if (user.day_three === true) {
          statistics.attending_day_3 += 1;
        }

        // Childcare
        if (user.children === true) {
          statistics.children_yes += 1;
        } else {
          statistics.children_no += 1;
        }

        // Camps
        if (user.preferredCamp === "uxcamp") {
          statistics.camp_uxcamp += 1;
        } else if (user.preferredCamp === "politcamp") {
          statistics.camp_politcamp += 1;
        } else if (user.preferredCamp === "startcamp") {
          statistics.camp_startcamp += 1;
        } else if (user.preferredCamp === "designcamp") {
          statistics.camp_designcamp += 1;
        } else if (user.preferredCamp === "appdevcamp") {
          statistics.camp_appdevcamp += 1;
        } else if (user.preferredCamp === "wissenscamp") {
          statistics.camp_wissenscamp += 1;
        } else {
          statistics.camp_none += 1;
        }

        // Shirts
        if (user.gender === "m") {
          if (user.shirtSize === "S") {
            statistics.men_s += 1;
          } else if (user.shirtSize === "M") {
            statistics.men_m += 1;
          } else if (user.shirtSize === "L") {
            statistics.men_l += 1;
          } else {
            statistics.men_xl += 1;
          }
        } else {
          if (user.shirtSize === "S") {
            statistics.women_s += 1;
          } else if (user.shirtSize === "M") {
            statistics.women_m += 1;
          } else if (user.shirtSize === "L") {
            statistics.women_l += 1;
          } else {
            statistics.women_xl += 1;
          }
        }

      });

      console.log(statistics);

      res.render('statistics', {'statistics': statistics});
    });

  });

  this.app.get('/notes', ensureLoggedIn('/login'), function (req, res) {

    req.app.get('database').model.User.findAll().success(function (users) {
      res.render('notes', {'users': users});
    });

  });

  this.app.get('/sessions', ensureLoggedIn('/login'), function (req, res) {

    req.app.get('database').model.User.findAll().success(function (users) {
      res.render('sessions', {'users': users});
    });

  });

  this.app.get('/nametag.csv', ensureLoggedIn('/login'), form.nameTagList);

  this.app.post('/reminder', ensureLoggedIn('/login'), form.sendReminder);

  this.app.get('/attendee.csv', ensureLoggedIn('/login'), form.attendeeList);

};

module.exports = new Barcamp();
