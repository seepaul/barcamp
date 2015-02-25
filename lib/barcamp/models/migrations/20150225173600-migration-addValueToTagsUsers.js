'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    // logic for transforming into the new state

    migration.addColumn(
      'TagsUsers',
      'value',
      DataTypes.INTEGER
    ).complete(done);

  }
};
