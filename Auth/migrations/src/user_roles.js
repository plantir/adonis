'use strict';

module.exports = {
  up: function() {
    this.create('user_roles', table => {
      table.increments();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table
        .integer('role_id')
        .unsigned()
        .references('id')
        .inTable('roles');
      table.boolean('is_deleted').defaultTo(false);
      table.timestamps();
    });
  },
  down: function() {
    this.drop('user_roles');
  }
};
