'use strict';
var logger = require('../logger'),
  async = require('async'),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  util = require('util'),
  config = require('config').email,
  addTags = function (req, tag1, tag2, tag3, user, cb) {
    var tagValues = [ 30, 20, 10];

    async.parallel([

      function (done) {
        req.app.get('database').model.Tag.findOrCreate({ where: {"name": tag1}}).success(function (item, created) {
          if (created) {
            item.count = tagValues[0];
            user.addTag(item);
            item.save().success(function () {
              done();
            }).failure(function (err) { cb(err); });
          } else {
            item.increment('count', tagValues[0]).success(function () {
              done();
            }).failure(function (err) { cb(err); });
          }
        }).failure(function (err) { cb(err); });
      },
      function (done) {
        req.app.get('database').model.Tag.findOrCreate({ where: {"name": tag2}}).success(function (item, created) {
          if (created) {
            item.count = tagValues[1];
            user.addTag(item);
            item.save().success(function () {
              done();
            }).failure(function (err) { cb(err); });
          } else {
            item.increment('count', tagValues[1]).success(function () {
              done();
            }).failure(function (err) { cb(err); });
          }
        }).failure(function (err) { cb(err); });
      },
      function (done) {
        req.app.get('database').model.Tag.findOrCreate({ where: {"name": tag3}}).success(function (item, created) {
          if (created) {
            item.count = tagValues[2];
            user.addTag(item);
            item.save().success(function () {
              done();
            }).failure(function (err) { cb(err); });
          } else {
            item.increment('count', tagValues[2]).success(function () {
              done();
            }).failure(function (err) { cb(err); });
          }
        }).failure(function (err) { cb(err); });
      }], function (err) {
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

    body = 'Sie haben sich zum BarCamp erfolgreich angemeldet.\n' +
      'Um sich wieder abzumelden verwenden Sie bitte folgenden Link:\n\n' +
      'http://barcamp.seepaul.org/cancel/' + token + '\n\n';

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

  req.assert('tag1', 'Invalid input').notEmpty().tag();
  req.assert('tag2', 'Invalid input').notEmpty().tag();
  req.assert('tag3', 'Invalid input').notEmpty().tag();

  if (req.validationErrors()) {
    next(new Error('Malformed input'));
  }

  addTags(req, req.body.tag1, req.body.tag2, req.body.tag3, null, function (err) {
    if (err) { next(err); }
    res.render('form');
  });
};

exports.doRegister = function (req, res, next) {

  console.log(req.body);

  req.assert('firstName', 'Invalid input.').notEmpty().validName();
  req.assert('lastName', 'Invalid input.').optional().validName();
  req.assert('email', 'Invalid input').notEmpty().isEmail();
  req.assert('tag1', 'Invalid input').notEmpty().tag();
  req.assert('tag2', 'Invalid input').notEmpty().tag();
  req.assert('tag3', 'Invalid input').notEmpty().tag();
  req.assert('preferredCamp').optional().isIn(['uxcamp', 'politcamp', 'startcamp', 'designcamp', 'appdevcamp', 'wissenscamp']);
  req.assert('gender').optional().isIn(['m', 'w', 'none']);
  req.assert('shirtSize').optional().isIn(['S', 'M', 'L', 'XL', 'none']);
  req.assert('note', 'Invalid input').optional();
  req.assert('children', 'Invalid input').optional();
  req.assert('newcomer', 'Invalid input').optional();

  req.assert('session_title').optional();
  req.assert('session_desc').optional();
  req.assert('day_one').optional();
  req.assert('day_two').optional();
  req.assert('day_three').optional();
  req.assert('twitter').optional();
  req.assert('facebook').optional();
  req.assert('google_plus').optional();
  req.assert('website').optional();


  var errors = req.validationErrors();

  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 400);
    return;
  }

  req.sanitize('email').normalizeEmail();

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
};

exports.cancelRegistration = function (req, res, next) {

  req.assert('token', 'Invalid Input.').notEmpty().isHexadecimal();

  if (req.validationErrors()) {
    next(new Error('Malformed input'));
  }

  req.app.get('database').model.User.find({ where: { token: req.params.token } }).success(function (user) {
    if (!user) {
      next(new Error('Password reset token is invalid or has expired.'));
    }

    user.destroy().success(function () {
      res.render('cancel');
    });

  });

};
