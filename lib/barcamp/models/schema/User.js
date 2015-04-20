/*
 * BRS Schema File
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

var bcrypt = require('bcrypt-nodejs'),
  logger = ('../../logger');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(255),
      unique: true
    },
    firstName: DataTypes.STRING(255),
    lastName: DataTypes.STRING(255),
    password: {
      type: DataTypes.STRING(255),
      set: function (value) {
        console.log('setting password to ' + value);
        if (value) {
          var user = this,
            SALT_FACTOR = 5;

          return bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
            if (err) {
              logger.error(err);
            }
            return bcrypt.hash(value, salt, null, function (err, hash) {
              console.log('setting password hash to ' + hash);
              user.setDataValue('password', hash);
              if (err) {
                logger.error(err);
              }
            });
          });
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Email address must be valid.'
        }
      }
    },
    token: DataTypes.STRING(255),
    preferredCamp: DataTypes.STRING(255),
    shirtSize: DataTypes.ENUM('S', 'M', 'L', 'XL', 'none'),
    note: DataTypes.TEXT,
    children: DataTypes.BOOLEAN,
    newcomer: DataTypes.BOOLEAN,
    gender: DataTypes.ENUM('m', 'w', 'none'),
    session_title: DataTypes.STRING(255),
    session_desc: DataTypes.TEXT,
    day_one: DataTypes.BOOLEAN,
    day_two: DataTypes.BOOLEAN,
    day_three: DataTypes.BOOLEAN,
    twitter: DataTypes.STRING(255),
    facebook: DataTypes.STRING(255),
    google_plus: DataTypes.STRING(255),
    website: DataTypes.STRING(255)
  }, {
    instanceMethods: {
      verifyPassword : function (password, done) {
        return bcrypt.compare(password, this.getDataValue('password'), function (err, isMatch) {
          return done(err, isMatch);
        });
      },
      getFullname: function () {
        return [this.firstName, this.lastName].join(' ');
      },
      getWikiName: function () {
        return [this.firstName, this.lastName].join('');
      }
    }
  });
};
