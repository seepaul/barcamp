'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('TagsUsers', {
    value: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
};
