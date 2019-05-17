'use strict';

module.exports = {
  up: function() {
    this.create('users', table => {
      table.increments();
      table
        .string('username', 80)
        .notNullable()
        .unique();
      table
        .string('email', 254)
        .notNullable()
        .unique();
      table.string('password', 60).notNullable();
      table.boolean('is_deleted').defaultTo(false);
      table.timestamps();
    });
  },
  down: function() {
    this.drop('users');
  }
};
