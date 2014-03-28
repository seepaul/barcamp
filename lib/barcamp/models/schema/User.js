'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: DataTypes.STRING(255),
    firstName: DataTypes.STRING(255),
    lastName: DataTypes.STRING(255),
    password: DataTypes.STRING(255)
  });
};
