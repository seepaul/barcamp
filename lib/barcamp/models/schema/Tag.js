'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("Tag", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING(255),
    count: { type: DataTypes.INTEGER, defaultValue: 0 }
  });
};
