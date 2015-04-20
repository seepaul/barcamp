/*
 * BRS Migration File
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
