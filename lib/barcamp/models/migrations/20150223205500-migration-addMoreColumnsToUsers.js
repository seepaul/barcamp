'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    // logic for transforming into the new state

    migration.addColumn(
      'Users',
      'gender',
      DataTypes.ENUM('m', 'w', 'none')
    ).complete(
      function () {
        migration.addColumn(
          'Users',
          'session_title',
          DataTypes.STRING(255)
        ).complete(
          function () {
            migration.addColumn(
              'Users',
              'session_desc',
              DataTypes.TEXT
            ).complete(
              function () {
                migration.addColumn(
                  'Users',
                  'day_one',
                  DataTypes.BOOLEAN
                ).complete(
                  function () {
                    migration.addColumn(
                      'Users',
                      'day_two',
                      DataTypes.BOOLEAN
                    ).complete(
                      function () {
                        migration.addColumn(
                          'Users',
                          'day_three',
                          DataTypes.BOOLEAN
                        ).complete(
                          function () {
                            migration.addColumn(
                              'Users',
                              'twitter',
                              DataTypes.STRING(255)
                            ).complete(
                              function () {
                                migration.addColumn(
                                  'Users',
                                  'facebook',
                                  DataTypes.STRING(255)
                                ).complete(
                                  function () {
                                    migration.addColumn(
                                      'Users',
                                      'google_plus',
                                      DataTypes.STRING(255)
                                    ).complete(
                                      function () {
                                        migration.addColumn(
                                          'Users',
                                          'website',
                                          DataTypes.STRING(255)
                                        ).complete(done);
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );

  }
};
