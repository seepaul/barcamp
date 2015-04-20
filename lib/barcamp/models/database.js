/*
 * database.js - BRS Database Model
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
var Sequelize = require('sequelize');
var config = require('config').database; // we use node-config to handle environments
var logger = require('../logger');
var fs = require('fs');
var path = require('path');
var sequelize_fixtures = require('sequelize-fixtures');
var async = require('async');
var utils = require('../utils.js');

function Database() {
  var self = this;
  this.model = {};

  this.sequelize = new Sequelize(
    config.name,
    config.username,
    config.password,
    { dialect: 'mysql',
      logging: function (msg) {logger.debug(msg); } }
  );

  this.loadModels(function () {
    self.init();
  });
}
var p = Database.prototype;

p.loadModels = function (ready) {
  /*jslint nomen: true*/
  var self = this,
    models_path = __dirname + '/schema/',
    model_files;

  /*jslint nomen: false*/
  fs.readdir(models_path, function (err, files) {
    if (err) { throw new Error(err.message); }
    model_files = files;

    if (model_files) {
      model_files.forEach(function (file) {
        var fileExt = path.extname(file),
          fileName = path.basename(file, fileExt),
          fileNameFormatted = fileName.substring(0, 1).toUpperCase() + fileName.substring(1, fileName.length);
        logger.info('Loading db schema ' + fileNameFormatted);
        self.model[fileNameFormatted] = self.sequelize.import(models_path + '/' + fileName.toString());
      });
    }

    self.model.User.belongsToMany(self.model.Tag, { through: 'TagsUsers', onDelete: 'NO ACTION', constraints: false});
    self.model.Tag.belongsToMany(self.model.User, { through: 'TagsUsers', onDelete: 'NO ACTION', constraints: false});

    ready();
  });
};

p.init = function () {
  /*jslint nomen: true*/
  var self = this,
    migrator = self.sequelize.getMigrator({
      path:  __dirname + '/migrations',
      filesFilter: /\.js$/
    });
  /*jslint nomen: false*/

  if (!utils.developmentEnvironment()) {

    migrator.migrate().success(function () {
      console.log('The migrations have been executed!');
    }).error(function (err) {
      logger.error('An error occured during db migration' + err);
    });
  } else {
    this.sequelize.sync({
      force: true
    }).success(function () {
      self.loadFixtures(function () {
        console.log("syncinc db complete");
      });
    }).error(function (err) {
      console.log("syncing of db failed: " + err);
    });
  }

};

p.loadFixtures = function (next) {
  var self = this;
  /*jslint nomen: true*/
  try {
    sequelize_fixtures.loadFiles([__dirname + '/fixtures/sampleUsers.json'], self.model, function () {
      /*jslint nomen: false*/
      logger.info('Loaded fixtures');
      next();
    });

  } catch (err) {
    console.log(err);
  }
};

module.exports = new Database();
