'use strict';

/*
 * adonis-SMS
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const { ServiceProvider } = require('@adonisjs/fold');

class SMSProvider extends ServiceProvider {
  register() {
    this.app.singleton('Adonis/Addons/SMS', app => {
      // const View = app.use('Adonis/Src/View');
      const Config = app.use('Adonis/Src/Config');
      const SMS = require('./src/SMS');
      return new SMS(Config, View);
    });
    this.app.alias('Adonis/Addons/SMS', 'SMS');
  }
}

module.exports = SMSProvider;
