'use strict';
const User = use('App/Models/User');
class Role {
  async handle({ request, auth, response }, next, roles) {
    // call next to advance the request
    let user = await auth.getUser();
    let role = await user.role().fetch();
    user = user.toJSON();
    let hasRole = roles.indexOf(role.name);
    if (!user || hasRole === -1) {
      response.status(403).send('permision denid');
      return;
    }
    await next();
  }
}

module.exports = Role;
