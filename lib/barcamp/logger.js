/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
'use strict';
var log4js = require('log4js');
var path = require('path');
var config = require('config').logger;
var utils = require('./utils.js');

function Logger() {
  //constructor
  log4js.configure(config);
  this.clog = log4js.getLogger('file');
  this.mlog = log4js.getLogger('mail');

  this.clog.setLevel(config.clevel);
  this.mlog.setLevel(config.mlevel);

  this.connectLogger = log4js.connectLogger(this.clog, {
    level: log4js.levels.DEBUG
  });

}
var p = Logger.prototype;

p.info = function (msg) {
  this.clog.info(msg);
  this.mlog.info(msg);
};

p.debug = function (msg) {
  this.clog.debug(msg);
  this.mlog.debug(msg);
};
p.trace = function (msg) {
  this.clog.trace(msg);
  this.mlog.trace(msg);
};
p.warn = function (msg) {
  this.clog.warn(msg);
  this.mlog.warn(msg);
};
p.error = function (msg) {
  this.clog.error(msg);
  this.mlog.error(msg);
};
p.fatal = function (msg) {
  this.clog.fatal(msg);
  this.mlog.fatal(msg);
};

p.dump = function (obj) {
  this.clog.info("%o", obj);
};

/*jslint unparam:false*/
p.logErrors = function logErrors(err, req, res, next) {
  /*jslint unparam:true*/
  req.app.get('logger').error('error on request ' + req.method + ' ' + req.url + ': ' + err.message + '\n' + err.stack);// JSON.stringify(err, utils.myCensor(err), 2));
  if (err.domain) {
    process.exit();
    //you should think about gracefully stopping & respawning your server
    //since an unhandled error might put your application into an unknown state
    // TODO: restarting with forever does this job quite well for now
  }
  next(err);
};

p.clientErrorHandler = function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: err.message });
  } else {
    next(err);
  }
};

/*jslint unparam:false*/
p.errorHandler = function errorHandler(err, req, res, next) {
  /*jslint unparam:true*/
  //res.status(500);
  res.render('error', { error: err });
};

module.exports = new Logger();
