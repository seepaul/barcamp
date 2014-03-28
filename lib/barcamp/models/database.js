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

    ready();
  });
};

p.init = function () {
  // TODO: make smart migration
  var self = this;
  this.sequelize.sync({
    force: true
  }).success(function () {
    self.loadFixtures(function () {
      console.log("syncinc db complete");
    });
  }).error(function (err) {
    console.log("syncing of db failed: " + err);
  });
};

p.loadFixtures = function (next) {
  var self = this;
  /*jslint nomen: true*/
  sequelize_fixtures.loadFiles([__dirname + '/fixtures/sampleUsers.json'], self.model, function () {
    //sequelize_fixtures.loadFiles([__dirname + '/fixtures/sampleTags.json'], self.model, function () {
    /*jslint nomen: false*/
    logger.info('Loaded fixtures');
    next();
    //});
  });
};

p.loadSampleData = function (sampleData) {
  var self = this;
  self.model.User.find(1).success(function (u) {
    async.eachSeries(sampleData, function (mat, mdone) {
      self.model.Material.findOrCreate({ "name": mat.Material.name}).success(function (mat_obj) {
        mat_obj.setUser(u);
        async.eachSeries(mat.Material.Measurements, function (mm, mmdone) {
          self.model.Measurement.findOrCreate({"time": new Date(mm.time)}).success(function (mm_obj) {
            mm_obj.setMaterial(mat_obj);
            mm_obj.setUser(u);
            async.eachSeries(mm.MeasurementData, function (md, mddone) {
              self.model.MeasurementData.findOrCreate(md).success(function (md_obj) {
                md_obj.setMeasurement(mm_obj);
                mddone();
              });
            }, function () {mmdone(); });
          });
        }, function () {mdone(); });
      });
    });
  });
};

module.exports = new Database();
