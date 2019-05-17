'use strict';
class AuthController {
  constructor(User) {
    this.User = User;
  }
  async login({ request, auth, response }) {
    let user = await this.User.query().first();
    return await auth.generate(user);
  }
  async register({ req }) {
    return 'register';
  }
}

module.exports = AuthController;
