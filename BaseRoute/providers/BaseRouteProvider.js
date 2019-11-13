'use strict';
const { ServiceProvider } = require('@adonisjs/fold');

class BaseRouteProvider extends ServiceProvider {
  register() {
    this.app.singleton('vrwebdesign-adonis/Helper/BaseRoute', app => {
      const Route = use('Route');
      Route.customResource = (name, controller) => {
        let resources = Route.resource(name, controller)
        resources._addRoute('recycle', `${resources._resourceUrl}/:id/recycle`, ['PUT', 'PATCH'])
        resources._addRoute('chart', `${resources._resourceUrl}/chart`, ['POST'])
      }
      return Route
    });
    this.app.alias('vrwebdesign-adonis/Helper/BaseRoute', 'BaseRoute');
  }
}

module.exports = BaseRouteProvider;
