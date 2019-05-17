'use strict';
const { ServiceProvider } = require('@adonisjs/fold');
class HelperProvider extends ServiceProvider {
  register() {
    this.app.alias('vrwebdesign-adonis/Helper/src/Resource', 'Resource');
    this.app.alias('vrwebdesign-adonis/Helper/src/Token', 'Token');
  }
}

module.exports = HelperProvider;
