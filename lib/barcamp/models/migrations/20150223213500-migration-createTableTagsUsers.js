'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    // logic for transforming into the new state

    migration.createTable("TagsUsers",
      {
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        TagId: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          primaryKey: true
        },
        UserId: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          primaryKey: true
        }
      }
      ).complete(done);
  }
};
