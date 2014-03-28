'use strict';
var logger = require('../logger'),
  async = require('async');

exports.add = function (req, res) {

  var tags = req.body,
    tagValues = [ 30, 20, 10];
  logger.info('Adding tags: ' + JSON.stringify(tags));

  if (tags.tag1) {
    req.app.get('database').model.Tag.findOrCreate({"name": tags.tag1}).success(function (item) {
      item.increment('count', tagValues[0]).failure(function (err) {res.send('Error: An error has occurred' + JSON.stringify(err)); });
    })
      .failure(function (err) {res.send('Error: An error has occurred' + JSON.stringify(err)); });
  }

  if (tags.tag2) {
    req.app.get('database').model.Tag.findOrCreate({"name": tags.tag2}).success(function (item) {
      item.increment('count', tagValues[1]).failure(function (err) {res.send('Error: An error has occurred' + JSON.stringify(err)); });
    })
      .failure(function (err) {res.send('Error: An error has occurred' + JSON.stringify(err)); });
  }

  if (tags.tag3) {
    req.app.get('database').model.Tag.findOrCreate({"name": tags.tag3}).success(function (item) {
      item.increment('count', tagValues[2]).failure(function (err) {res.send('Error: An error has occurred' + JSON.stringify(err)); });
    })
      .failure(function (err) {res.send('Error: An error has occurred' + JSON.stringify(err)); });
  }

  res.render('form');
};
