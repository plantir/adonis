'use strict';

module.exports = {
  up: function() {
    this.create('tokens', table => {
      table.increments();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table
        .string('token', 255)
        .notNullable()
        .unique()
        .index();
      table.string('type', 80).notNullable();
      table.boolean('is_revoked').defaultTo(false);
      table.timestamps();
    });
  },
  down: function() {
    this.drop('tokens');
  }
};
