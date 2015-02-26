'use strict';
var logger = require('../logger'),
  async = require('async'),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  util = require('util'),
  utils = require('../utils.js'),
  config = require('config').email,
  addTags = function (req, tag1, tag2, tag3, user, cb) {

    var tagAdd = function (tag, done) {
      req.app.get('database').model.Tag.findOrCreate({ where: {"name": tag.name}}).success(function (item, created) {
        if (created) {
          item.count = tag.value;
          item.save().success(function () {
            done(null, {tag: item, value: tag.value});
          }).failure(function (err) { cb(err); });
        } else {
          item.increment('count', { by: tag.value}).success(function () {
            done(null, {tag: item, value: tag.value});
          }).failure(function (err) { cb(err); });
        }
      }).failure(function (err) { cb(err); });
    };

    async.mapSeries([{name: tag1, value: 30}, {name: tag2, value: 20}, {name: tag3, value: 10}], tagAdd, function (err, results) {
      async.eachSeries(results, function (item, done) {
        user.hasTag(item.tag).then(function (ret) {
          if (!ret) {
            return user.addTag(item.tag, {value: item.value}).then(function () {return done(); });
          }
          req.app.get('database').model.TagsUsers.find({where: { $and: [{TagId: item.tag.id}, {UserId: user.id}]}}).then(function (rel) {
            rel.increment('value', { by: item.value }).then(function () {
              return done();
            });
          });
        });
      });
      cb(err);
    });
  },
  welcomeEmail = function (to, token, done) {

    var options = {},
      smtpTransport,
      body;
    options.host = config.smtpHost;
    options.secureConnection = config.secureConnection;
    options.port = config.port;
    if (config.auth) {
      options.auth = config.auth;
    }

    smtpTransport = nodemailer.createTransport("SMTP", options);

    body = 'Du hast dich erfolgreich zum BarCamp Graz 2015 angemeldet.\n' +
      'Um dich wieder abzumelden verwende bitte folgenden Link:\n\n' +
      'http://barcamp.seepaul.org/areyousure/' + token + '\n\n';

    smtpTransport.sendMail({
      from: config.sender,
      to: to,
      subject: config.subjectWelcome,
      text: body
    }, function (error, response) {
      if (error) {
        console.log(error);
        smtpTransport.close();
        done(error);
      } else {
        logger.info("Message sent: " + response.message);
        smtpTransport.close();
        done(null);
      }
    });
  };

exports.add = function (req, res, next) {

  req.assert('tag1', 'Bitte überprüfe deine Eingabe').notEmpty().tag();
  req.assert('tag2', 'Bitte überprüfe deine Eingabe').notEmpty().tag();
  req.assert('tag3', 'Bitte überprüfe deine Eingabe').notEmpty().tag();

  if (req.validationErrors()) {
    next(new Error('Malformed input'));
  }

  addTags(req, req.body.tag1, req.body.tag2, req.body.tag3, null, function (err) {
    if (err) { next(err); }
    res.render('form');
  });
};

