'use strict';
class TokenGenerator {
  static generate(digits = 6) {
    let token = (
      Math.floor(Math.random() * 10 * parseInt(digits)) +
      10 * parseInt(digits)
    )
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
