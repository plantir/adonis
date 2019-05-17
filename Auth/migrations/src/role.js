'use strict';

module.exports = {
  up: function() {
    this.create('roles', table => {
      table.increments();
      table
        .string('name', 254)
        .notNullable()
        .unique();
      table.boolean('is_deleted').defaultTo(false);
      table.timestamps();
    });
  },
  down: function() {
    this.drop('roles');
  }
};
