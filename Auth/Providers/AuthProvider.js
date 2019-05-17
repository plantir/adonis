'use strict';
const { ServiceProvider } = require('@adonisjs/fold');
class AuthProvider extends ServiceProvider {
  register() {
    this.app.bind('App/vrwebdesign-adonis/auth', () => {
      const Controller = require('vrwebdesign-adonis/auth/Controllers/AuthController');
      const User = use('App/Models/User');
      return new Controller(User);
    });
  }

  boot() {
    /** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
    const Route = use('Adonis/Src/Route');
    Route.group(() => {
      Route.get('register', 'App/vrwebdesign-adonis/auth.register');
      Route.get('login', 'App/vrwebdesign-adonis/auth.login');
    }).prefix('auth');
  }
}

module.exports = AuthProvider;
