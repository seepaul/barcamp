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
        name: DataTypes.STRING(255),
        count: { type: DataTypes.INTEGER, defaultValue: 0 },
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
