'use strict';
class TokenGenerator {
  static generate() {
    let token = (Math.floor(Math.random() * 1000000) + 1000000)
      .toString()
      .substring(1);
    return token;
  }
  static uid() {
    var length = 14;
    let token = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      token += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return token;
  }
}

module.exports = TokenGenerator;
