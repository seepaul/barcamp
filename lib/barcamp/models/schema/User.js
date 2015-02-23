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
        if (value) {
          var user = this,
            SALT_FACTOR = 5;

          return bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
            if (err) {
              logger.error(err);
            }
            return bcrypt.hash(value, salt, null, function (err, hash) {
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
        return [this.firstname, this.lastname].join(' ');
      },
      getWikiName: function () {
        return [this.firstname, this.lastname].join('');
      }
    }
  });
};
