'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    // logic for transforming into the new state

    migration.createTable("Users",
      {
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
        password: DataTypes.STRING(255),
        email: {
          type: DataTypes.STRING(255),
          unique: true,
          allowNull: true
        },
        token: DataTypes.STRING(255),
        preferredCamp: DataTypes.STRING(255),
        shirtSize: DataTypes.ENUM('S', 'M', 'L', 'XL', 'none'),
        note: DataTypes.TEXT,
        children: DataTypes.BOOLEAN,
        newcomer: DataTypes.BOOLEAN,
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }
      ).complete(done);
  }
};
