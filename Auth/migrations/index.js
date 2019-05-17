'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
let user = require('./src/user');
let token = require('./src/token');
let role = require('./src/role');
let user_roles = require('./src/user_roles');
class AuthSchema extends Schema {
  up() {
    role.up.bind(this)();
    user.up.bind(this)();
    user_roles.up.bind(this)();
    token.up.bind(this)();
  }

  down() {
    user_roles.down.bind(this)();
    role.down.bind(this)();
    token.down.bind(this)();
    user.down.bind(this)();
  }
}

module.exports = AuthSchema;