exports.doRegister = function (req, res, next) {

  if (utils.developmentEnvironment()) {
    console.log(req.body);
  }

  req.assert('firstName', 'Bitte überprüfe deine Eingabe').notEmpty().validName().isLength(3, 36);
  req.assert('lastName', 'Bitte überprüfe deine Eingabe').optional().validName().isLength(3, 36);
  req.assert('email', 'Bitte überprüfe deine Eingabe').notEmpty().isEmail().isLength(3, 128);
  req.assert('tag1', 'Bitte überprüfe deine Eingabe').notEmpty().tag().isLength(3, 36);
  req.assert('tag2', 'Bitte überprüfe deine Eingabe').notEmpty().tag().isLength(3, 36);
  req.assert('tag3', 'Bitte überprüfe deine Eingabe').notEmpty().tag().isLength(3, 36);
  req.assert('preferredCamp').optional().isIn(['uxcamp', 'politcamp', 'startcamp', 'designcamp', 'appdevcamp', 'wissenscamp']);
  req.assert('gender').optional().isIn(['m', 'w', 'none']);
  req.assert('shirtSize').optional().isIn(['S', 'M', 'L', 'XL', 'none']);
  req.assert('note', 'Bitte überprüfe deine Eingabe').optional().isLength(0, 768);
  if (req.body.note) {
    req.assert('note', 'Bitte überprüfe deine Eingabe').optional().isAscii();
  }
  req.assert('children', 'Bitte überprüfe deine Eingabe').optional().equals('true');
  req.assert('newcomer', 'Bitte überprüfe deine Eingabe').optional().equals('true');

  req.assert('session_title').optional().isLength(0, 256);
  if (req.body.session_title) {
    req.assert('session_title', 'Bitte überprüfe deine Eingabe').optional().isAscii();
  }
  req.assert('session_desc').optional().isLength(0, 768);
  if (req.body.session_desc) {
    req.assert('session_desc', 'Bitte überprüfe deine Eingabe').optional().isAscii();
  }
  req.assert('day_one').optional().equals('true');
  req.assert('day_two').optional().equals('true');
  req.assert('day_three').optional().equals('true');
  req.assert('twitter').optional().isAscii().isLength(0, 256);
  req.assert('facebook').optional().isAscii().isLength(0, 256);
  req.assert('google_plus').optional().isAscii().isLength(0, 256);
  req.assert('website').optional().isURL().isLength(0, 256);
  req.assert('accept').equals('true');

  var errors = req.validationErrors();

  if (errors) {
    next(new Error('Danke, aber wir konnten deine Eingabe nicht annehmen.' + util.inspect(errors)));
  }

  req.sanitize('email').normalizeEmail();

  req.app.get('database').model.User.findAll({ where: {email: req.body.email}}).success(function (users) {

    if (users.length > 0) {
      next(new Error('Die Email Adresse wurde bereits für eine Anmeldung verwendet. Bitte verwende eine andere Adresse oder melde dich vor erneutem Anmelden mit dem Link in der Bestätigungs-Email ab.'));
    } else {

      crypto.randomBytes(20, function (err, buf) {
        if (err) { next(err); }
        var token = buf.toString('hex');

        req.app.get('database').model.User.create({

          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          token: token,
          preferredCamp: req.body.preferredCamp,
          shirtSize: req.body.shirtSize,
          note: req.body.note,
          children: req.body.children,
          newcomer: req.body.newcomer,
          session_title: req.body.session_title,
          session_desc: req.body.session_desc,
          day_one: req.body.day_one,
          day_two: req.body.day_two,
          day_three: req.body.day_three,
          twitter: req.body.twitter,
          facebook: req.body.facebook,
          google_plus: req.body.google_plus,
          website: req.body.website,
          gender: req.body.gender

        }).success(function (user) {

          addTags(req, req.body.tag1, req.body.tag2, req.body.tag3, user, function (err) {
            if (err) { next(err); }

            welcomeEmail(req.body.email, token, function () {
              res.render('thankyou');
            });

          });

        }).error(next);
      });
    }
  });
};

exports.cancelRegistration = function (req, res, next) {

  var removeTags = function (user, cb) {
    user.getTags().then(function (tags) {
      async.each(tags, function (tag, done) {
        req.app.get('database').model.TagsUsers.find({where: [ "TagId = " + tag.id + " AND UserId = " + user.id ]}).then(function (rel) {
          var vvv = rel.value;
          rel.destroy().then(function () {
            tag.decrement('count', { by: vvv}).then(function () {
              done();
            });
          });
        });
      }, function () {
        //req.app.get('database').model.Tag.findAll({where: {count: 0}}).then(function () {
        cb();
        //});
      });
    });
  };

  req.assert('token', 'Invalid Input.').notEmpty().isHexadecimal();

  if (req.validationErrors()) {
    next(new Error('Danke, aber wir konnten deine Eingabe nicht annehmen.'));
  }


  req.app.get('database').model.User.find({ where: { token: req.params.token } }).success(function (user) {
    if (!user) {
      next(new Error('Abmeldungs-Token ist ungültig oder abgelaufen.'));
    }

    removeTags(user, function () {
      user.destroy().success(function () {
        //req.app.get('database').sequelize.query("DELETE FROM Tags where count = 0").then(function(){
        res.render('cancel');
        //});
      });
    });
  });

};
