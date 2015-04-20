/*
 * logger.js - BRS Logger
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
  req.app.get('logger').error('error on request ' + req.method + ' ' + req.url + ': ' + err.message + '\n' + err.stack);
  if (err.domain) {
    process.exit();
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
  res.status(err.status || 500);
  res.render('oops', { error: err });
  next(err);
};

module.exports = new Logger();
