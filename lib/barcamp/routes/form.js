/*
 * BRS Form Controller
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

'use strict';
var logger = require('../logger'),
  async = require('async'),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  util = require('util'),
  utils = require('../utils.js'),
  config = require('config'),
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
  welcomeEmail = function (to, token, display_name, done) {

    var options = {},
      smtpTransport,
      body;
    options.host = config.email.smtpHost;
    options.secureConnection = config.email.secureConnection;
    options.port = config.email.port;
    if (config.email.auth) {
      options.auth = config.email.auth;
    }

    smtpTransport = nodemailer.createTransport("SMTP", options);

    body = 'Hallo ' + display_name + ',\n\nDu hast dich erfolgreich zum BarCamp Graz 2015 angemeldet.\n' +
      'Um dich wieder abzumelden verwende bitte folgenden Link:\n\n' +
      'http://' + config.general.host  + '/areyousure/' + token + '\n\n';

    smtpTransport.sendMail({
      from: config.email.sender,
      to: to,
      subject: config.email.subjectWelcome,
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
  },
  cancelEmail = function (to, token, done) {

    var options = {},
      smtpTransport,
      body;
    options.host = config.email.smtpHost;
    options.secureConnection = config.email.secureConnection;
    options.port = config.email.port;
    if (config.email.auth) {
      options.auth = config.email.auth;
    }

    smtpTransport = nodemailer.createTransport("SMTP", options);

    body = 'Du möchtest dich vom BarCamp Graz 2015 abmelden.\n' +
      'Um dich abzumelden verwende bitte folgenden Link:\n\n' +
      'http://' + config.general.host + '/areyousure/' + token + '\n\n';

    smtpTransport.sendMail({
      from: config.email.sender,
      to: to,
      subject: config.email.subjectGoodbye,
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

  req.assert('firstName', 'Ungültiger Vorname').notEmpty().validName().isLength(3, 36);
  req.assert('lastName', 'Ungültiger Nachname').optional().validName().isLength(3, 36);
  req.assert('email', 'Ungültige Email Adresse').notEmpty().isEmail().isLength(3, 128);
  req.assert('tag1', 'Ungültiger Tag #1').notEmpty().tag().isLength(2, 36);
  req.assert('tag2', 'Ungültiger Tag #2').notEmpty().tag().isLength(2, 36);
  req.assert('tag3', 'Ungültiger Tag #3').notEmpty().tag().isLength(2, 36);
  req.assert('preferredCamp').optional().isIn(['none', 'uxcamp', 'politcamp', 'startcamp', 'designcamp', 'appdevcamp', 'wissenscamp']);
  req.assert('gender').optional().isIn(['m', 'w', 'none']);
  req.assert('shirtSize').optional().isIn(['S', 'M', 'L', 'XL', 'none']);

  req.assert('children').optional().equals('true');
  req.assert('newcomer').optional().equals('true');

  req.assert('session_title', 'Bitte überprüfe deinen Sessionvorschlags Titel').optional().isLength(0, 256);
  if (req.body.session_title) {
    req.assert('session_title', 'Bitte überprüfe deinen Sessionvorschlags Titel').optional().isLatin1();
  }
  req.assert('session_desc', 'Bitte überprüfe deinen Sessionvorschlags Beschreibung').optional().isLength(0, 768);
  if (req.body.session_desc) {
    req.assert('session_desc', 'Bitte überprüfe deinen Sessionvorschlags Beschreibung').optional().isLatin1();
  }
  req.assert('day_one').optional().equals('true');
  req.assert('day_two').optional().equals('true');
  req.assert('day_three').optional().equals('true');
  req.assert('twitter', 'Ungültiger Twitter Username').optional().twitterUsername();
  req.assert('facebook', 'Ungültiger Facebook Username').optional().facebookUsername();
  req.assert('google_plus', 'Ungültiger Google Plus Username').optional().isLatin1().isLength(0, 256);
  req.assert('website', 'Ungültige Angabe bei Website').optional().isURL().isLength(0, 256);

  req.assert('note', 'Bitte überprüfe deine Anmerkung').optional().isLength(0, 768);

  if (req.body.note) {
    req.assert('note', 'Bitte überprüfe deine Anmerkung').optional().isLatin1();
  }

  req.assert('accept', 'Du musst die BarCamp Charta akzeptieren').equals('true');
  req.assert('help', 'Du musst das BarCamp Prinzip akzeptieren').equals('true');

  var errors = req.validationErrors(),
    validationError = new Error('Danke, aber wir konnten deine Eingabe nicht annehmen.'),
    alreadyRegisteredEmailError = new Error('Die Email Adresse wurde bereits für eine Anmeldung verwendet. Bitte verwende eine andere Adresse oder melde dich vor erneutem Anmelden mit dem Link in der Bestätigungs-Email ab.'),
    display_name;

  validationError.status = 403;
  alreadyRegisteredEmailError.status = 403;

  if (errors) {
    validationError.message = errors[0].msg;
    return next(validationError);
  }

  req.sanitize('email').normalizeEmail();

  req.app.get('database').model.User.findAll({ where: {email: req.body.email}}).success(function (users) {

    if (users.length > 0) {
      return next(alreadyRegisteredEmailError);
    }

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

          display_name = req.body.firstName;
          if (req.body.lastName) {
            display_name += ' ' + req.body.lastName;
          }
          welcomeEmail(req.body.email, token, display_name, function () {
            res.render('thankyou');
          });

        });

      }).error(next);
    });
  });
};

exports.cancelRegistration = function (req, res, next) {

  var removeTags = function (user, cb) {
    //user.getTags().then(function (tags) {
    req.app.get('database').model.TagsUsers.findAll({where: {UserId: user.id}}).then(function (rels) {

      async.each(rels, function (rel, done) {
        var vvv = rel.value;
        req.app.get('database').model.Tag.find({where: {id: rel.TagId}}).then(function (tag) {
          tag.decrement('count', { by: vvv}).then(function () {
            done();
          });
        });
      }, function () {
        //req.app.get('database').model.Tag.findAll({where: {count: 0}}).then(function () {
        req.app.get('database').model.TagsUsers.destroy({where: {UserId: user.id}}).then(function () {
          cb();
        });
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
        req.app.get('database').sequelize.query("DELETE FROM Tags where count = 0").then(function () {
          res.render('cancel');
        });
      });
    });
  });

};

exports.sendCancelMail = function (req, res, next) {

  req.assert('cancel_email', 'Invalid Input.').notEmpty().isEmail();

  if (req.validationErrors()) {
    next(new Error('Danke, aber wir konnten deine Eingabe nicht annehmen.'));
  }

  var cancel_email = req.body.cancel_email,
    user =  req.app.get('database').model.User.find({ where: {email: cancel_email}}),
    token = user.token;

  cancelEmail(cancel_email, token, function () {
    res.render('cancelemailsent');
  });

};

exports.setOrgaUserPassword = function (req, res, next) {
  req.app.get('database').model.User.find({ where: { username: 'barcamp' } }).success(function (user) {
    crypto.randomBytes(4, function (err, buf) {
      if (err) { next(err); }
      var token = buf.toString('hex');
      user.password = token;
      user.save({fields: ['password']}).then(function () {
        console.log('Orga User Password is "' + token + '"');
        res.status(200).end();
      });
    });
  });
};

exports.nameTagList = function (req, res) {

  var csv = "firstName;lastName;tag1;tag2;tag3\n";
  req.app.get('database').model.User.findAll(
    {
      where: {password: null},
      include: [{ model: req.app.get('database').model.Tag, attributes: ['name']}],
      attributes: ['firstName', 'lastName']
    }
  ).success(function (users) {
    async.eachSeries(users, function (user, done) {
      //row += 1;
      //csv += row + ";" + user.firstName + ";" + user.lastName;
      csv += user.firstName + ";" + user.lastName;
      if (user.Tags[0]) {
        csv += ";" + user.Tags[0].name;
      }
      if (user.Tags[1]) {
        csv += ";" + user.Tags[1].name;
      }
      if (user.Tags[2]) {
        csv += ";" + user.Tags[2].name;
      }
      csv += "\n";
      done();
    }, function () {
      res.type('text/csv');
      res.send(csv);
    });
  });
};

exports.sendReminder = function (req, res) {

  var options = {
      host: config.email.smtpHost,
      secureConnection: config.email.secureConnection,
      port: config.email.port
    },
    smtpTransport = nodemailer.createTransport("SMTP", options),
    objects = [],
    testToken = "aaabbbccc123",
    sendFcnt = function (transport, subject, objects) {
      console.log("Length: " + objects.length);

      async.eachSeries(objects, function (item, cb) {
        transport.sendMail({
          from: config.email.sender,
          to: item.to,
          subject: subject,
          text: item.body
        }, function (error, response) {
          if (error) {
            console.log(null, error);
            cb(error);
          } else {
            console.log("+1");
            cb(null, response);
          }
        });
      }, function (err, results) {
        smtpTransport.close();
        if (err) {
          res.send("done" + JSON.stringify(err));
        } else {
          res.send("done\n\n" + JSON.stringify(results));
        }
      });
    };

  if (config.email.auth) {
    options.auth = config.email.auth;
  }

  if (req.body.testmail) {


    if (req.body.links) {
      objects.push({
        body: req.body.text + '\n\nHier abmelden: http://' + config.general.host + '/areyousure/' + testToken + '\n\n',
        to: "me@seepaul.org"
      });
    } else {
      objects.push({
        body: req.body.text,
        to: "me@seepaul.org"
      });
    }
    sendFcnt(smtpTransport, req.body.subject, objects);
  } else {
    if (req.body.links) {
      req.app.get('database').model.User.findAll({
        where: {password: null},
        attributes: ['email', 'token']
      }).success(function (users) {
        async.eachSeries(users, function (user, done) {
          objects.push({
            body: req.body.text + '\n\nHier abmelden: http://' + config.general.host + '/areyousure/' + user.token + '\n\n',
            to: user.email
          });
          done();
        }, function () {
          sendFcnt(smtpTransport, req.body.subject, objects);
        });
      });
    } else {
      req.app.get('database').model.User.findAll({
        where: {password: null},
        attributes: ['email', 'token']
      }).success(function (users) {
        async.eachSeries(users, function (user, done) {
          objects.push({
            body: req.body.text,
            to: user.email
          });
          done();
        }, function () {
          sendFcnt(smtpTransport, req.body.subject, objects);
        });
      });
    }
  }
};

exports.attendeeList = function (req, res) {

  var csv = "firstName;lastName;shirtSize;newcomer\n";
  req.app.get('database').model.User.findAll(
    {
      where: {password: null},
      attributes: ['firstName', 'lastName', 'shirtSize', 'newcomer']
    }
  ).success(function (users) {
    async.eachSeries(users, function (user, done) {
      //row += 1;
      csv += user.firstName + ";" + user.lastName + ";" + user.shirtSize + ";" + user.newcomer;
      csv += "\n";
      done();
    }, function () {
      res.type('text/csv');
      res.send(csv);
    });
  });
};
