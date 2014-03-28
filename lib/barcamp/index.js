var express = require('express'),
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
  utils = require('./utils.js');

function Barcamp() {
  'use strict';
  var self = this;

  this.app = express();

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

    self.app.use(express.cookieParser());
    self.app.use(express.session({
      cookie: { maxAge: 60 * 60000 },
      secret: '#bcg14'
    }));
    self.app.use(flash());

    passport.use(new LocalStrategy(
      function (username, password, done) {
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
          if (user.password !== password) {
            logger.debug('incorrect pwd');
            return done(null, false, {
              message: 'Incorrect password.'
            });
          }
          logger.info('Login: username ' + username + '(' + user.id + ')');
          return done(null, user);
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

    /*if ('development' === self.app.get('env')) {
      self.app.use(express.errorHandler());
    } else {*/
    self.app.use(logger.logErrors);
    self.app.use(logger.clientErrorHandler);
    self.app.use(logger.errorHandler);
    /*jslint unparam:true*/
    self.app.use(function (err, req, res, next) {
      console.log(err);
    });
    /*jslint unparam:false*/
    //}
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
  this.app.get('/', function (req, res) {
    /*jslint unparam:true*/

    req.app.get('database').model.Tag.findAll().success(function (tags) {
      res.render('index', {'tags': tags});
    });

  });

  this.app.get('/form', ensureLoggedIn('/login'), function (req, res) {
    /*jslint unparam:true*/
    res.render('form');
  });

  this.app.post('/form', ensureLoggedIn('/login'), form.add);

};

module.exports = new Barcamp();
